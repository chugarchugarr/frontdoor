import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const productItems = [
  'Exterior signals, association rules, ARC decisions, contractor credentials, bids, work status, completion evidence, and exports in one workspace.',
  'A modeled board demo shows 10 residents, 1 delinquent account, $185 outstanding, 5 open violations, 3 ARC requests, 3 work orders, and 1 active vote.',
  'Every demo screen is labeled as modeled data. Production customers, transactions, and revenue are still zero.',
];

const doctrinePath = [
  ['Exterior signal', 'A roof, fence, drainage line, hail mark, or other exterior condition enters as a signal. It is not a diagnosis or authorization.'],
  ['Association permission', 'The board applies the community rules and approvals. The homeowner keeps the contractor choice.'],
  ['Verified execution', 'Credentials, applicable licenses, insurance, scope, approvals, and completion evidence stay attached to the work.'],
  ['Permanent record', 'The association keeps the workflow history and can export it when managers, vendors, or board members change.'],
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
              <h1 className="gp-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] mt-6">Property work should leave the community smarter.</h1>
              <p className="text-xl md:text-2xl text-white/70 mt-7 max-w-3xl leading-snug">GatePass is the association-owned operating system that routes property work from an exterior signal to permission, verified execution, and a permanent record.</p>
              <p className="text-base text-white/50 mt-5 max-w-2xl leading-relaxed">Contractors pay for trusted access to communities. Associations retain control of the workflow and data.</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-9">
                <Link to="/demo" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">See the modeled demo <ArrowRight className="w-4 h-4" /></Link>
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
              <p>Joseph spent years selling home improvement door to door in Central Texas. Trained contractors often recognize an expensive exterior signal before a homeowner understands what they are seeing. The homeowner cannot safely separate a useful observation from a sales pitch.</p>
              <p>The starting point is limited to what can be lawfully seen from a public approach or what a homeowner or association supplies. GatePass does not authorize trespassing, inspection without consent, or pretending to speak for the association.</p>
              <p>GatePass routes the signal through the community instead of forcing another cold knock. The homeowner keeps the choice. The contractor still has to earn the work. The association applies the rules and keeps the record.</p>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#0d1a12] border-y border-white/10">
          <div className="max-w-[1120px] mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctrinePath.map(([title, body], index) => (
              <div key={title} className="rounded-[28px] bg-white/[0.04] border border-white/10 p-7">
                <div className="text-xs text-[#B8883A] font-mono mb-5">0{index + 1}</div>
                <h2 className="text-2xl font-bold tracking-tight leading-tight">{title}</h2>
                <p className="text-sm text-white/50 leading-relaxed mt-4">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#0a130d]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">One operating path. One association-owned history.</h2>
              <p className="text-white/50 mt-5 leading-relaxed">GatePass can work alongside a management company. The association remains the principal and owns the workflow, records, and export.</p>
            </div>
            <div className="grid gap-3">
              {productItems.map((item) => <div key={item} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 text-sm text-white/60 leading-relaxed">{item}</div>)}
            </div>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#f4f1ec] text-[#1C1C1A]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">Anyone can buy permit data. Nobody can buy association permission.</h2>
              <p className="text-[#1C1C1A]/65 mt-5 leading-relaxed">Public data can reveal a pattern. It cannot decide what the community allows, which contractor enters the approved channel, or what the association records afterward. GatePass joins those steps without taking the homeowner's choice away.</p>
            </div>
            <div className="rounded-[28px] bg-white border border-[#2A5240]/10 p-7">
              <h2 className="text-2xl font-bold tracking-tight">Trusted access has boundaries.</h2>
              <ul className="mt-5 space-y-3 text-sm text-[#1C1C1A]/65 leading-relaxed">
                <li>Contractors apply before payment.</li>
                <li>Founding access is $99 once, after approval.</li>
                <li>Payment does not buy board approval, ranking, a lead, or guaranteed work.</li>
                <li>Verification means a defined credential and work-record standard. It is not an endorsement or quality guarantee.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-8 py-16 bg-[#0d1a12]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">The first live path starts with one Austin association.</h2>
              <p className="text-white/50 mt-5 max-w-3xl leading-relaxed">The next milestone is one paid association, one approved contractor work path, one documented completion, and one export the association can keep.</p>
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