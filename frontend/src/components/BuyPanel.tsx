'use client';

import { useState, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { GLUED_LAUNCH_ABI } from '@/contracts/abi';
import { getContractAddress } from '@/contracts/addresses';
import { formatTokenAmount } from '@/lib/formatTokens';

interface BuyPanelProps {
  tokenAddress: string;
  tokensSold: bigint;
  tokensForSale: bigint;
  basePrice: bigint;
  priceIncrement: bigint;
  saleActive: boolean;
}

export function BuyPanel({
  tokenAddress,
  tokensSold,
  tokensForSale,
  basePrice,
  priceIncrement,
  saleActive,
}: BuyPanelProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [ethAmount, setEthAmount] = useState('0.01');
  const [slippage, setSlippage] = useState(5);

  const contractAddress = getContractAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Use the contract's own view function for accurate token estimation
  const ethWei = useMemo(() => {
    try { return parseEther(ethAmount || '0'); } catch { return 0n; }
  }, [ethAmount]);

  const { data: calcResult } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GLUED_LAUNCH_ABI,
    functionName: 'calculateTokensForETH',
    args: [tokenAddress as `0x${string}`, ethWei],
    query: { enabled: ethWei > 0n && saleActive },
  });

  const estimatedTokens = (calcResult as readonly [bigint, bigint] | undefined)?.[0] ?? 0n;
  const minTokens = (estimatedTokens * BigInt(100 - slippage)) / 100n;

  const currentPrice = basePrice + priceIncrement * tokensSold;
  const priceAfterBuy = basePrice + priceIncrement * (tokensSold + estimatedTokens);

  const handleBuy = () => {
    if (!isConnected) return;

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: GLUED_LAUNCH_ABI,
      functionName: 'buyTokens',
      args: [tokenAddress as `0x${string}`, minTokens],
      value: ethWei,
      gas: 1_000_000n,
    });
  };

  const tokensRemaining = tokensForSale - tokensSold;

  const presetAmounts = ['0.01', '0.05', '0.1', '0.5'];

  return (
    <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
      <h3 className="text-base font-bold mb-4" style={{ color: '#f0f0f2' }}>Buy Tokens</h3>

      {!saleActive ? (
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: '#5c5e69' }}>Sale has ended</p>
          <p className="text-xs mt-1" style={{ color: '#5c5e69' }}>
            You can still trade on secondary markets or burn for collateral
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
                Amount (ETH)
              </label>
              <input
                type="text"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.01"
                className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-1 focus:ring-[#00e87b] focus:border-[#00e87b40]"
                style={{ background: '#16171c', border: '1px solid #1e2028', color: '#f0f0f2' }}
              />
              <div className="flex gap-2 mt-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setEthAmount(amount)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors"
                    style={{
                      background: ethAmount === amount ? '#00e87b15' : '#16171c',
                      border: `1px solid ${ethAmount === amount ? '#00e87b30' : '#1e2028'}`,
                      color: ethAmount === amount ? '#00e87b' : '#5c5e69',
                    }}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg p-4 space-y-2" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5c5e69' }}>Estimated Tokens</span>
                <span className="font-mono" style={{ color: '#f0f0f2' }}>
                  {formatTokenAmount(estimatedTokens, tokensForSale)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5c5e69' }}>Min Tokens (slippage)</span>
                <span className="font-mono" style={{ color: '#8b8d97' }}>
                  {formatTokenAmount(minTokens, tokensForSale)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5c5e69' }}>Current Price</span>
                <span className="font-mono" style={{ color: '#00e87b' }}>
                  {Number(formatEther(currentPrice)).toFixed(10)} ETH
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#5c5e69' }}>Price After Buy</span>
                <span className="font-mono" style={{ color: '#00c2ff' }}>
                  {Number(formatEther(priceAfterBuy)).toFixed(10)} ETH
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium" style={{ color: '#5c5e69' }}>
                  Slippage Tolerance
                </label>
                <span className="text-xs font-mono font-bold" style={{ color: '#00e87b' }}>{slippage}%</span>
              </div>
              <input
                type="range"
                value={slippage}
                onChange={(e) => setSlippage(parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full"
              />
            </div>

            <div className="text-xs font-mono" style={{ color: '#5c5e69' }}>
              Remaining: {formatTokenAmount(tokensRemaining, tokensForSale)} tokens
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#fca5a5' }}>
              {error.message.includes('User rejected') || error.message.includes('denied')
                ? 'Transaction cancelled'
                : `Error: ${error.message}`}
            </div>
          )}

          {isSuccess && (
            <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#00e87b15', border: '1px solid #00e87b30', color: '#86efac' }}>
              Purchase successful! Check your wallet for tokens.
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={!isConnected || isPending || isConfirming || !saleActive}
            className="mt-4 w-full py-3 px-6 font-semibold text-sm rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, #00e87b, #00c2ff)', color: '#0b0c0e' }}
          >
            {!isConnected
              ? 'Connect Wallet'
              : isPending
              ? 'Confirm in Wallet...'
              : isConfirming
              ? 'Buying...'
              : 'Buy Tokens'}
          </button>
        </>
      )}
    </div>
  );
}
