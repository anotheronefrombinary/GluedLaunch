/**
 * Format a token amount for display.
 *
 * The contract's bonding curve formula is: cost = tokenAmount * basePrice
 * where both are raw integers. New tokens pass totalSupply as a raw integer
 * (NOT parseEther-scaled) so that pricing works correctly.
 *
 * For these tokens, token amounts should be displayed as raw numbers,
 * not divided by 1e18 via formatEther.
 *
 * Heuristic: if the total supply is > 1e15, it was likely created with
 * parseEther and we use formatEther for display. Otherwise, display raw.
 */
import { formatEther } from 'viem';

const PARSE_ETHER_THRESHOLD = 10n ** 15n;

export function formatTokenAmount(amount: bigint, totalSupply?: bigint): string {
  if (totalSupply && totalSupply > PARSE_ETHER_THRESHOLD) {
    // Legacy token: totalSupply was parseEther-scaled
    return Number(formatEther(amount)).toLocaleString();
  }
  // New token: raw integer supply
  return Number(amount).toLocaleString();
}
