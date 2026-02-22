// Contract addresses - update after deployment
// These are placeholders until deployed to Sepolia

export const CONTRACTS = {
  // Sepolia testnet (chainId: 11155111)
  sepolia: {
    gluedLaunch: process.env.NEXT_PUBLIC_LAUNCH_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
} as const;

// Get contract address for current chain
export function getContractAddress(chainId: number): string {
  if (chainId === 11155111) {
    return CONTRACTS.sepolia.gluedLaunch;
  }
  return '0x0000000000000000000000000000000000000000';
}
