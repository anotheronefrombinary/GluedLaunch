'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/tokens', label: 'Tokens' },
    { href: '/launch', label: 'Launch' },
  ];

  return (
    <header className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid #1e2028' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="GluedLaunch"
            width={831}
            height={285}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  color: isActive ? '#00e87b' : '#8b8d97',
                  background: isActive ? '#00e87b10' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className="block w-6 h-0.5 transition-all"
            style={{
              background: '#00e87b',
              transform: mobileMenuOpen ? 'rotate(45deg) translate(8px, 8px)' : 'none',
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all"
            style={{
              background: '#00e87b',
              opacity: mobileMenuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all"
            style={{
              background: '#00e87b',
              transform: mobileMenuOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none',
            }}
          />
        </button>

        <div className="flex items-center gap-3">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none' as const,
                      userSelect: 'none' as const,
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
                          style={{
                            background: 'linear-gradient(135deg, #00e87b, #00c2ff)',
                            color: '#0b0c0e',
                          }}
                        >
                          Connect
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="px-4 py-2 text-sm font-semibold rounded-lg"
                          style={{ background: '#ef4444', color: 'white' }}
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={openChainModal}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors"
                          style={{ background: '#16171c', border: '1px solid #1e2028', color: '#8b8d97' }}
                        >
                          {chain.hasIcon && chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          {chain.name}
                        </button>
                        <button
                          onClick={openAccountModal}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-mono rounded-lg transition-colors"
                          style={{ background: '#16171c', border: '1px solid #1e2028', color: '#f0f0f2' }}
                        >
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden"
          style={{
            background: 'rgba(11, 12, 14, 0.95)',
            borderBottom: '1px solid #1e2028',
            backdropFilter: 'blur(10px)',
          }}
        >
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    color: isActive ? '#00e87b' : '#8b8d97',
                    background: isActive ? '#00e87b10' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
