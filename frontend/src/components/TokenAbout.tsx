'use client';

import { useState, useEffect } from 'react';
import { getTokenMetadata, type TokenMetadata } from '@/lib/tokenMetadata';

interface TokenAboutProps {
  tokenAddress: string;
}

export function TokenAbout({ tokenAddress }: TokenAboutProps) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

  useEffect(() => {
    setMetadata(getTokenMetadata(tokenAddress));
  }, [tokenAddress]);

  if (!metadata) return null;

  const { description, website, twitter, telegram } = metadata;
  const hasLinks = website || twitter || telegram;

  if (!description && !hasLinks) return null;

  return (
    <div className="rounded-xl p-5" style={{ background: '#111215', border: '1px solid #1e2028' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f2' }}>About</h3>

      {description && (
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#8b8d97' }}>
          {description}
        </p>
      )}

      {hasLinks && (
        <div className="flex flex-wrap gap-2">
          {website && (
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hover:opacity-80"
              style={{ background: '#16171c', border: '1px solid #1e2028', color: '#8b8d97' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M1.5 7h11M7 1.5c-1.5 1.5-2 3.5-2 5.5s.5 4 2 5.5M7 1.5c1.5 1.5 2 3.5 2 5.5s-.5 4-2 5.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Website
            </a>
          )}
          {twitter && (
            <a
              href={twitter.startsWith('http') ? twitter : `https://twitter.com/${twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hover:opacity-80"
              style={{ background: '#16171c', border: '1px solid #1e2028', color: '#8b8d97' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 1.5H9.5L7 5.5L4.5 1.5H1L5 7.5L1 12.5H2.5L5.5 8L8.5 12.5H12L7.5 6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Twitter
            </a>
          )}
          {telegram && (
            <a
              href={telegram.startsWith('http') ? telegram : `https://${telegram.startsWith('t.me') ? telegram : `t.me/${telegram}`}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hover:opacity-80"
              style={{ background: '#16171c', border: '1px solid #1e2028', color: '#8b8d97' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 6.5L12.5 1.5L10 12.5L6 8.5L12.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M6 8.5V11.5L7.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Telegram
            </a>
          )}
        </div>
      )}
    </div>
  );
}
