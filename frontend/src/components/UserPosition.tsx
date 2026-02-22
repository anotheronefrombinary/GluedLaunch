'use client';

import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { GLUED_TOKEN_ABI } from '@/contracts/abi';
import { formatTokenAmount } from '@/lib/formatTokens';

interface UserPositionProps {
  tokenAddress: string;
  tokenSymbol?: string;
  floorPrice: bigint;
  currentPrice: bigint;
  totalSupply: bigint;
  collateralBalance: bigint;
}

export function UserPosition({
  tokenAddress,
  tokenSymbol,
  floorPrice,
  currentPrice,
  totalSupply,
  collateralBalance,
}: UserPositionProps) {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: GLUED_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { refetchInterval: 5_000 },
  });

  if (!isConnected || !balance || balance === 0n) return null;

  const isLegacy = totalSupply > 10n ** 15n;
  const balanceNum = isLegacy ? Number(formatEther(balance)) : Number(balance);
  const supplyNum = isLegacy ? Number(formatEther(totalSupply)) : Number(totalSupply);
  const currentValue = balanceNum * Number(formatEther(currentPrice));

  // Floor price = collateral / supply (computed directly, contract value has scaling issues for raw-supply tokens)
  const collateralETH = Number(formatEther(collateralBalance));
  const computedFloorPrice = supplyNum > 0 ? collateralETH / supplyNum : 0;
  const floorValue = balanceNum * computedFloorPrice;

  // Calculate redeemable ETH (what you'd get from burning, minus fees)
  const shareOfSupply = supplyNum > 0 ? balanceNum / supplyNum : 0;
  const grossRedeemable = collateralETH * shareOfSupply;
  const netRedeemable = grossRedeemable * (1 - 0.001 - 0.02); // minus protocol + platform fee

  return (
    <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f2' }}>Your Position</h3>
      <div className="space-y-2.5">
        <div className="flex justify-between text-sm">
          <span style={{ color: '#5c5e69' }}>Balance</span>
          <span className="font-mono font-bold" style={{ color: '#f0f0f2' }}>
            {balanceNum.toLocaleString()} {tokenSymbol || ''}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#5c5e69' }}>Current Value</span>
          <span className="font-mono" style={{ color: '#00c2ff' }}>
            {currentValue < 0.001 ? currentValue.toFixed(8) : currentValue.toFixed(4)} ETH
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#5c5e69' }}>Floor Value</span>
          <span className="font-mono" style={{ color: '#00e87b' }}>
            {floorValue < 0.001 ? floorValue.toFixed(8) : floorValue.toFixed(4)} ETH
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #1e2028' }}>
          <span style={{ color: '#5c5e69' }}>Redeemable (net fees)</span>
          <span className="font-mono font-bold" style={{ color: '#00e87b' }}>
            {netRedeemable < 0.001 ? netRedeemable.toFixed(8) : netRedeemable.toFixed(4)} ETH
          </span>
        </div>
      </div>
    </div>
  );
}
