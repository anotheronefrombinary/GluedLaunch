'use client';

import { useState, useEffect } from 'react';
import { getTokenMetadata } from '@/lib/tokenMetadata';
import { Identicon } from './Identicon';

interface TokenAvatarProps {
  address: string;
  size?: number;
  className?: string;
}

export function TokenAvatar({ address, size = 40, className }: TokenAvatarProps) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const meta = getTokenMetadata(address);
    if (meta?.image) setImage(meta.image);
  }, [address]);

  if (image) {
    return (
      <img
        src={image}
        alt="Token"
        width={size}
        height={size}
        className={`rounded-full shrink-0 object-cover ${className || ''}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return <Identicon address={address} size={size} className={className} />;
}
