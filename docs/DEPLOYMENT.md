# Deployment Guide

Instructions for deploying GluedLaunch to production.

## Frontend Deployment

### Option 1: VPS with PM2 + Nginx

#### Build the Application

```bash
cd frontend
npm install
npm run build
```

#### Set Up PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "gluedlaunch" -- start

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

#### Nginx Reverse Proxy

Create an Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/gluedlaunch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set the root directory to `frontend`
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_WALLETCONNECT_ID`
   - `NEXT_PUBLIC_LAUNCH_ADDRESS`
5. Deploy

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_ID` | Yes | WalletConnect Project ID |
| `NEXT_PUBLIC_LAUNCH_ADDRESS` | Yes | GluedLaunch contract address |

## Smart Contract Deployment

### Prerequisites

- Solidity development environment (Hardhat or Foundry recommended)
- Wallet with ETH on the target network
- RPC endpoint for the target network

### Using Hardhat

```bash
# Install dependencies
npm install @glue-finance/expansions-pack @openzeppelin/contracts

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

Example deploy script:

```javascript
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const platformTreasury = deployer.address; // or a dedicated treasury
  const uniswapRouter = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3"; // Sepolia

  const GluedLaunch = await ethers.getContractFactory("GluedLaunch");
  const launch = await GluedLaunch.deploy(platformTreasury, uniswapRouter);

  console.log("GluedLaunch deployed to:", launch.target);
}

main().catch(console.error);
```

### Using Foundry

```bash
forge create contracts/GluedLaunch.sol:GluedLaunch \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --constructor-args $TREASURY_ADDRESS $UNISWAP_ROUTER
```

### Contract Verification

```bash
# Hardhat
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <TREASURY> <ROUTER>

# Foundry
forge verify-contract <CONTRACT_ADDRESS> contracts/GluedLaunch.sol:GluedLaunch \
  --chain-id 11155111 \
  --constructor-args $(cast abi-encode "constructor(address,address)" $TREASURY $ROUTER)
```

### After Deployment

1. Update `NEXT_PUBLIC_LAUNCH_ADDRESS` in your frontend `.env.local`
2. Update the ABI files in `frontend/src/contracts/abi.ts` if you modified the contracts
3. Rebuild and redeploy the frontend

## Network-Specific Addresses

### Sepolia Testnet

| Contract | Address |
|----------|---------|
| Uniswap V2 Router | `0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3` |
| GluedLaunch | `0x709830275f17E895eAd128fbf8e39EE54658A420` |

## Monitoring

### PM2 Monitoring

```bash
pm2 status          # Check process status
pm2 logs gluedlaunch # View logs
pm2 monit           # Real-time monitoring
```

### Comments Data

Comments are stored in `frontend/data/comments.json`. Back up this file periodically if you want to preserve user comments:

```bash
cp frontend/data/comments.json /backups/comments-$(date +%Y%m%d).json
```
