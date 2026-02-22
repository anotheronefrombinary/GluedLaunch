'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { GLUED_LAUNCH_ABI } from '@/contracts/abi';
import { getContractAddress } from '@/contracts/addresses';
import { formatTokenAmount } from '@/lib/formatTokens';

interface GraduationPanelProps {
  tokenAddress: string;
  tokensForLP: bigint;
  totalSupply: bigint;
  saleActive: boolean;
  graduated: boolean;
  uniswapPair: string;
}

export function GraduationPanel({
  tokenAddress,
  tokensForLP,
  totalSupply,
  saleActive,
  graduated,
  uniswapPair,
}: GraduationPanelProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [ethAmount, setEthAmount] = useState('0.01');

  const contractAddress = getContractAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleGraduate = () => {
    if (!isConnected) return;

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: GLUED_LAUNCH_ABI,
      functionName: 'graduateToUniswap',
      args: [tokenAddress as `0x${string}`],
      value: parseEther(ethAmount),
    });
  };

  // Already graduated
  if (graduated) {
    return (
      <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #00e87b25' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#00e87b' }} />
          <h3 className="text-base font-bold" style={{ color: '#00e87b' }}>Graduated to Uniswap</h3>
        </div>
        <p className="text-sm mb-5" style={{ color: '#5c5e69' }}>
          This token is now tradeable on Uniswap V2!
        </p>
        <a
          href={`https://app.uniswap.org/swap?chain=sepolia&outputCurrency=${tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 px-6 font-semibold text-sm rounded-lg text-center transition-all hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white' }}
        >
          Trade on Uniswap
        </a>
        {uniswapPair && uniswapPair !== '0x0000000000000000000000000000000000000000' && (
          <a
            href={`https://sepolia.etherscan.io/address/${uniswapPair}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs mt-3 transition-colors"
            style={{ color: '#5c5e69' }}
          >
            View LP on Etherscan
          </a>
        )}
      </div>
    );
  }

  // Sale still active
  if (saleActive) {
    return (
      <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
        <h3 className="text-base font-bold mb-4" style={{ color: '#f0f0f2' }}>Uniswap Graduation</h3>
        <div className="rounded-lg p-4 text-sm" style={{ background: '#f59e0b10', border: '1px solid #f59e0b20', color: '#fcd34d' }}>
          <p className="font-semibold mb-1">Waiting for sale to end</p>
          <p className="text-xs" style={{ color: '#f59e0b80' }}>
            Once all tokens are sold, anyone can graduate this token to Uniswap V2
            by providing ETH for initial liquidity.
          </p>
        </div>
        <div className="mt-4 text-xs font-mono" style={{ color: '#5c5e69' }}>
          LP tokens reserved: {formatTokenAmount(tokensForLP, totalSupply)}
        </div>
      </div>
    );
  }

  // Ready to graduate
  return (
    <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #a855f725' }}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#a855f7' }} />
        <h3 className="text-base font-bold" style={{ color: '#a855f7' }}>Ready to Graduate!</h3>
      </div>

      <p className="text-sm mb-5" style={{ color: '#5c5e69' }}>
        Sale has ended. Provide ETH to create a Uniswap V2 liquidity pool.
        You&apos;ll receive LP tokens as a reward!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
            ETH for Liquidity Pool
          </label>
          <input
            type="text"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="0.01"
            className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-1 focus:ring-[#a855f7] focus:border-[#a855f740]"
            style={{ background: '#16171c', border: '1px solid #1e2028', color: '#f0f0f2' }}
          />
        </div>

        <div className="rounded-lg p-4 space-y-2 text-sm" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
          <div className="flex justify-between">
            <span style={{ color: '#5c5e69' }}>Tokens for LP</span>
            <span className="font-mono" style={{ color: '#f0f0f2' }}>
              {formatTokenAmount(tokensForLP, totalSupply)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: '#5c5e69' }}>Your ETH contribution</span>
            <span className="font-mono" style={{ color: '#a855f7' }}>{ethAmount} ETH</span>
          </div>
          <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #1e2028' }}>
            <span style={{ color: '#5c5e69' }}>You receive</span>
            <span className="font-bold" style={{ color: '#00e87b' }}>LP Tokens</span>
          </div>
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
          Graduation successful! Token is now on Uniswap.
        </div>
      )}

      <button
        onClick={handleGraduate}
        disabled={!isConnected || isPending || isConfirming}
        className="mt-4 w-full py-3 px-6 font-semibold text-sm rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white' }}
      >
        {!isConnected
          ? 'Connect Wallet'
          : isPending
          ? 'Confirm in Wallet...'
          : isConfirming
          ? 'Graduating...'
          : 'Graduate to Uniswap'}
      </button>
    </div>
  );
}
