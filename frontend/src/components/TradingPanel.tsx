'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther, formatEther, zeroAddress, maxUint256 } from 'viem';
import { GLUED_LAUNCH_ABI, GLUED_TOKEN_ABI } from '@/contracts/abi';
import { getContractAddress } from '@/contracts/addresses';
import { formatTokenAmount } from '@/lib/formatTokens';

interface TradingPanelProps {
  tokenAddress: string;
  glueAddress: string;
  tokensSold: bigint;
  tokensForSale: bigint;
  basePrice: bigint;
  priceIncrement: bigint;
  saleActive: boolean;
  collateralBalance: bigint;
  totalSupply: bigint;
  creator: string;
}

type Tab = 'buy' | 'sell';

export function TradingPanel({
  tokenAddress,
  glueAddress,
  tokensSold,
  tokensForSale,
  basePrice,
  priceIncrement,
  saleActive,
  collateralBalance,
  totalSupply,
  creator,
}: TradingPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const contractAddress = getContractAddress(chainId);

  // Buy state
  const [ethAmount, setEthAmount] = useState('0.01');
  const [slippage, setSlippage] = useState(5);

  // Sell state
  const [burnAmount, setBurnAmount] = useState('1000');

  // Buy contract
  const {
    writeContract: writeBuy,
    data: buyHash,
    isPending: isBuyPending,
    error: buyError,
  } = useWriteContract();

  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // Approve contract (for sell)
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Sell contract
  const {
    writeContract: writeSell,
    data: sellHash,
    isPending: isSellPending,
    error: sellError,
  } = useWriteContract();

  const { isLoading: isSellConfirming, isSuccess: isSellSuccess } = useWaitForTransactionReceipt({
    hash: sellHash,
  });

  // User balance for sell
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

  // Max sellable = balance - locked vesting tokens (if creator)
  const lockedAmount = (isCreator && creatorLocked != null) ? (creatorLocked as bigint) : 0n;
  const sellableBalance = userBalance != null ? (userBalance as bigint) - lockedAmount : 0n;

  // After approval confirms, refetch allowance
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Invalidate all queries after buy/sell confirms so token data refreshes live
  useEffect(() => {
    if (isBuySuccess || isSellSuccess) {
      queryClient.invalidateQueries();
    }
  }, [isBuySuccess, isSellSuccess, queryClient]);

  // Buy calculations — use the contract's own view function for accuracy
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

  // Sell calculations — use raw BigInt for new tokens (not parseEther-scaled)
  const burnAmountWei = useMemo(() => {
    try {
      const val = burnAmount || '0';
      // For new tokens (raw supply), just parse as integer
      if (tokensForSale <= 10n ** 15n) return BigInt(Math.floor(Number(val)));
      // For legacy tokens (parseEther-scaled supply), use parseEther
      return parseEther(val);
    } catch { return 0n; }
  }, [burnAmount, tokensForSale]);
  const shareOfSupply = totalSupply > 0n ? Number(burnAmountWei) / Number(totalSupply) : 0;
  const grossETH = Number(formatEther(collateralBalance)) * shareOfSupply;
  const protocolFee = grossETH * 0.001;
  const platformFee = grossETH * 0.02;
  const netETH = grossETH - protocolFee - platformFee;

  const needsApproval = !allowance || (allowance as bigint) < burnAmountWei;
  const exceedsAvailable = isCreator && lockedAmount > 0n && burnAmountWei > sellableBalance;

  const handleBuy = () => {
    if (!isConnected) return;
    writeBuy({
      address: contractAddress as `0x${string}`,
      abi: GLUED_LAUNCH_ABI,
      functionName: 'buyTokens',
      args: [tokenAddress as `0x${string}`, minTokens],
      value: ethWei,
      gas: 1_000_000n,
    });
  };

  const handleApprove = () => {
    if (!isConnected || !address) return;
    writeApprove({
      address: tokenAddress as `0x${string}`,
      abi: GLUED_TOKEN_ABI,
      functionName: 'approve',
      args: [tokenAddress as `0x${string}`, maxUint256],
    });
  };

  const handleSell = () => {
    if (!isConnected || !address) return;
    writeSell({
      address: tokenAddress as `0x${string}`,
      abi: GLUED_TOKEN_ABI,
      functionName: 'unglue',
      args: [[zeroAddress], burnAmountWei, [], address],
      gas: 3_000_000n,
    });
  };

  const presetAmounts = ['0.01', '0.05', '0.1', '0.5'];
  const tokensRemaining = tokensForSale - tokensSold;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#111215', border: '1px solid #1e2028' }}>
      {/* Tab Bar */}
      <div className="flex" style={{ borderBottom: '1px solid #1e2028' }}>
        <button
          onClick={() => setActiveTab('buy')}
          className="flex-1 py-3 text-sm font-semibold transition-colors"
          style={{
            background: activeTab === 'buy' ? '#00e87b12' : 'transparent',
            color: activeTab === 'buy' ? '#00e87b' : '#5c5e69',
            borderBottom: activeTab === 'buy' ? '2px solid #00e87b' : '2px solid transparent',
          }}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className="flex-1 py-3 text-sm font-semibold transition-colors"
          style={{
            background: activeTab === 'sell' ? '#ef444412' : 'transparent',
            color: activeTab === 'sell' ? '#ef4444' : '#5c5e69',
            borderBottom: activeTab === 'sell' ? '2px solid #ef4444' : '2px solid transparent',
          }}
        >
          Sell
        </button>
      </div>

      <div className="p-5">
        {activeTab === 'buy' ? (
          /* Buy Tab */
          !saleActive ? (
            <div className="text-center py-6">
              <p className="text-sm" style={{ color: '#5c5e69' }}>Sale has ended</p>
              <p className="text-xs mt-1" style={{ color: '#5c5e69' }}>
                Trade on secondary markets or burn for collateral
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

              {buyError && (
                <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#fca5a5' }}>
                  {buyError.message.includes('User rejected') || buyError.message.includes('denied')
                    ? 'Transaction cancelled'
                    : `Error: ${buyError.message}`}
                </div>
              )}

              {isBuySuccess && (
                <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#00e87b15', border: '1px solid #00e87b30', color: '#86efac' }}>
                  Purchase successful! Check your wallet for tokens.
                </div>
              )}

              <button
                onClick={handleBuy}
                disabled={!isConnected || isBuyPending || isBuyConfirming || !saleActive}
                className="mt-4 w-full py-3 px-6 font-semibold text-sm rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg, #00e87b, #00c2ff)', color: '#0b0c0e' }}
              >
                {!isConnected
                  ? 'Connect Wallet'
                  : isBuyPending
                  ? 'Confirm in Wallet...'
                  : isBuyConfirming
                  ? 'Buying...'
                  : 'Buy Tokens'}
              </button>
            </>
          )
        ) : (
          /* Sell (Burn) Tab */
          <>
            <div className="space-y-4">
              {isCreator && lockedAmount > 0n && (
                <div className="rounded-lg p-3 text-xs" style={{ background: '#a855f710', border: '1px solid #a855f720', color: '#c4b5fd' }}>
                  <div className="font-semibold mb-1">Creator Vesting Active</div>
                  <div className="flex justify-between">
                    <span>Locked:</span>
                    <span className="font-mono">{formatTokenAmount(lockedAmount, tokensForSale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available to sell:</span>
                    <span className="font-mono" style={{ color: '#00e87b' }}>{formatTokenAmount(sellableBalance > 0n ? sellableBalance : 0n, tokensForSale)}</span>
                  </div>
                </div>
              )}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium" style={{ color: '#5c5e69' }}>Amount to Burn</label>
                  <button
                    onClick={() => {
                      const maxSell = sellableBalance > 0n ? sellableBalance : 0n;
                      if (maxSell <= 0n) return;
                      if (tokensForSale > 10n ** 15n) {
                        setBurnAmount(formatEther(maxSell));
                      } else {
                        setBurnAmount(maxSell.toString());
                      }
                    }}
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#ef4444' }}
                  >
                    Max: {formatTokenAmount(sellableBalance > 0n ? sellableBalance : 0n, tokensForSale)}
                  </button>
                </div>
                <input
                  type="text"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-1 focus:ring-[#ef4444] focus:border-[#ef444440]"
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

              <div className="rounded-lg p-3 text-xs" style={{ background: '#ef444410', border: '1px solid #ef444420', color: '#fca5a5' }}>
                Burning permanently removes tokens from supply and returns your
                proportional share of the collateral. This is irreversible.
              </div>
            </div>

            {(sellError || approveError) && (
              <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#fca5a5' }}>
                {((sellError || approveError)?.message ?? '').includes('User rejected') || ((sellError || approveError)?.message ?? '').includes('denied')
                  ? 'Transaction cancelled'
                  : `Error: ${(sellError || approveError)?.message}`}
              </div>
            )}

            {isSellSuccess && (
              <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#00e87b15', border: '1px solid #00e87b30', color: '#86efac' }}>
                Burn successful! ETH has been sent to your wallet.
              </div>
            )}

            {isApproveSuccess && needsApproval && (
              <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#00c2ff15', border: '1px solid #00c2ff30', color: '#7dd3fc' }}>
                Approval confirmed! You can now sell.
              </div>
            )}

            {exceedsAvailable && (
              <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: '#a855f715', border: '1px solid #a855f730', color: '#c4b5fd' }}>
                Amount exceeds available tokens. You have {formatTokenAmount(sellableBalance > 0n ? sellableBalance : 0n, tokensForSale)} available (rest is locked by vesting).
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
                onClick={handleSell}
                disabled={!isConnected || isSellPending || isSellConfirming || burnAmountWei === 0n || exceedsAvailable}
                className="mt-4 w-full py-3 px-6 font-semibold text-sm rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#0b0c0e' }}
              >
                {!isConnected
                  ? 'Connect Wallet'
                  : isSellPending
                  ? 'Confirm in Wallet...'
                  : isSellConfirming
                  ? 'Burning...'
                  : 'Sell (Burn) Tokens'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
