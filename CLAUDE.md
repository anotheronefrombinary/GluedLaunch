# GluedLaunch — Project Context

## What This Is
Rug-proof token launchpad built on Glue Protocol, deployed to Sepolia testnet at gluedlaunch.3w.ge.

## Current State
- Git repo initialized on `main` branch, tagged `v1.0.0`
- GitHub remote added and code pushed to https://github.com/anotheronefrombinary/GluedLaunch
- All documentation, LICENSE, CONTRIBUTING, .github templates are created
- Frontend runs on port 3000 via PM2 + Nginx reverse proxy
- Smart contracts deployed to Sepolia: `0x709830275f17E895eAd128fbf8e39EE54658A420`

## Tech Stack
- **Frontend:** Next.js 16, React 19, RainbowKit v2, Wagmi v2, Viem, Tailwind CSS v4
- **Contracts:** Solidity ^0.8.28, Glue Protocol (StickyAsset), OpenZeppelin, Uniswap V2
- **Infra:** PM2 process manager, Nginx reverse proxy, Let's Encrypt SSL

## Key Files
- `contracts/GluedLaunch.sol` — Factory + bonding curve
- `contracts/GluedToken.sol` — ERC20 + tax + vesting + Glue integration
- `frontend/src/` — All React components, hooks, ABIs
- `frontend/.env.local` — Contains WalletConnect ID (excluded from git)
- `docs/` — SETUP, ARCHITECTURE, CONTRACTS, DEPLOYMENT, API docs

## Placeholder Text to Update
- `yourusername` appears in README.md, package.json, docs/SETUP.md — replace with actual GitHub username

## Important
- Never commit `.env.local` — contains WalletConnect Project ID
- `frontend/data/comments.json` is gitignored (user-generated content)
- Server configs (nginx.conf, setup.sh, ecosystem.config.js) are gitignored
