'use client';

import { useParams } from 'next/navigation';
import { useReadContract, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { formatTokenAmount } from '@/lib/formatTokens';
import { Header } from '@/components/Header';
import { TradingPanel } from '@/components/TradingPanel';
import { BuyPanel } from '@/components/BuyPanel';
import { BurnPanel } from '@/components/BurnPanel';
import { GraduationPanel } from '@/components/GraduationPanel';
import { UserPosition } from '@/components/UserPosition';
import { Identicon } from '@/components/Identicon';
import { TokenAvatar } from '@/components/TokenAvatar';
import { CopyShareButtons } from '@/components/CopyShareButtons';
import { TokenAbout } from '@/components/TokenAbout';
import { PriceChart } from '@/components/PriceChart';
import { PriceStats } from '@/components/PriceStats';
import { TradeHistory } from '@/components/TradeHistory';
import { Comments } from '@/components/Comments';
import { useTradeHistory } from '@/hooks/useTradeHistory';
import { GLUED_LAUNCH_ABI, GLUED_TOKEN_ABI } from '@/contracts/abi';
import { getContractAddress } from '@/contracts/addresses';
import Link from 'next/link';

interface TokenInfo {
  glue: string;
  totalSupply: bigint;
  collateralBalance: bigint;
  floorPrice: bigint;
  currentPrice: bigint;
  tokensSold: bigint;
  tokensForSale: bigint;
  creator: string;
  launchTime: bigint;
  saleActive: boolean;
  graduated: boolean;
  uniswapPair: string;
  tokensForLP: bigint;
  transferTaxBps: bigint;
  vestingDuration: bigint;
}

export default function TokenDetailPage() {
  const params = useParams();
  const tokenAddress = params.address as string;
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  const { data: tokenInfo, isLoading: isLoadingInfo } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GLUED_LAUNCH_ABI,
    functionName: 'getTokenInfo',
    args: [tokenAddress as `0x${string}`],
    query: { refetchInterval: 5_000 },
  });

  const { data: saleInfo } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GLUED_LAUNCH_ABI,
    functionName: 'sales',
    args: [tokenAddress as `0x${string}`],
    query: { refetchInterval: 5_000 },
  });

  const { data: tokenName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: GLUED_TOKEN_ABI,
    functionName: 'name',
  });

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: GLUED_TOKEN_ABI,
    functionName: 'symbol',
  });

  // Extract glue address for trade history (available once tokenInfo loads)
  const glueAddr = tokenInfo ? (tokenInfo as TokenInfo).glue : undefined;

  // Fetch trade history once here, pass down to PriceChart/PriceStats/TradeHistory
  const { trades, isLoading: isLoadingTrades } = useTradeHistory(tokenAddress, glueAddr);

  if (isLoadingInfo) {
    return (
      <div className="min-h-screen" style={{ background: '#0b0c0e' }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 rounded w-1/3 mb-4" style={{ background: '#1e2028' }} />
            <div className="h-4 rounded w-1/4 mb-8" style={{ background: '#1e2028' }} />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-64 rounded-xl" style={{ background: '#111215' }} />
              <div className="h-64 rounded-xl" style={{ background: '#111215' }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!tokenInfo) {
    return (
      <div className="min-h-screen" style={{ background: '#0b0c0e' }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#f0f0f2' }}>Token Not Found</h1>
            <p className="text-sm mb-6" style={{ color: '#5c5e69' }}>
              This token doesn&apos;t exist or hasn&apos;t been deployed yet.
            </p>
            <Link
              href="/tokens"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #00e87b, #00c2ff)', color: '#0b0c0e' }}
            >
              View All Tokens
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const info = tokenInfo as TokenInfo;
  const {
    glue,
    totalSupply,
    collateralBalance,
    floorPrice,
    currentPrice,
    tokensSold,
    tokensForSale,
    creator,
    launchTime,
    saleActive,
    graduated,
    uniswapPair,
    tokensForLP,
    transferTaxBps,
    vestingDuration,
  } = info;

  const saleData = saleInfo as unknown as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean, string, bigint, bigint];
  const basePrice = saleData ? saleData[6] : 0n;
  const priceIncrement = saleData ? saleData[7] : 0n;

  // Compute display floor price correctly for both legacy and new tokens.
  // Contract returns floorPrice = collateralBalance * 1e18 / totalSupply,
  // which is only correct with formatEther when totalSupply is 18-decimal scaled.
  // For raw-supply tokens, compute directly: collateral(ETH) / supply.
  const isLegacyToken = totalSupply > 10n ** 15n;
  const supplyNum = isLegacyToken ? Number(formatEther(totalSupply)) : Number(totalSupply);
  const displayFloorPrice = supplyNum > 0 ? Number(formatEther(collateralBalance)) / supplyNum : 0;

  // Calculate vesting info
  const vestingMonths = vestingDuration > 0n ? Number(vestingDuration) / (30 * 24 * 60 * 60) : 0;
  const vestingEndTime = Number(launchTime) + Number(vestingDuration);
  const now = Math.floor(Date.now() / 1000);
  const vestingElapsed = now > Number(launchTime) ? now - Number(launchTime) : 0;
  const vestingProgress = vestingDuration > 0n
    ? Math.min(100, (vestingElapsed / Number(vestingDuration)) * 100)
    : 100;

  const progress = tokensForSale > 0n
    ? Number((tokensSold * 100n) / tokensForSale)
    : 0;

  const launchDate = new Date(Number(launchTime) * 1000);

  return (
    <div className="min-h-screen" style={{ background: '#0b0c0e' }}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/tokens"
          className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: '#5c5e69' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to All Tokens
        </Link>

        {/* Token Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-3">
            <TokenAvatar address={tokenAddress} size={56} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl font-bold" style={{ color: '#f0f0f2' }}>
                  {tokenName || 'Loading...'}
                </h1>
                {graduated ? (
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#a855f715', color: '#a855f7' }}>
                    On Uniswap
                  </span>
                ) : saleActive ? (
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#00e87b15', color: '#00e87b' }}>
                    Sale Active
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
                    Ready to Graduate
                  </span>
                )}
                {transferTaxBps > 0n && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                    {(Number(transferTaxBps) / 100).toFixed(1)}% Floor Boost
                  </span>
                )}
                {vestingDuration > 0n && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#a855f720', color: '#a855f7' }}>
                    Vested
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg font-mono" style={{ color: '#5c5e69' }}>${tokenSymbol || '...'}</span>
                <CopyShareButtons address={tokenAddress} tokenName={tokenName as string | undefined} />
              </div>
            </div>
          </div>
          {/* Market Cap */}
          {(() => {
            const isLegacySupply = totalSupply > 10n ** 15n;
            const supplyNum = isLegacySupply ? Number(formatEther(totalSupply)) : Number(totalSupply);
            const marketCap = totalSupply > 0n && currentPrice > 0n
              ? Number(formatEther(currentPrice)) * supplyNum
              : 0;
            return marketCap > 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: '#111215', border: '1px solid #1e2028' }}>
                <span style={{ color: '#5c5e69' }}>Market Cap:</span>
                <span className="font-mono font-bold" style={{ color: '#00e87b' }}>
                  {marketCap < 0.001
                    ? marketCap.toFixed(8)
                    : marketCap < 1
                    ? marketCap.toFixed(4)
                    : marketCap.toFixed(2)} ETH
                </span>
              </div>
            ) : null;
          })()}
        </div>

        {/* How Pricing Works */}
        <div className="mb-4 rounded-xl p-4" style={{ background: '#111215', border: '1px solid #1e2028' }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#00e87b15' }}>
              <span style={{ color: '#00e87b' }}>&#9432;</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1.5" style={{ color: '#f0f0f2' }}>How Pricing Works</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg p-3" style={{ background: '#00e87b08', border: '1px solid #00e87b20' }}>
                  <div className="font-semibold mb-1" style={{ color: '#00e87b' }}>Buy Price (Bonding Curve)</div>
                  <p style={{ color: '#5c5e69' }}>
                    Price increases with each purchase. Early buyers get a lower price. Chart tracks this price.
                  </p>
                  <div className="font-mono mt-1.5" style={{ color: '#00e87b' }}>
                    {Number(formatEther(currentPrice)).toFixed(10)} ETH
                  </div>
                </div>
                <div className="rounded-lg p-3" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20' }}>
                  <div className="font-semibold mb-1" style={{ color: '#f59e0b' }}>Sell Price (Floor / Redeem)</div>
                  <p style={{ color: '#5c5e69' }}>
                    Burn tokens to receive your share of collateral. This is a safety net, not the market price.
                  </p>
                  <div className="font-mono mt-1.5" style={{ color: '#f59e0b' }}>
                    {displayFloorPrice.toFixed(10)} ETH
                  </div>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: '#5c5e6990' }}>
                Selling (burning) redeems at floor price and does not affect the bonding curve. The real payoff comes when the token graduates to Uniswap for open market trading.
              </p>
            </div>
          </div>
        </div>

        {/* Price Stats Row */}
        <div className="mb-4">
          <PriceStats trades={trades} isLoading={isLoadingTrades} currentPrice={currentPrice} totalSupply={totalSupply} />
        </div>

        {/* Token About */}
        <div className="mb-6">
          <TokenAbout tokenAddress={tokenAddress} />
        </div>

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column — Stats, Progress, Details */}
          <div className="space-y-5 min-w-0">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Floor Price', value: `${displayFloorPrice.toFixed(10)} ETH`, color: '#00e87b' },
                { label: 'Current Price', value: `${Number(formatEther(currentPrice)).toFixed(10)} ETH`, color: '#00c2ff' },
                { label: 'Total Collateral (TVL)', value: `${Number(formatEther(collateralBalance)).toFixed(4)} ETH`, color: '#f0f0f2' },
                { label: 'Total Supply', value: formatTokenAmount(totalSupply, totalSupply), color: '#f0f0f2' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4" style={{ background: '#111215', border: '1px solid #1e2028' }}>
                  <p className="text-xs mb-1.5" style={{ color: '#5c5e69' }}>{stat.label}</p>
                  <p className="text-base font-bold font-mono" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Chart */}
            <PriceChart
              trades={trades}
              isLoading={isLoadingTrades}
              totalSupply={totalSupply}
            />

            {/* Sale Progress */}
            <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold" style={{ color: '#f0f0f2' }}>Bonding Curve Progress</h3>
                <span className="text-sm font-mono font-bold" style={{ color: '#00e87b' }}>{progress.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: '#1e2028' }}>
                <div
                  className="h-full rounded-full progress-bar"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'linear-gradient(90deg, #00e87b, #00c2ff)',
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span style={{ color: '#5c5e69' }}>Sold: </span>
                  <span className="font-mono" style={{ color: '#f0f0f2' }}>
                    {formatTokenAmount(tokensSold, totalSupply)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#5c5e69' }}>For Sale: </span>
                  <span className="font-mono" style={{ color: '#f0f0f2' }}>
                    {formatTokenAmount(tokensForSale, totalSupply)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#5c5e69' }}>LP Reserve: </span>
                  <span className="font-mono" style={{ color: '#a855f7' }}>
                    {formatTokenAmount(tokensForLP, totalSupply)}
                  </span>
                </div>
              </div>
            </div>

            {/* Graduation Panel */}
            <GraduationPanel
              tokenAddress={tokenAddress}
              tokensForLP={tokensForLP}
              totalSupply={totalSupply}
              saleActive={saleActive}
              graduated={graduated}
              uniswapPair={uniswapPair}
            />

            {/* Creator Profile */}
            <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f2' }}>Creator</h3>
              <div className="flex items-center gap-3">
                <Identicon address={creator} size={36} />
                <div className="flex-1 min-w-0">
                  <a
                    href={`https://sepolia.etherscan.io/address/${creator}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm hover:underline"
                    style={{ color: '#00e87b' }}
                  >
                    {creator.slice(0, 8)}...{creator.slice(-6)}
                  </a>
                  <p className="text-xs mt-0.5" style={{ color: '#5c5e69' }}>
                    Launched {launchDate.toLocaleDateString()} at {launchDate.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Trade History */}
            <TradeHistory
              trades={trades}
              isLoading={isLoadingTrades}
              totalSupply={totalSupply}
            />

            {/* Vesting Panel */}
            {vestingDuration > 0n && (
              <div className="rounded-xl p-5" style={{ background: '#a855f708', border: '1px solid #a855f730' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span style={{ fontSize: '18px' }}>&#128274;</span>
                  <h3 className="text-sm font-semibold" style={{ color: '#a855f7' }}>Creator Vesting</h3>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: '#5c5e69' }}>Vesting Progress</span>
                    <span className="font-mono" style={{ color: '#a855f7' }}>{vestingProgress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e2028' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${vestingProgress}%`,
                        background: 'linear-gradient(90deg, #a855f7, #d946ef)',
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: '#5c5e69' }}>Duration: </span>
                    <span className="font-mono" style={{ color: '#f0f0f2' }}>
                      {vestingMonths.toFixed(0)} months
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#5c5e69' }}>Fully Vested: </span>
                    <span className="font-mono" style={{ color: '#f0f0f2' }}>
                      {new Date(vestingEndTime * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs mt-3" style={{ color: '#5c5e69' }}>
                  Creator tokens unlock linearly over the vesting period. This prevents rug pulls and builds trust.
                </p>
              </div>
            )}

            {/* Floor Boost Tax Panel */}
            {transferTaxBps > 0n && (
              <div className="rounded-xl p-5" style={{ background: '#f59e0b08', border: '1px solid #f59e0b30' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ fontSize: '18px' }}>&#128293;</span>
                  <h3 className="text-sm font-semibold" style={{ color: '#f59e0b' }}>Floor Boost Tax</h3>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: '#5c5e69' }}>Tax Rate</span>
                  <span className="font-mono font-bold" style={{ color: '#f59e0b' }}>
                    {(Number(transferTaxBps) / 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#5c5e69' }}>
                  Every transfer burns {(Number(transferTaxBps) / 100).toFixed(1)}% of tokens, reducing supply and increasing the floor price.
                  More trading = higher floor. This tax does NOT apply to buying from the bonding curve or trading on Uniswap.
                </p>
              </div>
            )}

            {/* Token Details */}
            <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0f0f2' }}>Token Details</h3>
              <div className="space-y-0 text-sm">
                {[
                  { label: 'Token Contract', value: `${tokenAddress.slice(0, 8)}...${tokenAddress.slice(-6)}`, href: `https://sepolia.etherscan.io/address/${tokenAddress}`, color: '#00e87b' },
                  { label: 'Glue Contract', value: `${glue.slice(0, 8)}...${glue.slice(-6)}`, href: `https://sepolia.etherscan.io/address/${glue}`, color: '#00e87b' },
                  { label: 'Base Price', value: `${Number(formatEther(basePrice)).toFixed(10)} ETH`, color: '#8b8d97' },
                  { label: 'Price Increment', value: `${Number(formatEther(priceIncrement)).toFixed(12)} ETH/token`, color: '#8b8d97' },
                ].map((detail) => (
                  <div key={detail.label} className="flex justify-between py-3" style={{ borderBottom: '1px solid #1e2028' }}>
                    <span style={{ color: '#5c5e69' }}>{detail.label}</span>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono hover:underline"
                        style={{ color: detail.color }}
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <span className="font-mono" style={{ color: detail.color }}>{detail.value}</span>
                    )}
                  </div>
                ))}
                {graduated && uniswapPair && uniswapPair !== '0x0000000000000000000000000000000000000000' && (
                  <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #1e2028' }}>
                    <span style={{ color: '#5c5e69' }}>Uniswap Pair</span>
                    <a
                      href={`https://sepolia.etherscan.io/address/${uniswapPair}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono hover:underline"
                      style={{ color: '#a855f7' }}
                    >
                      {uniswapPair.slice(0, 8)}...{uniswapPair.slice(-6)}
                    </a>
                  </div>
                )}
              </div>

            </div>

            {/* Comments */}
            <Comments tokenAddress={tokenAddress} />
          </div>

          {/* Right Column — Trading Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <UserPosition
              tokenAddress={tokenAddress}
              tokenSymbol={tokenSymbol as string | undefined}
              floorPrice={floorPrice}
              currentPrice={currentPrice}
              totalSupply={totalSupply}
              collateralBalance={collateralBalance}
            />
            <TradingPanel
              tokenAddress={tokenAddress}
              glueAddress={glue}
              tokensSold={tokensSold}
              tokensForSale={tokensForSale}
              basePrice={basePrice}
              priceIncrement={priceIncrement}
              saleActive={saleActive}
              collateralBalance={collateralBalance}
              totalSupply={totalSupply}
              creator={creator}
            />
            {saleActive && (
              <BuyPanel
                tokenAddress={tokenAddress}
                tokensSold={tokensSold}
                tokensForSale={tokensForSale}
                basePrice={basePrice}
                priceIncrement={priceIncrement}
                saleActive={saleActive}
              />
            )}
            <BurnPanel
              tokenAddress={tokenAddress}
              glueAddress={glue}
              collateralBalance={collateralBalance}
              totalSupply={totalSupply}
              creator={creator}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
