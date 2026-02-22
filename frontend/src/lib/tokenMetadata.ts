export interface TokenMetadata {
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  image?: string; // base64 data URL
}

const STORAGE_KEY = 'gluedlaunch_token_metadata';

function getAll(): Record<string, TokenMetadata> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveTokenMetadata(address: string, metadata: TokenMetadata): void {
  const all = getAll();
  all[address.toLowerCase()] = metadata;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getTokenMetadata(address: string): TokenMetadata | null {
  const all = getAll();
  return all[address.toLowerCase()] || null;
}
