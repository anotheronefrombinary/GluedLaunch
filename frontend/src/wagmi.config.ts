import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, fallback } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'GluedLaunch',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'demo-project-id',
  chains: [sepolia],
  transports: {
    [sepolia.id]: fallback([
      http('https://ethereum-sepolia-rpc.publicnode.com'),
      http('https://rpc2.sepolia.org'),
      http('https://sepolia.gateway.tenderly.co'),
    ]),
  },
  ssr: true,
});
