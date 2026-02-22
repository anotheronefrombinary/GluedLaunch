import { Header } from '@/components/Header';
import { LaunchForm } from '@/components/LaunchForm';
import Link from 'next/link';

export default function LaunchPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0b0c0e' }}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Launch Your{' '}
            <span className="text-gradient-green">Rug-Proof</span>{' '}
            Token
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8b8d97' }}>
            Create a token backed by real ETH collateral. Your buyers can never be rugged.
          </p>
        </section>

        {/* How It Works Summary */}
        <section className="mb-12">
          <div className="rounded-xl p-6" style={{ background: '#111215', border: '1px solid #1e2028' }}>
            <h2 className="text-sm font-semibold mb-5 text-center" style={{ color: '#f0f0f2' }}>What Happens When You Launch</h2>
            <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
              {[
                { num: '1', text: 'New token contract deployed', color: '#00e87b' },
                { num: '2', text: 'Glue vault created automatically', color: '#00c2ff' },
                { num: '3', text: 'You receive creator allocation', color: '#a855f7' },
                { num: '4', text: 'Bonding curve sale begins', color: '#ec4899' },
              ].map((step) => (
                <div key={step.num} className="p-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2.5" style={{ background: `${step.color}15` }}>
                    <span className="text-xs font-bold" style={{ color: step.color }}>{step.num}</span>
                  </div>
                  <p style={{ color: '#8b8d97' }}>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Launch Form */}
        <section className="max-w-2xl mx-auto mb-12">
          <div className="rounded-2xl p-8" style={{ background: '#111215', border: '1px solid #1e2028' }}>
            <LaunchForm />
          </div>
        </section>

        {/* Token Distribution Preview */}
        <section className="max-w-2xl mx-auto mb-12">
          <div className="rounded-xl p-6" style={{ background: '#111215', border: '1px solid #1e2028' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0f0f2' }}>Token Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#1e2028' }}>
                  <div className="h-full rounded-full" style={{ width: '81%', background: 'linear-gradient(90deg, #00e87b, #00c2ff)' }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded" style={{ background: '#00e87b' }} />
                  <span style={{ color: '#5c5e69' }}>Bonding Curve Sale (81%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded" style={{ background: '#a855f7' }} />
                  <span style={{ color: '#5c5e69' }}>Uniswap LP Reserve (10%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded" style={{ background: '#f59e0b' }} />
                  <span style={{ color: '#5c5e69' }}>Creator (up to 9%*)</span>
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: '#5c5e69' }}>
                *Creator allocation adjusts other percentages. Example shown for 9% creator allocation.
              </p>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl p-5" style={{ background: '#00c2ff08', border: '1px solid #00c2ff15' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#7dd3fc' }}>Why Rug-Proof?</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#5c5e69' }}>
                When buyers purchase tokens, their ETH goes directly to the Glue contract as collateral &mdash;
                not to you. You cannot access buyer funds. They can always burn for floor price.
              </p>
            </div>
            <div className="rounded-xl p-5" style={{ background: '#a855f708', border: '1px solid #a855f715' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#c084fc' }}>What&apos;s Graduation?</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#5c5e69' }}>
                10% of tokens are reserved for Uniswap liquidity. After the bonding curve sale ends,
                anyone can create the Uniswap pair to enable DEX trading.
              </p>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <section className="text-center mt-12">
          <Link
            href="/tokens"
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: '#5c5e69' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            View All Tokens
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e2028' }} className="mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: '#5c5e69' }}>GluedLaunch 2026</p>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>Home</Link>
            <Link href="/features" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>Features</Link>
            <Link href="/tokens" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>All Tokens</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
