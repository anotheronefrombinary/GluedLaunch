'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther, formatEther, zeroAddress, maxUint256 } from 'viem';
import { GLUED_TOKEN_ABI } from '@/contracts/abi';
import { formatTokenAmount } from '@/lib/formatTokens';

const PARSE_ETHER_THRESHOLD = 10n ** 15n;

interface BurnPanelProps {
  tokenAddress: string;
  glueAddress: string;
  collateralBalance: bigint;
  totalSupply: bigint;
  creator: string;
}

export function BurnPanel({
  tokenAddress,
  glueAddress,
  collateralBalance,
  totalSupply,
  creator,
}: BurnPanelProps) {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [burnAmount, setBurnAmount] = useState('');

  const isLegacy = totalSupply > PARSE_ETHER_THRESHOLD;

  // Approve contract
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Burn (unglue) contract
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: userBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: GLUED_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { refetchInterval: 5_000 },
  });

  // Check allowance: user must approve the TOKEN CONTRACT to spend their tokens
  // StickyAsset.unglue() calls transferFrom(msg.sender, address(this), amount)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: GLUED_TOKEN_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, tokenAddress as `0x${string}`],
    query: { enabled: !!address },
  });

  // If user is the creator, check locked (vesting) tokens
  const isCreator = address?.toLowerCase() === creator?.toLowerCase();
  const { data: creatorLocked } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: GLUED_TOKEN_ABI,
    functionName: 'creatorLockedAmount',
    query: { enabled: isCreator, refetchInterval: 10_000 },
  });

  const lockedAmount = (isCreator && creatorLocked != null) ? (creatorLocked as bigint) : 0n;
  const sellableBalance = userBalance != null ? (userBalance as bigint) - lockedAmount : 0n;

  // After approval confirms, refetch allowance
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Invalidate all queries after burn confirms so token data refreshes live
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries();
    }
  }, [isSuccess, queryClient]);

  const burnAmountWei = useMemo(() => {
    try {
      const val = burnAmount || '0';
      if (isLegacy) return parseEther(val);
      return BigInt(Math.floor(Number(val)));
    } catch { return 0n; }
  }, [burnAmount, isLegacy]);

  const shareOfSupply = totalSupply > 0n
    ? Number(burnAmountWei) / Number(totalSupply)
    : 0;

  const grossETH = Number(formatEther(collateralBalance)) * shareOfSupply;
  const protocolFee = grossETH * 0.001;
  const platformFee = grossETH * 0.02;
  const netETH = grossETH - protocolFee - platformFee;

  const needsApproval = !allowance || (allowance as bigint) < burnAmountWei;
  const exceedsAvailable = isCreator && lockedAmount > 0n && burnAmountWei > sellableBalance;

  const handleApprove = () => {
    if (!isConnected || !address) return;
    writeApprove({
      address: tokenAddress as `0x${string}`,
      abi: GLUED_TOKEN_ABI,
      functionName: 'approve',
      args: [tokenAddress as `0x${string}`, maxUint256],
    });
  };

  const handleBurn = () => {
    if (!isConnected || !address) return;

    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: GLUED_TOKEN_ABI,
      functionName: 'unglue',
      args: [
        [zeroAddress],
        burnAmountWei,
        [],
        address,
      ],
      gas: 3_000_000n,
    });
  };

  const setMaxBurn = () => {
    const maxSell = sellableBalance > 0n ? sellableBalance : 0n;
    if (maxSell > 0n) {
      if (isLegacy) {
        setBurnAmount(formatEther(maxSell));
      } else {
        setBurnAmount(maxSell.toString());
      }
    }
  };

  return (
    <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
      <h3 className="text-base font-bold mb-4" style={{ color: '#f0f0f2' }}>Burn for Collateral</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium" style={{ color: '#5c5e69' }}>Amount to Burn</label>
            <button
              onClick={setMaxBurn}
              className="text-xs font-medium transition-colors"
              style={{ color: '#00e87b' }}
            >
              Max: {formatTokenAmount(sellableBalance > 0n ? sellableBalance : 0n, totalSupply)}
            </button>
          </div>
          <input
            type="text"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            placeholder={isLegacy ? '1000' : '1000'}
            className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-1 focus:ring-[#00e87b] focus:border-[#00e87b40]"
            style={{ background: '#16171c', border: '1px solid #1e2028', color: '#f0f0f2' }}
          />
        </div>

        <div className="rounded-lg p-4 space-y-2" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#5c5e69' }}>Gross ETH</span>
            <span className="font-mono" style={{ color: '#f0f0f2' }}>{grossETH.toFixed(8)} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#5c5e69' }}>Protocol Fee (0.1%)</span>
            <span className="font-mono" style={{ color: '#5c5e69' }}>-{protocolFee.toFixed(8)} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#5c5e69' }}>Platform Fee (2%)</span>
            <span className="font-mono" style={{ color: '#5c5e69' }}>-{platformFee.toFixed(8)} ETH</span>
          </div>
          <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #1e2028' }}>
            <span style={{ color: '#8b8d97' }}>You Receive</span>
            <span className="font-bold font-mono" style={{ color: '#00e87b' }}>
              {netETH.toFixed(8)} ETH
            </span>
          </div>
        </div>

        <div className="rounded-lg p-3 text-xs" style={{ background: '#00c2ff10', border: '1px solid #00c2ff20', color: '#7dd3fc' }}>
          Burning tokens permanently removes them from supply and returns your
          proportional share of the collateral. This is irreversible.
        </div>
      </div>

      {(error || approveError) && (
        <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#fca5a5' }}>
          {((error || approveError)?.message ?? '').includes('User rejected') || ((error || approveError)?.message ?? '').includes('denied')
            ? 'Transaction cancelled'
            : `Error: ${(error || approveError)?.message}`}
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#00e87b15', border: '1px solid #00e87b30', color: '#86efac' }}>
          Burn successful! ETH has been sent to your wallet.
        </div>
      )}

      {isApproveSuccess && needsApproval && (
        <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#00c2ff15', border: '1px solid #00c2ff30', color: '#7dd3fc' }}>
          Approval confirmed! You can now burn.
        </div>
      )}

      {exceedsAvailable && (
        <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#a855f715', border: '1px solid #a855f730', color: '#c4b5fd' }}>
          Amount exceeds available tokens. You have {formatTokenAmount(sellableBalance > 0n ? sellableBalance : 0n, totalSupply)} available (rest is locked by vesting).
        </div>
      )}

      {needsApproval && burnAmountWei > 0n && !exceedsAvailable ? (
        <button
          onClick={handleApprove}
          disabled={!isConnected || isApprovePending || isApproveConfirming}
          className="mt-4 w-full py-3 px-6 font-semibold text-sm rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, #00c2ff, #6366f1)', color: '#0b0c0e' }}
        >
          {!isConnected
            ? 'Connect Wallet'
            : isApprovePending
            ? 'Confirm Approval...'
            : isApproveConfirming
            ? 'Approving...'
            : 'Approve Tokens'}
        </button>
      ) : (
        <button
          onClick={handleBurn}
          disabled={!isConnected || isPending || isConfirming || burnAmountWei === 0n || exceedsAvailable}
          className="mt-4 w-full py-3 px-6 font-semibold text-sm rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#0b0c0e' }}
        >
          {!isConnected
            ? 'Connect Wallet'
            : isPending
            ? 'Confirm in Wallet...'
            : isConfirming
            ? 'Burning...'
            : 'Burn Tokens'}
        </button>
      )}
    </div>
  );
}
