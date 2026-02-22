'use client';

import Link from 'next/link';
import { formatEther } from 'viem';
import { TokenAvatar } from './TokenAvatar';
import { formatTokenAmount } from '@/lib/formatTokens';

interface TokenCardProps {
  address: string;
  name: string;
  symbol: string;
  collateral: bigint;
  totalSupply: bigint;
  tokensSold: bigint;
  tokensForSale: bigint;
  launchTime: bigint;
  saleActive: boolean;
  transferTaxBps?: bigint;
  vestingDuration?: bigint;
}

export function TokenCard({
  address,
  name,
  symbol,
  collateral,
  totalSupply,
  tokensSold,
  tokensForSale,
  launchTime,
  saleActive,
  transferTaxBps = 0n,
  vestingDuration = 0n,
}: TokenCardProps) {
  const isLegacy = totalSupply > 10n ** 15n;
  const supplyNum = isLegacy ? Number(formatEther(totalSupply)) : Number(totalSupply);
  const floorPrice = supplyNum > 0
    ? Number(formatEther(collateral)) / supplyNum
    : 0;

  const progress = tokensForSale > 0n
    ? Number((tokensSold * 100n) / tokensForSale)
    : 0;

  const timeSinceLaunch = Date.now() / 1000 - Number(launchTime);
  const timeDisplay = timeSinceLaunch < 3600
    ? `${Math.floor(timeSinceLaunch / 60)}m ago`
    : timeSinceLaunch < 86400
    ? `${Math.floor(timeSinceLaunch / 3600)}h ago`
    : `${Math.floor(timeSinceLaunch / 86400)}d ago`;

  return (
    <Link href={`/token/${address}`}>
      <div
        className="rounded-xl p-5 card-glow cursor-pointer group transition-all"
        style={{ background: '#111215', border: '1px solid #1e2028' }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <TokenAvatar address={address} size={36} />
            <div>
              <h3 className="text-base font-bold transition-colors group-hover:text-[#00e87b]" style={{ color: '#f0f0f2' }}>
                {name}
              </h3>
              <p className="text-xs font-mono" style={{ color: '#5c5e69' }}>${symbol}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {saleActive ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#00e87b15', color: '#00e87b' }}>
                Live
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#16171c', color: '#5c5e69' }}>
                Sold Out
              </span>
            )}
            <div className="flex gap-1">
              {transferTaxBps > 0n && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                  {(Number(transferTaxBps) / 100).toFixed(1)}% tax
                </span>
              )}
              {vestingDuration > 0n && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: '#a855f720', color: '#a855f7' }}>
                  vested
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#5c5e69' }}>Floor Price</span>
            <span className="font-mono" style={{ color: '#00e87b' }}>
              {floorPrice.toFixed(8)} ETH
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span style={{ color: '#5c5e69' }}>TVL</span>
            <span className="font-mono" style={{ color: '#f0f0f2' }}>
              {Number(formatEther(collateral)).toFixed(4)} ETH
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#5c5e69' }}>
              <span>Sale Progress</span>
              <span className="font-mono">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e2028' }}>
              <div
                className="h-full rounded-full progress-bar"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: 'linear-gradient(90deg, #00e87b, #00c2ff)',
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs pt-3" style={{ borderTop: '1px solid #1e2028', color: '#5c5e69' }}>
            <span>{timeDisplay}</span>
            <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
