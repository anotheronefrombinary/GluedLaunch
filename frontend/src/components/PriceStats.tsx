'use client';

import { formatEther } from 'viem';
import type { Trade } from '@/hooks/useTradeHistory';

const PARSE_ETHER_THRESHOLD = 10n ** 15n;

interface PriceStatsProps {
  trades: Trade[];
  isLoading: boolean;
  currentPrice: bigint;
  totalSupply: bigint;
}

function getTradePrice(trade: Trade, isLegacy: boolean): number {
  if (trade.tokensReceived === 0n) return 0;
  const ethSpent = Number(formatEther(trade.ethSpent));
  const tokensReceived = isLegacy
    ? Number(formatEther(trade.tokensReceived))
    : Number(trade.tokensReceived);
  return tokensReceived > 0 ? ethSpent / tokensReceived : 0;
}

function getPriceAtTime(trades: Trade[], secondsAgo: number, isLegacy: boolean): number | null {
  const cutoff = Math.floor(Date.now() / 1000) - secondsAgo;
  // trades are newest-first — find the most recent trade before the cutoff
  for (const trade of trades) {
    if (trade.timestamp && trade.timestamp <= cutoff && trade.tokensReceived > 0n) {
      return getTradePrice(trade, isLegacy);
    }
  }
  return null;
}

function formatPctChange(current: number, past: number | null): { text: string; color: string } {
  if (past === null || past === 0) return { text: '--', color: '#5c5e69' };
  const pct = ((current - past) / past) * 100;
  if (pct > 0) return { text: `+${pct.toFixed(1)}%`, color: '#00e87b' };
  if (pct < 0) return { text: `${pct.toFixed(1)}%`, color: '#ef4444' };
  return { text: '0.0%', color: '#5c5e69' };
}

export function PriceStats({ trades, isLoading, currentPrice, totalSupply }: PriceStatsProps) {
  if (isLoading || trades.length === 0) return null;

  const isLegacy = totalSupply > PARSE_ETHER_THRESHOLD;
  const currentPriceNum = Number(formatEther(currentPrice));

  // trades are newest-first
  const price5m = getPriceAtTime(trades, 5 * 60, isLegacy);
  const price1h = getPriceAtTime(trades, 60 * 60, isLegacy);
  const price6h = getPriceAtTime(trades, 6 * 60 * 60, isLegacy);
  const price24h = getPriceAtTime(trades, 24 * 60 * 60, isLegacy);

  const changes = [
    { label: '5m', ...formatPctChange(currentPriceNum, price5m) },
    { label: '1h', ...formatPctChange(currentPriceNum, price1h) },
    { label: '6h', ...formatPctChange(currentPriceNum, price6h) },
    { label: '24h', ...formatPctChange(currentPriceNum, price24h) },
  ];

  // Calculate volume (total ETH spent)
  const now = Math.floor(Date.now() / 1000);
  const volume24h = trades
    .filter((t) => t.timestamp && t.timestamp > now - 86400)
    .reduce((sum, t) => sum + Number(formatEther(t.ethSpent)), 0);

  // ATH: highest average price from buy trades only
  let athPrice = 0;
  for (const trade of trades) {
    if (trade.type !== 'sell' && trade.tokensReceived > 0n) {
      const avg = getTradePrice(trade, isLegacy);
      if (avg > athPrice) athPrice = avg;
    }
  }

  const athDiff = athPrice > 0 ? ((currentPriceNum - athPrice) / athPrice) * 100 : 0;

  return (
    <div className="flex flex-wrap gap-3">
      {/* Price changes */}
      <div className="flex gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid #1e2028' }}>
        {changes.map((c) => (
          <div key={c.label} className="px-3 py-2 text-center" style={{ background: '#111215', borderRight: '1px solid #1e2028' }}>
            <p className="text-xs" style={{ color: '#5c5e69' }}>{c.label}</p>
            <p className="text-xs font-mono font-bold" style={{ color: c.color }}>{c.text}</p>
          </div>
        ))}
      </div>

      {/* Volume 24h */}
      <div className="rounded-lg px-3 py-2" style={{ background: '#111215', border: '1px solid #1e2028' }}>
        <p className="text-xs" style={{ color: '#5c5e69' }}>Vol 24h</p>
        <p className="text-xs font-mono font-bold" style={{ color: '#f0f0f2' }}>
          {volume24h.toFixed(4)} ETH
        </p>
      </div>

      {/* ATH */}
      {athPrice > 0 && (
        <div className="rounded-lg px-3 py-2" style={{ background: '#111215', border: '1px solid #1e2028' }}>
          <p className="text-xs" style={{ color: '#5c5e69' }}>ATH</p>
          <p className="text-xs font-mono font-bold" style={{ color: '#f59e0b' }}>
            {athPrice < 0.001 ? athPrice.toFixed(10) : athPrice.toFixed(6)} ETH
            {athDiff < 0 && (
              <span className="ml-1" style={{ color: '#ef4444', fontSize: '10px' }}>
                ({athDiff.toFixed(1)}%)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
