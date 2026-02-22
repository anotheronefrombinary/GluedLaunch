'use client';

import { formatEther } from 'viem';
import { formatTokenAmount } from '@/lib/formatTokens';
import type { Trade } from '@/hooks/useTradeHistory';

interface TradeHistoryProps {
  trades: Trade[];
  isLoading: boolean;
  totalSupply: bigint;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function TradeHistory({ trades, isLoading, totalSupply }: TradeHistoryProps) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0f0f2' }}>Trade History</h3>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex justify-between">
              <div className="h-4 w-24 rounded" style={{ background: '#1e2028' }} />
              <div className="h-4 w-20 rounded" style={{ background: '#1e2028' }} />
            </div>
          ))}
        </div>
      ) : trades.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: '#5c5e69' }}>
          No trades yet
        </p>
      ) : (
        <div className="space-y-0 max-h-80 overflow-y-auto">
          <div className="grid grid-cols-5 gap-2 text-xs font-medium pb-2 mb-2" style={{ color: '#5c5e69', borderBottom: '1px solid #1e2028' }}>
            <span>Type</span>
            <span>Trader</span>
            <span className="text-right">ETH</span>
            <span className="text-right">Tokens</span>
            <span className="text-right">Time</span>
          </div>
          {trades.slice(0, 50).map((trade) => {
            const isSell = trade.type === 'sell';
            return (
              <a
                key={trade.transactionHash}
                href={`https://sepolia.etherscan.io/tx/${trade.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-5 gap-2 py-2 text-xs hover:bg-[#16171c] rounded-md px-1 -mx-1 transition-colors"
                style={{ borderBottom: '1px solid #1e202810' }}
              >
                <span
                  className="font-semibold"
                  style={{ color: isSell ? '#ef4444' : '#00e87b' }}
                >
                  {isSell ? 'SELL' : 'BUY'}
                </span>
                <span className="font-mono" style={{ color: isSell ? '#ef4444' : '#00e87b' }}>
                  {trade.buyer.slice(0, 6)}...{trade.buyer.slice(-4)}
                </span>
                <span className="text-right font-mono" style={{ color: '#f0f0f2' }}>
                  {trade.ethSpent > 0n
                    ? Number(formatEther(trade.ethSpent)).toFixed(4)
                    : '-'}
                </span>
                <span className="text-right font-mono" style={{ color: '#8b8d97' }}>
                  {formatTokenAmount(trade.tokensReceived, totalSupply)}
                </span>
                <span className="text-right" style={{ color: '#5c5e69' }}>
                  {trade.timestamp ? timeAgo(trade.timestamp) : '...'}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
