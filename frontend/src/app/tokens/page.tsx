'use client';

import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { Header } from '@/components/Header';
import { TokenCard } from '@/components/TokenCard';
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

export default function TokensPage() {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  const { data: allTokens, isLoading: isLoadingTokens } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GLUED_LAUNCH_ABI,
    functionName: 'getAllTokens',
    query: { refetchInterval: 10_000 },
  });

  const tokenInfoCalls = (allTokens || []).map((tokenAddress) => ({
    address: contractAddress as `0x${string}`,
    abi: GLUED_LAUNCH_ABI,
    functionName: 'getTokenInfo' as const,
    args: [tokenAddress],
  }));

  const { data: tokenInfos, isLoading: isLoadingInfos } = useReadContracts({
    contracts: tokenInfoCalls,
    query: { refetchInterval: 10_000 },
  });

  const tokenNameCalls = (allTokens || []).map((tokenAddress) => ({
    address: tokenAddress as `0x${string}`,
    abi: GLUED_TOKEN_ABI,
    functionName: 'name' as const,
  }));

  const { data: tokenNames } = useReadContracts({
    contracts: tokenNameCalls,
  });

  const tokenSymbolCalls = (allTokens || []).map((tokenAddress) => ({
    address: tokenAddress as `0x${string}`,
    abi: GLUED_TOKEN_ABI,
    functionName: 'symbol' as const,
  }));

  const { data: tokenSymbols } = useReadContracts({
    contracts: tokenSymbolCalls,
  });

  const isLoading = isLoadingTokens || isLoadingInfos;

  return (
    <div className="min-h-screen" style={{ background: '#0b0c0e' }}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#f0f0f2' }}>All Tokens</h1>
            <p className="text-sm mt-1" style={{ color: '#5c5e69' }}>
              {allTokens?.length || 0} rug-proof tokens launched
            </p>
          </div>
          <Link
            href="/launch"
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #00e87b, #00c2ff)', color: '#0b0c0e' }}
          >
            Launch Token
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl p-5 animate-pulse"
                style={{ background: '#111215', border: '1px solid #1e2028' }}
              >
                <div className="h-5 rounded w-1/2 mb-4" style={{ background: '#1e2028' }} />
                <div className="h-4 rounded w-1/3 mb-4" style={{ background: '#1e2028' }} />
                <div className="space-y-3">
                  <div className="h-4 rounded" style={{ background: '#1e2028' }} />
                  <div className="h-4 rounded" style={{ background: '#1e2028' }} />
                  <div className="h-1.5 rounded" style={{ background: '#1e2028' }} />
                </div>
              </div>
            ))}
          </div>
        ) : allTokens && allTokens.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allTokens.map((tokenAddress, index) => {
              const info = tokenInfos?.[index];
              if (!info || info.status !== 'success' || !info.result) return null;

              const tokenInfo = info.result as TokenInfo;

              const name = tokenNames?.[index]?.status === 'success'
                ? (tokenNames[index].result as string)
                : 'Loading...';

              const symbol = tokenSymbols?.[index]?.status === 'success'
                ? (tokenSymbols[index].result as string)
                : '...';

              return (
                <TokenCard
                  key={tokenAddress}
                  address={tokenAddress}
                  name={name}
                  symbol={symbol}
                  collateral={tokenInfo.collateralBalance}
                  totalSupply={tokenInfo.totalSupply}
                  tokensSold={tokenInfo.tokensSold}
                  tokensForSale={tokenInfo.tokensForSale}
                  launchTime={tokenInfo.launchTime}
                  saleActive={tokenInfo.saleActive}
                  transferTaxBps={tokenInfo.transferTaxBps}
                  vestingDuration={tokenInfo.vestingDuration}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="rounded-xl p-8 max-w-md mx-auto" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#f0f0f2' }}>No Tokens Yet</h3>
              <p className="text-sm mb-6" style={{ color: '#5c5e69' }}>
                Be the first to launch a rug-proof token!
              </p>
              <Link
                href="/launch"
                className="inline-block px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #00e87b, #00c2ff)', color: '#0b0c0e' }}
              >
                Launch Token
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
