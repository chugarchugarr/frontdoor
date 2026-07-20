import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const productItems = [
  'Board records, dues snapshots, violations, ARC requests, votes, work orders, amenities, notices, and contractor access in one workspace.',
  'A modeled board demo shows 10 residents, 1 delinquent account, $185 outstanding, 5 open violations, 3 ARC requests, 3 work orders, and 1 active vote.',
  'Every demo screen is labeled as modeled data. Production customers, transactions, and revenue are still zero.',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a130d] text-white">
      <Navbar />
      <main>
        <section className="px-6 md:px-8 pt-36 pb-20 border-b border-white/10">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-end">
            <div>
              <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase">Built in Austin</span>
              <h1 className="gp-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] mt-6">The HOA controls the gate.</h1>
              <p className="text-xl md:text-2xl text-white/70 mt-7 max-w-2xl leading-snug">GatePass is a contractor marketplace the HOA controls.</p>
              <p className="text-base text-white/50 mt-5 max-w-2xl leading-relaxed">A board can see a roof, fence, drainage line, hail mark, or other exterior condition, decide who is allowed to act on it, keep the record, and export the file if the association ever changes vendors.</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-9">
                <Link to="/demo" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">See the demo <ArrowRight className="w-4 h-4" /></Link>
                <Link to="/investors" className="inline-flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full transition-colors">Read the investor brief</Link>
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/20">
              <div className="text-xs text-white/35 uppercase tracking-[0.2em] mb-5">Current status</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Working modeled demo', 'Yes'],
                  ['Paid HOA customers', '0'],
                  ['Contractor transactions', '0'],
                  ['Production revenue', '$0'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-black/20 border border-white/10 p-4">
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-[11px] text-white/35 uppercase tracking-[0.14em] mt-1 leading-snug">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#f4f1ec] text-[#1C1C1A]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">GatePass was born on the doorstep.</h2>
            <div className="text-base leading-relaxed text-[#1C1C1A]/70 space-y-4">
              <p>Joseph spent years selling home improvement door to door in Central Texas. The pattern was obvious: contractors chase one house at a time, while the HOA sits above the neighborhood with the permission, records, and trust that make the work easier.</p>
              <p>GatePass moves that first conversation from a cold knock to a board-approved path. The homeowner still chooses. The contractor still has to earn the work. The association decides what gets through the gate.</p>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#0d1a12] border-y border-white/10">
          <div className="max-w-[1120px] mx-auto grid md:grid-cols-3 gap-4">
            {[
              ['Bring the observation through the HOA.', 'A visible exterior issue becomes a board-routed next step instead of another untracked solicitation.'],
              ['The board can run the whole path in one place.', 'Requests, approvals, notices, votes, quotes, and exports live together instead of being scattered across inboxes.'],
              ['HOAs pay for the software. Contractors pay for access.', 'The association pays $20 per unit per year. Founding contractors apply first; approved access is $99 once and does not promise leads.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[28px] bg-white/[0.04] border border-white/10 p-7">
                <h2 className="text-2xl font-bold tracking-tight leading-tight">{title}</h2>
                <p className="text-sm text-white/50 leading-relaxed mt-4">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#0a130d]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">What the product handles.</h2>
              <p className="text-white/50 mt-5 leading-relaxed">GatePass is a working, modeled demo of the board workspace and access workflow. It does not represent production customer activity.</p>
            </div>
            <div className="grid gap-3">
              {productItems.map((item) => <div key={item} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 text-sm text-white/60 leading-relaxed">{item}</div>)}
            </div>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#f4f1ec] text-[#1C1C1A]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">Anyone can buy permit data. Nobody can buy the blessing.</h2>
              <p className="text-[#1C1C1A]/65 mt-5 leading-relaxed">The control point is not the public permit feed. The control point is the association's approval. A contractor can see a neighborhood from the street. GatePass is for the moment the HOA decides who is allowed to approach, quote, and document the work.</p>
            </div>
            <div className="rounded-[28px] bg-white border border-[#2A5240]/10 p-7">
              <h2 className="text-2xl font-bold tracking-tight">Where GatePass is today.</h2>
              <ul className="mt-5 space-y-3 text-sm text-[#1C1C1A]/65 leading-relaxed">
                <li>GatePass is pre-revenue.</li>
                <li>The site contains a working, modeled demo.</li>
                <li>There are no paid HOA customers.</li>
                <li>There are no production contractor transactions.</li>
                <li>The next milestone is one paid HOA in Austin, one real contractor transaction, and one export the association can keep.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#0d1a12]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">I am raising $500,000 to finish the production system.</h2>
              <p className="text-white/50 mt-5 max-w-3xl leading-relaxed">At the end of 2025, the United States had <a className="text-[#B8883A] underline" href="https://foundation.caionline.org/publications/factbook/statistical-review/" target="_blank" rel="noreferrer">373,000 community associations with 78.1 million residents</a>. GatePass starts in Austin with one association and one approved contractor transaction.</p>
            </div>
            <div className="flex flex-col gap-3 min-w-[220px]">
              <Link to="/onboard" className="inline-flex justify-center text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full">For HOA boards</Link>
              <Link to="/contractors" className="inline-flex justify-center text-sm text-white/70 border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full">Apply as a contractor</Link>
              <a href="mailto:info@gatepasshoa.com" className="inline-flex justify-center text-sm text-white/70 border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full">Email the founder</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
