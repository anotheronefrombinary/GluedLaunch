'use client';

import { useState, useCallback } from 'react';

interface CopyShareButtonsProps {
  address: string;
  tokenName?: string;
}

export function CopyShareButtons({ address, tokenName }: CopyShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: tokenName ? `${tokenName} on GluedLaunch` : 'Token on GluedLaunch',
      text: tokenName
        ? `Check out ${tokenName} — a rug-proof token on GluedLaunch`
        : 'Check out this rug-proof token on GluedLaunch',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed — ignore
      }
    } else {
      // Fallback: copy URL
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [tokenName]);

  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
        style={{ background: '#16171c', border: '1px solid #1e2028', color: '#8b8d97' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4.5 5.5L7 3L9.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 3V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M3 8V10.5C3 11.05 3.45 11.5 4 11.5H10C10.55 11.5 11 11.05 11 10.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Share
      </button>

      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors"
        style={{
          background: copied ? '#00e87b15' : '#16171c',
          border: `1px solid ${copied ? '#00e87b30' : '#1e2028'}`,
          color: copied ? '#00e87b' : '#8b8d97',
        }}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="#00e87b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M9.5 4.5V3C9.5 2.17 8.83 1.5 8 1.5H3C2.17 1.5 1.5 2.17 1.5 3V8C1.5 8.83 2.17 9.5 3 9.5H4.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        )}
        {copied ? 'Copied!' : truncated}
      </button>
    </div>
  );
}
