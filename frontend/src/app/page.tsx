import { Header } from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#0b0c0e' }}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: '#00e87b10', color: '#00e87b', border: '1px solid #00e87b20' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00e87b' }} />
            Live on Sepolia Testnet
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-green">Rug-Proof</span>
            <br />
            <span style={{ color: '#f0f0f2' }}>Token Launchpad</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: '#8b8d97' }}>
            Launch memecoins that literally can&apos;t go to zero.
            Every token has a mathematical price floor backed by real ETH collateral.
          </p>

          {/* Stat Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <span className="text-sm font-bold" style={{ color: '#00e87b' }}>100%</span>
              <span className="text-sm" style={{ color: '#5c5e69' }}>Collateral Backed</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <span className="text-sm font-bold" style={{ color: '#00e87b' }}>0%</span>
              <span className="text-sm" style={{ color: '#5c5e69' }}>Rug Risk</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl" style={{ background: '#111215', border: '1px solid #f59e0b20' }}>
              <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>Auto-Burn</span>
              <span className="text-sm" style={{ color: '#5c5e69' }}>Floor Boost</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl" style={{ background: '#111215', border: '1px solid #a855f720' }}>
              <span className="text-sm font-bold" style={{ color: '#a855f7' }}>Vested</span>
              <span className="text-sm" style={{ color: '#5c5e69' }}>Creator Tokens</span>
            </div>
          </div>

          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#00e87b' }}
          >
            Explore all features
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </section>

        {/* Key Features Grid */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2" style={{ color: '#f0f0f2' }}>Why <Image src="/logo.png" alt="GluedLaunch" width={831} height={285} className="h-8 w-auto inline-block" />?</h2>
            <p className="text-sm" style={{ color: '#5c5e69' }}>Built different from every other launchpad</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6V14L10 18L17 14V6L10 2Z" stroke="#00e87b" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 8V12M10 12L7 10M10 12L13 10" stroke="#00e87b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ), title: 'Rug-Proof', desc: 'ETH goes to Glue contract, not creator. Mathematical price floor guaranteed.', color: '#00e87b' },
              { icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17L7 10L11 13L17 3" stroke="#00c2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ), title: 'Bonding Curve', desc: 'Early buyers get better prices. Price increases as tokens sell.', color: '#00c2ff' },
              { icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 2L18 6L14 10" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ), title: 'Uniswap Graduation', desc: 'Auto-graduate to Uniswap V2 after sale. Real DEX liquidity.', color: '#a855f7' },
              { icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3C10 3 7 6 7 9C7 11 8.5 12.5 10 13C11.5 12.5 13 11 13 9C13 6 10 3 10 3Z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 13V17M7 17H13" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/></svg>
              ), title: 'Floor Boost Tax', desc: 'Optional transfer tax burns tokens. More trading = higher floor price.', color: '#f59e0b', isNew: true },
              { icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="8" width="12" height="9" rx="2" stroke="#ec4899" strokeWidth="1.5"/><path d="M7 8V5C7 3.34 8.34 2 10 2C11.66 2 13 3.34 13 5V8" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/></svg>
              ), title: 'Creator Vesting', desc: 'Lock creator tokens for 1-12 months. Linear unlock prevents dumps.', color: '#ec4899', isNew: true },
              { icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2V10L14 14" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8" stroke="#8b5cf6" strokeWidth="1.5"/></svg>
              ), title: 'Burn for ETH', desc: 'Always redeem tokens for proportional collateral. Exit anytime.', color: '#8b5cf6' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl p-5 card-glow relative"
                style={{ background: '#111215', border: `1px solid ${feature.isNew ? feature.color + '30' : '#1e2028'}` }}
              >
                {feature.isNew && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: feature.color + '20', color: feature.color }}>
                    NEW
                  </span>
                )}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${feature.color}10` }}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-1.5 text-sm" style={{ color: '#f0f0f2' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#5c5e69' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Token Lifecycle */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#f0f0f2' }}>Token Lifecycle</h2>
            <p className="text-sm" style={{ color: '#5c5e69' }}>From launch to Uniswap in four steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { num: '01', title: 'Launch', desc: 'Set supply, pricing, floor boost tax (0-10%), and creator vesting (1-12 months).', color: '#00e87b' },
              { num: '02', title: 'Sale', desc: 'Users buy on bonding curve. ETH goes directly to Glue as collateral.', color: '#00c2ff' },
              { num: '03', title: 'Graduate', desc: 'After sale ends, token graduates to Uniswap V2 with reserved LP tokens.', color: '#a855f7' },
              { num: '04', title: 'Trade', desc: 'Trade on Uniswap. Floor boost tax burns tokens. Floor rises with every trade.', color: '#ec4899' },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-xl p-6 relative"
                style={{ background: '#111215', border: '1px solid #1e2028' }}
              >
                <span className="text-xs font-bold font-mono mb-3 block" style={{ color: step.color }}>{step.num}</span>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#f0f0f2' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#5c5e69' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* New Features Highlight */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4" style={{ background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b20' }}>
              New Features
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#f0f0f2' }}>Built-In Trust Mechanisms</h2>
            <p className="text-sm" style={{ color: '#5c5e69' }}>Every trade increases the floor. Creator tokens are locked.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Floor Boost Tax */}
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: '#111215', border: '1px solid #f59e0b30' }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at 80% 20%, #f59e0b, transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: '#f59e0b15' }}>
                    &#128293;
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#f0f0f2' }}>Floor Boost Tax</h3>
                    <p className="text-xs" style={{ color: '#f59e0b' }}>0-10% configurable at launch</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#8b8d97' }}>
                  Every token transfer burns a percentage of the amount. Burned tokens reduce supply,
                  mathematically increasing the floor price. More trading volume = higher floor.
                </p>
                <div className="rounded-lg p-4" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                  <div className="text-xs font-mono mb-2" style={{ color: '#5c5e69' }}>Example with 5% tax:</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span style={{ color: '#5c5e69' }}>1000 trades</span>
                      <span className="block font-mono font-bold" style={{ color: '#f59e0b' }}>~50% supply burned</span>
                    </div>
                    <div>
                      <span style={{ color: '#5c5e69' }}>Floor price</span>
                      <span className="block font-mono font-bold" style={{ color: '#00e87b' }}>2x increase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Vesting */}
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: '#111215', border: '1px solid #a855f730' }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at 80% 20%, #a855f7, transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: '#a855f715' }}>
                    &#128274;
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#f0f0f2' }}>Creator Vesting</h3>
                    <p className="text-xs" style={{ color: '#a855f7' }}>1-12 months linear unlock</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#8b8d97' }}>
                  Creator tokens are locked at launch and unlock linearly over the vesting period.
                  This prevents creator dumps and builds long-term buyer confidence.
                </p>
                <div className="rounded-lg p-4" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                  <div className="text-xs font-mono mb-3" style={{ color: '#5c5e69' }}>6-month vesting schedule:</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1e2028' }}>
                      <div className="h-full rounded-full" style={{ width: '50%', background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
                    </div>
                    <span className="text-xs font-mono" style={{ color: '#a855f7' }}>50%</span>
                  </div>
                  <div className="flex justify-between text-[10px] mt-1" style={{ color: '#5c5e69' }}>
                    <span>Launch</span>
                    <span>Month 3</span>
                    <span>Month 6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem We Solve */}
        <section className="mb-20">
          <div className="rounded-2xl p-10 relative overflow-hidden" style={{ background: '#111215', border: '1px solid #1e2028' }}>
            <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #ef4444, transparent 50%, #00e87b)' }} />
            <div className="relative">
              <h2 className="text-xl font-bold text-center mb-8" style={{ color: '#f0f0f2' }}>The Problem We Solve</h2>
              <div className="grid md:grid-cols-2 gap-10 text-center">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#ef4444' }}>Traditional Memecoins</h3>
                  <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ef4444' }}>98.6%</p>
                  <p className="text-sm" style={{ color: '#5c5e69' }}>go to zero (rugs, abandonment, no liquidity)</p>
                </div>
                <div>
                  <div className="flex justify-center mb-3">
                    <Image src="/logo.png" alt="GluedLaunch" width={831} height={285} className="h-9 w-auto" />
                  </div>
                  <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#00e87b' }}>0%</p>
                  <p className="text-sm" style={{ color: '#5c5e69' }}>can go to zero (backed by real ETH collateral)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-2xl mx-auto mb-20" id="launch">
          <div className="rounded-2xl p-10 text-center relative overflow-hidden" style={{ background: '#111215', border: '1px solid #00e87b15' }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at 50% 0%, #00e87b, transparent 70%)' }} />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#f0f0f2' }}>Ready to Launch?</h2>
              <p className="text-sm mb-8" style={{ color: '#5c5e69' }}>
                Create your own rug-proof token in minutes. No coding required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/launch"
                  className="px-8 py-3 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #00e87b, #00c2ff)', color: '#0b0c0e' }}
                >
                  Launch Token
                </Link>
                <Link
                  href="/tokens"
                  className="px-8 py-3 rounded-lg font-semibold text-sm transition-all"
                  style={{ background: '#16171c', border: '1px solid #1e2028', color: '#8b8d97' }}
                >
                  Browse Tokens
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Built On Section */}
        <section className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#5c5e69' }}>Built on</p>
          <a
            href="https://glue.finance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-2xl font-bold text-gradient-purple transition-opacity hover:opacity-80"
          >
            Glue Protocol
          </a>
          <p className="text-sm mt-4 max-w-md mx-auto" style={{ color: '#5c5e69' }}>
            The permissionless protocol for backing any ERC20/ERC721 with on-chain collateral.
            No oracles. No upgradability. Just math.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e2028' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: '#5c5e69' }}>ETH Tbilisi Hackathon 2024</p>
          <div className="flex gap-6 text-sm">
            <Link href="/features" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>Features</Link>
            <Link href="/tokens" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>All Tokens</Link>
            <Link href="/launch" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>Launch</Link>
            <a href="https://glue.finance" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>Glue Protocol</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
