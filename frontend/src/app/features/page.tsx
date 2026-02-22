import { Header } from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0b0c0e' }}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Platform{' '}
            <span className="text-gradient-green">Features</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8b8d97' }}>
            Everything you need to launch and trade rug-proof tokens with mathematical price floors.
          </p>
        </section>

        {/* Core Features */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: '#f0f0f2' }}>
            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#00e87b10', color: '#00e87b' }}>
              01
            </span>
            Core Technology
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-7" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #00e87b20, #00c2ff20)' }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6V14L10 18L17 14V6L10 2Z" stroke="#00e87b" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#f0f0f2' }}>Rug-Proof by Design</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#5c5e69' }}>
                When users buy tokens, their ETH goes directly to the Glue contract as collateral &mdash;
                never to the creator. This architectural decision makes rug pulls mathematically impossible.
              </p>
              <ul className="space-y-2.5">
                {['Creator cannot access buyer funds', 'All ETH becomes permanent collateral', 'Transparent on-chain verification'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#8b8d97' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 4" stroke="#00e87b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-7" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #00c2ff20, #0070ff20)' }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3 17L7 10L11 13L17 3" stroke="#00c2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#f0f0f2' }}>Mathematical Price Floor</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#5c5e69' }}>
                Every token has a guaranteed minimum value. The floor price is calculated as
                Total Collateral / Total Supply. You can always burn tokens to receive this value.
              </p>
              <div className="rounded-lg p-4 font-mono text-sm" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                <div className="text-xs mb-1.5" style={{ color: '#5c5e69' }}>Floor Price Formula:</div>
                <div style={{ color: '#00e87b' }}>floor = collateral / supply</div>
                <div className="text-xs mt-2" style={{ color: '#5c5e69' }}>Example: 10 ETH / 1M tokens = 0.00001 ETH</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trading Features */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: '#f0f0f2' }}>
            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#00c2ff10', color: '#00c2ff' }}>
              02
            </span>
            Trading Mechanics
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17L7 10L11 13L17 3" stroke="#00c2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: 'Bonding Curve Pricing',
                desc: 'Token price increases automatically as more tokens are sold. Early buyers get better prices, creating natural incentive for early participation.',
                formula: { label: 'Price =', value: 'base + (sold x increment)' },
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M6 12L10 16L14 12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: 'Burn to Redeem',
                desc: 'Token holders can burn their tokens anytime to receive proportional ETH collateral. This creates a guaranteed exit at floor price.',
                stats: [{ label: 'Protocol Fee', value: '0.1%' }, { label: 'Platform Fee', value: '2%' }],
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2V10L14 14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8" stroke="#a855f7" strokeWidth="1.5"/></svg>,
                title: 'Slippage Protection',
                desc: 'Built-in slippage protection ensures you receive at least the minimum tokens expected. Set your tolerance and trade with confidence.',
                info: 'Adjustable from 1% to 20% based on your preference',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl p-6" style={{ background: '#111215', border: '1px solid #1e2028' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: '#16171c' }}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#f0f0f2' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#5c5e69' }}>{feature.desc}</p>
                {feature.formula && (
                  <div className="rounded-lg p-3 text-xs font-mono" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                    <span style={{ color: '#5c5e69' }}>{feature.formula.label} </span>
                    <span style={{ color: '#00c2ff' }}>{feature.formula.value}</span>
                  </div>
                )}
                {feature.stats && (
                  <div className="rounded-lg p-3 text-xs space-y-1" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                    {feature.stats.map((stat) => (
                      <div key={stat.label} className="flex justify-between">
                        <span style={{ color: '#5c5e69' }}>{stat.label}</span>
                        <span style={{ color: '#f0f0f2' }}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {feature.info && (
                  <div className="rounded-lg p-3 text-xs" style={{ background: '#16171c', border: '1px solid #1e2028', color: '#8b8d97' }}>
                    {feature.info}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Graduation Feature */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: '#f0f0f2' }}>
            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#a855f710', color: '#a855f7' }}>
              03
            </span>
            Uniswap Graduation
          </h2>
          <div className="rounded-2xl p-8 overflow-hidden relative" style={{ background: '#111215', border: '1px solid #a855f715' }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at 80% 20%, #a855f7, transparent 60%)' }} />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#f0f0f2' }}>From Bonding Curve to DEX</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#8b8d97' }}>
                  Once the bonding curve sale completes, tokens can graduate to Uniswap V2 for
                  real DEX trading. 10% of tokens are automatically reserved for initial liquidity.
                </p>
                <ul className="space-y-4">
                  {[
                    { title: 'Reserved LP Tokens', desc: '10% of supply set aside for Uniswap liquidity' },
                    { title: 'Anyone Can Graduate', desc: 'Provide ETH to create the pair and earn LP tokens' },
                    { title: 'Dual Liquidity', desc: 'Trade on Uniswap while floor price remains from Glue' },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M6 3L11 8L6 13" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#f0f0f2' }}>{item.title}</div>
                        <div className="text-xs" style={{ color: '#5c5e69' }}>{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-6" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                <h4 className="font-semibold text-sm mb-5" style={{ color: '#a855f7' }}>Graduation Flow</h4>
                <div className="space-y-5">
                  {[
                    { num: '1', text: 'Bonding curve sale completes (all tokens sold)', color: '#a855f7' },
                    { num: '2', text: 'Anyone calls graduateToUniswap() with ETH', color: '#a855f7' },
                    { num: '3', text: 'Uniswap V2 pair created with reserved tokens + ETH', color: '#a855f7' },
                    { num: '4', text: 'Token tradeable on Uniswap + burn always available', color: '#ec4899' },
                  ].map((step) => (
                    <div key={step.num} className="flex items-center gap-4">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: step.color, color: '#0b0c0e' }}>
                        {step.num}
                      </div>
                      <div className="text-sm" style={{ color: '#8b8d97' }}>{step.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Features - NEW */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: '#f0f0f2' }}>
            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#f59e0b10', color: '#f59e0b' }}>
              04
            </span>
            Trust Features
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-2" style={{ background: '#00e87b20', color: '#00e87b' }}>NEW</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {/* Floor Boost Tax */}
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: '#111215', border: '1px solid #f59e0b30' }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at 80% 20%, #f59e0b, transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#f59e0b15' }}>
                    &#128293;
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#f0f0f2' }}>Floor Boost Tax</h3>
                    <p className="text-sm" style={{ color: '#f59e0b' }}>Auto-burn mechanism</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#8b8d97' }}>
                  A configurable percentage (0-10%) of every token transfer is automatically burned.
                  This reduces the total supply, which mathematically increases the floor price
                  since floor = collateral / supply.
                </p>

                <h4 className="text-sm font-bold mb-3" style={{ color: '#f0f0f2' }}>How It Works</h4>
                <ul className="space-y-3 mb-6">
                  {[
                    'Creator sets tax rate at launch (0-10%)',
                    'Every transfer burns X% of the amount',
                    'Burned tokens are gone forever',
                    'Floor price increases with each trade',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#8b8d97' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <h4 className="text-sm font-bold mb-3" style={{ color: '#f0f0f2' }}>Tax Exemptions</h4>
                <div className="rounded-lg p-4 mb-6" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#00e87b' }}>&#10003;</span>
                      <span style={{ color: '#8b8d97' }}>Buy from bonding curve</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#00e87b' }}>&#10003;</span>
                      <span style={{ color: '#8b8d97' }}>Trade on Uniswap</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#ef4444' }}>&#10007;</span>
                      <span style={{ color: '#8b8d97' }}>Wallet to wallet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#ef4444' }}>&#10007;</span>
                      <span style={{ color: '#8b8d97' }}>Send to contracts</span>
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-bold mb-3" style={{ color: '#f0f0f2' }}>Math Example</h4>
                <div className="rounded-lg p-4" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                  <div className="text-xs font-mono mb-3" style={{ color: '#5c5e69' }}>5% tax, 1M supply, 10 ETH collateral</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#5c5e69' }}>Initial floor</span>
                      <span className="font-mono" style={{ color: '#f0f0f2' }}>0.00001 ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#5c5e69' }}>After 1000 trades of 10K tokens</span>
                      <span className="font-mono" style={{ color: '#f0f0f2' }}>~500K burned</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid #1e2028' }}>
                      <span style={{ color: '#5c5e69' }}>New floor</span>
                      <span className="font-mono font-bold" style={{ color: '#00e87b' }}>0.00002 ETH (2x)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Vesting */}
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: '#111215', border: '1px solid #a855f730' }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at 80% 20%, #a855f7, transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#a855f715' }}>
                    &#128274;
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#f0f0f2' }}>Creator Vesting</h3>
                    <p className="text-sm" style={{ color: '#a855f7' }}>Anti-dump protection</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#8b8d97' }}>
                  Creator tokens are locked at launch and unlock linearly over the vesting period.
                  This prevents creators from dumping their allocation immediately, building
                  long-term trust with buyers.
                </p>

                <h4 className="text-sm font-bold mb-3" style={{ color: '#f0f0f2' }}>Vesting Options</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { period: 'No Lock', color: '#5c5e69' },
                    { period: '1 Month', color: '#8b8d97' },
                    { period: '3 Months', color: '#a855f7' },
                    { period: '6 Months', color: '#a855f7', recommended: true },
                    { period: '12 Months', color: '#ec4899' },
                  ].map((option) => (
                    <div
                      key={option.period}
                      className="rounded-lg p-3 text-sm text-center relative"
                      style={{ background: '#16171c', border: `1px solid ${option.recommended ? '#a855f730' : '#1e2028'}`, color: option.color }}
                    >
                      {option.period}
                      {option.recommended && (
                        <span className="absolute -top-2 -right-2 text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#a855f7', color: '#0b0c0e' }}>
                          REC
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <h4 className="text-sm font-bold mb-3" style={{ color: '#f0f0f2' }}>Linear Unlock Schedule</h4>
                <div className="rounded-lg p-4 mb-6" style={{ background: '#16171c', border: '1px solid #1e2028' }}>
                  <div className="text-xs font-mono mb-3" style={{ color: '#5c5e69' }}>6-month vesting example:</div>
                  <div className="space-y-3">
                    {[
                      { time: 'Day 0', unlocked: '0%', locked: '100%' },
                      { time: 'Month 1', unlocked: '16.7%', locked: '83.3%' },
                      { time: 'Month 3', unlocked: '50%', locked: '50%' },
                      { time: 'Month 6', unlocked: '100%', locked: '0%' },
                    ].map((row) => (
                      <div key={row.time} className="flex items-center gap-3">
                        <span className="text-xs w-16" style={{ color: '#5c5e69' }}>{row.time}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden flex" style={{ background: '#1e2028' }}>
                          <div className="h-full rounded-l-full" style={{ width: row.unlocked, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
                        </div>
                        <span className="text-xs font-mono w-12 text-right" style={{ color: '#a855f7' }}>{row.unlocked}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <h4 className="text-sm font-bold mb-3" style={{ color: '#f0f0f2' }}>Important Notes</h4>
                <ul className="space-y-2">
                  {[
                    'Only initial allocation is vested',
                    'Tokens bought later are NOT locked',
                    'Enforced at contract level',
                    'Cannot be bypassed or changed',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-xs" style={{ color: '#8b8d97' }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: '#a855f7' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Trust Comparison */}
          <div className="rounded-2xl p-8" style={{ background: '#111215', border: '1px solid #1e2028' }}>
            <h3 className="text-lg font-bold text-center mb-6 flex items-center justify-center gap-2" style={{ color: '#f0f0f2' }}><Image src="/logo.png" alt="GluedLaunch" width={831} height={285} className="h-8 w-auto inline-block" /> vs Other Launchpads</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e2028' }}>
                    <th className="text-left py-3 px-4" style={{ color: '#5c5e69' }}>Feature</th>
                    <th className="text-center py-3 px-4"><Image src="/logo.png" alt="GluedLaunch" width={831} height={285} className="h-6 w-auto inline-block" /></th>
                    <th className="text-center py-3 px-4" style={{ color: '#ef4444' }}>Others</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Collateral backing', glued: 'Yes (100% ETH)', others: 'No' },
                    { feature: 'Mathematical floor price', glued: 'Yes', others: 'No' },
                    { feature: 'Auto-burn tax option', glued: 'Yes (0-10%)', others: 'Rarely' },
                    { feature: 'Creator vesting', glued: 'Yes (1-12 months)', others: 'Rarely' },
                    { feature: 'Burn for ETH anytime', glued: 'Yes', others: 'No' },
                    { feature: 'Rug-proof by design', glued: 'Yes', others: 'No' },
                  ].map((row, i) => (
                    <tr key={row.feature} style={{ borderBottom: i < 5 ? '1px solid #1e2028' : 'none' }}>
                      <td className="py-3 px-4" style={{ color: '#8b8d97' }}>{row.feature}</td>
                      <td className="text-center py-3 px-4 font-mono" style={{ color: '#00e87b' }}>{row.glued}</td>
                      <td className="text-center py-3 px-4 font-mono" style={{ color: '#ef4444' }}>{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* For Creators */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: '#f0f0f2' }}>
            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#ec489910', color: '#ec4899' }}>
              05
            </span>
            For Token Creators
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-6" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <h3 className="text-base font-bold mb-5" style={{ color: '#f0f0f2' }}>Launch Parameters</h3>
              <div className="space-y-0">
                {[
                  { label: 'Creator Allocation', desc: 'Your initial token share', value: '0-20%', color: '#ec4899' },
                  { label: 'Base Price', desc: 'Starting price per token', value: 'Customizable', color: '#8b8d97' },
                  { label: 'Price Increment', desc: 'How much price increases per token sold', value: 'Customizable', color: '#8b8d97' },
                  { label: 'Floor Boost Tax', desc: 'Auto-burn on transfers', value: '0-10%', color: '#f59e0b', isNew: true },
                  { label: 'Creator Vesting', desc: 'Lock period for your tokens', value: '0-12 months', color: '#a855f7', isNew: true },
                  { label: 'LP Reserve', desc: 'Reserved for Uniswap graduation', value: '10%', color: '#00c2ff' },
                ].map((param, i, arr) => (
                  <div
                    key={param.label}
                    className="flex justify-between items-center py-4"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid #1e2028' : 'none' }}
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#f0f0f2' }}>{param.label}</div>
                        <div className="text-xs" style={{ color: '#5c5e69' }}>{param.desc}</div>
                      </div>
                      {param.isNew && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#00e87b20', color: '#00e87b' }}>NEW</span>
                      )}
                    </div>
                    <div className="text-sm font-mono font-medium" style={{ color: param.color }}>{param.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#111215', border: '1px solid #1e2028' }}>
              <h3 className="text-base font-bold mb-5" style={{ color: '#f0f0f2' }}>Creator Benefits</h3>
              <ul className="space-y-4">
                {[
                  { title: 'Free Token Allocation', desc: 'Receive up to 20% of supply at launch' },
                  { title: 'Burn Your Allocation', desc: 'Your tokens also have floor value — profit from collateral growth' },
                  { title: 'Trusted Launch', desc: "Buyers know they can't be rugged — more trust, more buyers" },
                  { title: 'No Gas for Deployment', desc: 'Token and Glue contracts deployed in single transaction' },
                ].map((benefit) => (
                  <li key={benefit.title} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#00e87b15' }}>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 4" stroke="#00e87b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#f0f0f2' }}>{benefit.title}</div>
                      <div className="text-xs" style={{ color: '#5c5e69' }}>{benefit.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: '#f0f0f2' }}>
            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#00c2ff10', color: '#00c2ff' }}>
              06
            </span>
            Technical Architecture
          </h2>
          <div className="rounded-2xl p-8" style={{ background: '#111215', border: '1px solid #1e2028' }}>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Smart Contracts', items: ['GluedLaunch (Factory + Sale)', 'GluedToken (ERC20 + StickyAsset)', 'Glue Contract (Collateral Vault)'], color: '#00c2ff' },
                { title: 'Built On', items: ['Glue Protocol (Collateral Backing)', 'Uniswap V2 (DEX Graduation)', 'Solidity 0.8.28 (Cancun EVM)'], color: '#00c2ff' },
                { title: 'Security', items: ['Reentrancy Protected (nnrtnt)', 'Overflow Safe (_md512)', 'No Admin Keys'], color: '#00c2ff' },
              ].map((section) => (
                <div key={section.title}>
                  <h3 className="font-bold text-sm mb-4" style={{ color: section.color }}>{section.title}</h3>
                  <ul className="space-y-2.5">
                    {section.items.map((item) => (
                      <li key={item} className="text-sm flex items-center gap-2" style={{ color: '#8b8d97' }}>
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: '#2a2d38' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="rounded-2xl p-12 relative overflow-hidden" style={{ background: '#111215', border: '1px solid #00e87b15' }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at 50% 0%, #00e87b, transparent 70%)' }} />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#f0f0f2' }}>Ready to Launch?</h2>
              <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: '#5c5e69' }}>
                Create your rug-proof token in minutes. No coding required.
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
                  View All Tokens
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e2028' }} className="mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: '#5c5e69' }}>GluedLaunch 2026</p>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>Home</Link>
            <Link href="/tokens" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>All Tokens</Link>
            <a href="https://glue.finance" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white" style={{ color: '#5c5e69' }}>Glue Protocol</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
