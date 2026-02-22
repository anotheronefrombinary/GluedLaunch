'use client';

/**
 * Deterministic SVG identicon generated from an Ethereum address.
 * Produces a unique 5x5 symmetric grid pattern with colors derived from the address.
 */

interface IdenticonProps {
  address: string;
  size?: number;
  className?: string;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getColors(address: string): { bg: string; fg: string } {
  const addr = address.toLowerCase();
  const h1 = parseInt(addr.slice(2, 8), 16) % 360;
  const h2 = (h1 + 120) % 360;
  return {
    bg: `hsl(${h2}, 40%, 12%)`,
    fg: `hsl(${h1}, 70%, 55%)`,
  };
}

function getPattern(address: string): boolean[][] {
  const addr = address.toLowerCase().replace('0x', '');
  const grid: boolean[][] = [];

  for (let row = 0; row < 5; row++) {
    grid[row] = [];
    for (let col = 0; col < 3; col++) {
      const idx = (row * 3 + col) % addr.length;
      const val = parseInt(addr[idx], 16);
      grid[row][col] = val > 7;
    }
    // Mirror for symmetry
    grid[row][3] = grid[row][1];
    grid[row][4] = grid[row][0];
  }

  return grid;
}

export function Identicon({ address, size = 40, className }: IdenticonProps) {
  if (!address || address.length < 10) {
    return (
      <div
        className={`rounded-full shrink-0 ${className || ''}`}
        style={{ width: size, height: size, background: '#1e2028' }}
      />
    );
  }

  const { bg, fg } = getColors(address);
  const pattern = getPattern(address);
  const cellSize = size / 5;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`rounded-full shrink-0 ${className || ''}`}
      style={{ background: bg }}
    >
      {pattern.map((row, y) =>
        row.map((filled, x) =>
          filled ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={fg}
            />
          ) : null
        )
      )}
    </svg>
  );
}
