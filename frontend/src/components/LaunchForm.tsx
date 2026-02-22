'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { GLUED_LAUNCH_ABI } from '@/contracts/abi';
import { getContractAddress } from '@/contracts/addresses';
import { saveTokenMetadata } from '@/lib/tokenMetadata';

export function LaunchForm() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('1000000');
  const [creatorPercent, setCreatorPercent] = useState(5);
  const [basePrice, setBasePrice] = useState('0.000001');
  const [priceIncrement, setPriceIncrement] = useState('0.00000001');
  const [transferTaxBps, setTransferTaxBps] = useState(0);
  const [vestingMonths, setVestingMonths] = useState(0);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [tokenImage, setTokenImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      alert('Image must be under 200KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setTokenImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const contractAddress = getContractAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // After successful creation, fetch the latest token and save metadata
  const { data: allTokens } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GLUED_LAUNCH_ABI,
    functionName: 'getAllTokens',
    query: { enabled: isSuccess },
  });

  useEffect(() => {
    if (isSuccess && allTokens && allTokens.length > 0) {
      const latestToken = allTokens[allTokens.length - 1];
      const meta: Record<string, string> = {};
      if (description) meta.description = description;
      if (website) meta.website = website;
      if (twitter) meta.twitter = twitter;
      if (telegram) meta.telegram = telegram;
      if (tokenImage) meta.image = tokenImage;
      if (Object.keys(meta).length > 0) {
        saveTokenMetadata(latestToken, meta);
      }
    }
  }, [isSuccess, allTokens, description, website, twitter, telegram, tokenImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    // totalSupply is passed as raw integer (NOT parseEther-scaled)
    // because the contract's bonding curve formula is: cost = tokenAmount * basePrice
    // If totalSupply were 1e18-scaled AND basePrice were 1e18-scaled, prices would be 1e18x too high.
    // By keeping totalSupply raw, a basePrice of parseEther('0.000001') = 1e12 wei
    // means: cost for 1 token = 1 * 1e12 wei = 0.000001 ETH ✓
    const totalSupplyRaw = BigInt(totalSupply);
    const creatorPercentWei = parseEther((creatorPercent / 100).toString());
    const basePriceWei = parseEther(basePrice);
    const priceIncrementWei = parseEther(priceIncrement);
    const vestingDurationSeconds = BigInt(vestingMonths * 30 * 24 * 60 * 60);

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: GLUED_LAUNCH_ABI,
      functionName: 'createToken',
      args: [
        name,
        symbol,
        totalSupplyRaw,
        creatorPercentWei,
        basePriceWei,
        priceIncrementWei,
        BigInt(transferTaxBps),
        vestingDurationSeconds,
      ],
    });
  };

  // Calculate price range preview
  const tokensForSale = parseFloat(totalSupply) * (1 - creatorPercent / 100) * 0.9; // 90% for sale, 10% for LP
  const startPrice = parseFloat(basePrice);
  const endPrice = startPrice + tokensForSale * parseFloat(priceIncrement);

  const inputStyle = {
    background: '#16171c',
    border: '1px solid #1e2028',
    color: '#f0f0f2',
  };

  const inputFocusClass = "w-full px-4 py-3 rounded-lg text-sm transition-all focus:ring-1 focus:ring-[#00e87b] focus:border-[#00e87b40]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
            Token Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Glued Doge"
            required
            className={inputFocusClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
            Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., GDOGE"
            required
            maxLength={10}
            className={`${inputFocusClass} uppercase`}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Token Image Upload */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
          Token Image <span style={{ color: '#5c5e69', fontWeight: 'normal' }}>(optional, max 200KB)</span>
        </label>
        <div className="flex items-center gap-4">
          {tokenImage ? (
            <div className="relative">
              <img
                src={tokenImage}
                alt="Token preview"
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '2px solid #1e2028' }}
              />
              <button
                type="button"
                onClick={() => setTokenImage(null)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ background: '#ef4444', color: 'white' }}
              >
                x
              </button>
            </div>
          ) : (
            <label
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-[#00e87b40]"
              style={{ background: '#16171c', border: '2px dashed #1e2028' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="#5c5e69" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
          <div className="text-xs" style={{ color: '#5c5e69' }}>
            <p>PNG, JPG, SVG, or WEBP</p>
            <p>Displayed as token avatar</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
          Description <span style={{ color: '#5c5e69', fontWeight: 'normal' }}>(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your token..."
          maxLength={280}
          rows={2}
          className={inputFocusClass}
          style={{ ...inputStyle, resize: 'none' as const }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
            className={inputFocusClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
            Twitter
          </label>
          <input
            type="text"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="@handle"
            className={inputFocusClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
            Telegram
          </label>
          <input
            type="text"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder="t.me/..."
            className={inputFocusClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
          Total Supply
        </label>
        <input
          type="number"
          value={totalSupply}
          onChange={(e) => setTotalSupply(e.target.value)}
          placeholder="1000000"
          required
          min="1"
          className={inputFocusClass}
          style={inputStyle}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium" style={{ color: '#5c5e69' }}>
            Your Allocation
          </label>
          <span className="text-xs font-bold font-mono" style={{ color: '#00e87b' }}>{creatorPercent}%</span>
        </div>
        <input
          type="range"
          value={creatorPercent}
          onChange={(e) => setCreatorPercent(parseInt(e.target.value))}
          min="0"
          max="20"
          step="1"
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1.5" style={{ color: '#5c5e69' }}>
          <span>0%</span>
          <span>20% max</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
            Base Price (ETH)
          </label>
          <input
            type="text"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="0.000001"
            required
            className={inputFocusClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#5c5e69' }}>
            Price Increment (ETH)
          </label>
          <input
            type="text"
            value={priceIncrement}
            onChange={(e) => setPriceIncrement(e.target.value)}
            placeholder="0.00000001"
            required
            className={inputFocusClass}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Floor Boost Tax */}
      <div className="rounded-lg p-4" style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium flex items-center gap-2" style={{ color: '#f59e0b' }}>
            <span>🔥</span> Floor Boost Tax
          </label>
          <span className="text-xs font-bold font-mono" style={{ color: '#f59e0b' }}>{(transferTaxBps / 100).toFixed(1)}%</span>
        </div>
        <input
          type="range"
          value={transferTaxBps}
          onChange={(e) => setTransferTaxBps(parseInt(e.target.value))}
          min="0"
          max="1000"
          step="50"
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1.5" style={{ color: '#5c5e69' }}>
          <span>0%</span>
          <span>10% max</span>
        </div>
        <p className="text-xs mt-2" style={{ color: '#5c5e69' }}>
          % of each transfer burned to increase floor price. More trading = higher floor.
        </p>
      </div>

      {/* Creator Vesting */}
      <div className="rounded-lg p-4" style={{ background: '#a855f710', border: '1px solid #a855f730' }}>
        <label className="text-xs font-medium flex items-center gap-2 mb-3" style={{ color: '#a855f7' }}>
          <span>🔒</span> Creator Vesting
        </label>
        <select
          value={vestingMonths}
          onChange={(e) => setVestingMonths(parseInt(e.target.value))}
          className={inputFocusClass}
          style={inputStyle}
        >
          <option value="0">No Lock</option>
          <option value="1">1 Month</option>
          <option value="3">3 Months</option>
          <option value="6">6 Months (Recommended)</option>
          <option value="12">12 Months</option>
        </select>
        <p className="text-xs mt-2" style={{ color: '#5c5e69' }}>
          Your tokens unlock linearly over this period. Builds buyer trust.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-lg p-4 space-y-2" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
        <h4 className="text-xs font-medium mb-3" style={{ color: '#5c5e69' }}>Launch Preview</h4>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#5c5e69' }}>Start Price</span>
          <span className="font-mono" style={{ color: '#00e87b' }}>{startPrice.toFixed(8)} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#5c5e69' }}>End Price</span>
          <span className="font-mono" style={{ color: '#00e87b' }}>{endPrice.toFixed(8)} ETH</span>
        </div>
        <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #1e2028' }}>
          <span style={{ color: '#5c5e69' }}>Tokens for Sale</span>
          <span className="font-mono" style={{ color: '#f0f0f2' }}>{tokensForSale.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#5c5e69' }}>LP Reserve</span>
          <span className="font-mono" style={{ color: '#a855f7' }}>10%</span>
        </div>
        {transferTaxBps > 0 && (
          <div className="flex justify-between text-sm">
            <span style={{ color: '#5c5e69' }}>Transfer Tax</span>
            <span className="font-mono" style={{ color: '#f59e0b' }}>{(transferTaxBps / 100).toFixed(1)}% burn</span>
          </div>
        )}
        {vestingMonths > 0 && (
          <div className="flex justify-between text-sm">
            <span style={{ color: '#5c5e69' }}>Your Vesting</span>
            <span className="font-mono" style={{ color: '#a855f7' }}>{vestingMonths} months</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg p-4 text-sm" style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#fca5a5' }}>
          {error.message.includes('User rejected') || error.message.includes('denied')
            ? 'Transaction cancelled'
            : `Error: ${error.message}`}
        </div>
      )}

      {isSuccess && (!allTokens || allTokens.length === 0) && (
        <div className="rounded-lg p-4 text-sm flex items-center gap-2" style={{ background: '#00e87b15', border: '1px solid #00e87b30', color: '#86efac' }}>
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
            <path d="M8 2C4.68629 2 2 4.68629 2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Token created! Loading details...
        </div>
      )}

      {isSuccess && allTokens && allTokens.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: '#00e87b10', border: '1px solid #00e87b30' }}>
          <div className="flex items-center gap-2 mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#00e87b" strokeWidth="1.5"/>
              <path d="M6 10L9 13L14 7" stroke="#00e87b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-semibold" style={{ color: '#00e87b' }}>Token Created Successfully!</span>
          </div>

          <div className="rounded-lg p-4 mb-4" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
            <div className="flex items-center gap-3 mb-3">
              {tokenImage ? (
                <img src={tokenImage} alt={name} className="w-12 h-12 rounded-full object-cover" style={{ border: '2px solid #1e2028' }} />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: '#00e87b20', color: '#00e87b' }}>
                  {symbol.slice(0, 2)}
                </div>
              )}
              <div>
                <h4 className="font-bold" style={{ color: '#f0f0f2' }}>{name}</h4>
                <span className="text-sm font-mono" style={{ color: '#5c5e69' }}>${symbol}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#5c5e69' }}>Contract</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono" style={{ color: '#00e87b' }}>
                    {allTokens[allTokens.length - 1].slice(0, 8)}...{allTokens[allTokens.length - 1].slice(-6)}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(allTokens[allTokens.length - 1])}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    title="Copy address"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="4" width="8" height="8" rx="1" stroke="#5c5e69" strokeWidth="1.2"/>
                      <path d="M2 10V3C2 2.44772 2.44772 2 3 2H10" stroke="#5c5e69" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#5c5e69' }}>Total Supply</span>
                <span className="font-mono" style={{ color: '#f0f0f2' }}>{parseFloat(totalSupply).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#5c5e69' }}>Your Allocation</span>
                <span className="font-mono" style={{ color: '#a855f7' }}>{creatorPercent}%</span>
              </div>
              {transferTaxBps > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: '#5c5e69' }}>Floor Boost Tax</span>
                  <span className="font-mono" style={{ color: '#f59e0b' }}>{(transferTaxBps / 100).toFixed(1)}%</span>
                </div>
              )}
              {vestingMonths > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: '#5c5e69' }}>Vesting Period</span>
                  <span className="font-mono" style={{ color: '#a855f7' }}>{vestingMonths} months</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`/token/${allTokens[allTokens.length - 1]}`}
              className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm text-center transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #00e87b, #00c2ff)', color: '#0b0c0e' }}
            >
              View Token
            </a>
            <a
              href={`https://sepolia.etherscan.io/address/${allTokens[allTokens.length - 1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-lg font-semibold text-sm transition-all hover:bg-white/5"
              style={{ background: '#16171c', border: '1px solid #1e2028', color: '#8b8d97' }}
            >
              Etherscan
            </a>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!isConnected || isPending || isConfirming}
        className="w-full py-3.5 px-6 font-semibold text-sm rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg, #00e87b, #00c2ff)', color: '#0b0c0e' }}
      >
        {!isConnected
          ? 'Connect Wallet to Launch'
          : isPending
          ? 'Confirm in Wallet...'
          : isConfirming
          ? 'Creating Token...'
          : 'Launch Token'}
      </button>
    </form>
  );
}
