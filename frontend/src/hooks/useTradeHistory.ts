'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { parseAbiItem } from 'viem';
import { getContractAddress } from '@/contracts/addresses';

export interface Trade {
  type: 'buy' | 'sell';
  buyer: string;
  ethSpent: bigint;
  tokensReceived: bigint;
  newTokensSold: bigint;
  blockNumber: bigint;
  transactionHash: string;
  timestamp?: number;
}

const PURCHASE_EVENT = parseAbiItem(
  'event TokensPurchased(address indexed token, address indexed buyer, uint256 ethSpent, uint256 tokensReceived, uint256 newTokensSold)'
);

const UNGLUED_EVENT = parseAbiItem(
  'event unglued(address indexed recipient, uint256 realAmount, uint256 beforeTotalSupply, uint256 afterTotalSupply, uint256 supplyDelta)'
);

// Max block range per getLogs call (most RPCs cap at 50k)
const MAX_RANGE = 49_000n;

export function useTradeHistory(tokenAddress: string, glueAddress?: string) {
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Persist across renders: last scanned block, cached trades, cached timestamps
  const lastBlockRef = useRef<bigint>(0n);
  const cachedTradesRef = useRef<Trade[]>([]);
  const blockTimestampCache = useRef<Map<bigint, number>>(new Map());

  const processSellLog = useCallback(async (log: any): Promise<Trade> => {
    const realAmount = log.args.realAmount as bigint;
    const afterTotalSupply = log.args.afterTotalSupply as bigint;

    let ethEstimate = 0n;
    try {
      if (glueAddress && afterTotalSupply > 0n) {
        const glueBalance = await publicClient!.getBalance({
          address: glueAddress as `0x${string}`,
          blockNumber: log.blockNumber,
        });
        ethEstimate = (glueBalance * realAmount) / afterTotalSupply;
      }
    } catch {
      // If historical balance query fails, use 0
    }

    return {
      type: 'sell',
      buyer: log.args.recipient as string,
      ethSpent: ethEstimate,
      tokensReceived: realAmount,
      newTokensSold: 0n,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    };
  }, [publicClient, glueAddress]);

  useEffect(() => {
    if (!publicClient || !tokenAddress || !contractAddress) return;

    let cancelled = false;

    async function fetchTrades(isInitial: boolean) {
      if (isInitial) setIsLoading(true);
      try {
        const latestBlock = await publicClient!.getBlockNumber();

        // Determine start block
        let fromBlock: bigint;
        if (isInitial) {
          // Initial: scan last ~49k blocks (single RPC call, ~7 days on Sepolia)
          fromBlock = latestBlock > MAX_RANGE ? latestBlock - MAX_RANGE : 0n;
        } else {
          // Poll: only scan new blocks since last fetch
          fromBlock = lastBlockRef.current + 1n;
          if (fromBlock > latestBlock) return; // nothing new
        }

        // Single getLogs call for buy + sell in parallel
        const [buyLogs, sellLogs] = await Promise.all([
          publicClient!.getLogs({
            address: contractAddress as `0x${string}`,
            event: PURCHASE_EVENT,
            args: { token: tokenAddress as `0x${string}` },
            fromBlock,
            toBlock: latestBlock,
          }),
          glueAddress
            ? publicClient!.getLogs({
                address: glueAddress as `0x${string}`,
                event: UNGLUED_EVENT,
                fromBlock,
                toBlock: latestBlock,
              })
            : Promise.resolve([]),
        ]);

        if (cancelled) return;

        // Process buy trades
        const newBuyTrades: Trade[] = (buyLogs as any[]).map((log) => ({
          type: 'buy' as const,
          buyer: log.args.buyer as string,
          ethSpent: log.args.ethSpent as bigint,
          tokensReceived: log.args.tokensReceived as bigint,
          newTokensSold: log.args.newTokensSold as bigint,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        }));

        // Process sell trades
        const newSellTrades: Trade[] = await Promise.all(
          (sellLogs as any[]).map((log) => processSellLog(log))
        );

        if (cancelled) return;

        // Merge new trades
        const newTrades = [...newBuyTrades, ...newSellTrades];

        // Fetch timestamps for new trades (using cache)
        const blocksToFetch = [...new Set(newTrades.map((t) => t.blockNumber))]
          .filter((b) => !blockTimestampCache.current.has(b));

        if (blocksToFetch.length > 0) {
          await Promise.all(
            blocksToFetch.map(async (blockNum) => {
              try {
                const block = await publicClient!.getBlock({ blockNumber: blockNum });
                blockTimestampCache.current.set(blockNum, Number(block.timestamp));
              } catch {
                // ignore
              }
            })
          );
        }

        // Apply timestamps to new trades
        const newTradesWithTime = newTrades.map((t) => ({
          ...t,
          timestamp: blockTimestampCache.current.get(t.blockNumber),
        }));

        // Deduplicate by transactionHash when merging with cache
        const existingHashes = new Set(cachedTradesRef.current.map((t) => t.transactionHash));
        const uniqueNew = newTradesWithTime.filter((t) => !existingHashes.has(t.transactionHash));

        if (uniqueNew.length > 0 || isInitial) {
          const allTrades = [...cachedTradesRef.current, ...uniqueNew].sort(
            (a, b) => Number(a.blockNumber - b.blockNumber)
          );
          cachedTradesRef.current = allTrades;

          if (!cancelled) {
            setTrades([...allTrades].reverse()); // newest first
          }
        }

        // Update last scanned block
        lastBlockRef.current = latestBlock;
      } catch (err) {
        console.error('Failed to fetch trade history:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    // Initial fetch
    fetchTrades(true);

    // Poll every 6 seconds — only fetches new blocks, so it's fast
    const interval = setInterval(() => {
      fetchTrades(false);
    }, 6_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicClient, tokenAddress, contractAddress, glueAddress, processSellLog]);

  return { trades, isLoading };
}
