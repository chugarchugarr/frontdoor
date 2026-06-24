import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const funds = [
  'First paid HOA pilot',
  'CTO/product completion',
  'Austin Home Show contractor launch',
  'Board-safe transition-support reserve',
  'Contractor supply activation',
];

const marketProof = [
  ['PayHOA', '$27.5M Series A led by Elephant', 'Boards pay for post-self-management HOA SaaS.'],
  ['Vantaca', '$300M+ Cove Hill round at $1.25B valuation', 'HOA software has venture-scale PMC-side momentum.'],
  ['CINC', 'Hg + Spectrum Equity; $25B+ processed in 2025', 'The incumbent payment/management rail is huge and PMC-side.'],
];

const hooks = [
  ['Taylor Hou', 'You backed Lula because contractor networks compound. GatePass is the gate Lula needs to exist.'],
  ['Matt Knight', 'You backed Amenify. GatePass is the same ancillary-income flywheel for HOA-governed homes.'],
  ['Marketplace operators', 'The atomic unit is HOA-approved contractor access → homeowner job → payment → HOA credit → compliance memory.'],
  ['CTAN / Austin angels', 'Austin HOAs are trapped by bad PMCs. GatePass gives boards a safer path out and turns local contractor spend into community revenue.'],
];

export default function Investors() {
  return (
    <div className="min-h-screen bg-[#0a130d]">
      <Navbar />
      <section className="pt-40 pb-24 px-8 bg-[#0a130d] border-b border-white/10">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-end">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6 block">GatePass pre-seed · Austin</span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-none tracking-tight">
              Software wedge.<br />Marketplace business.<br /><span className="text-[#B8883A]">Transition-memory moat.</span>
            </h1>
            <p className="text-lg text-white/50 mt-8 max-w-2xl leading-relaxed">
              GatePass helps HOA boards exit bad PMCs, then turns the HOA into the controlled access layer for verified home-improvement contractors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link to="/demo?view=marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">
                View marketplace proof loop <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/demo?view=transition" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full transition-colors">
                View transition graph
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.7 }} className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="text-xs text-white/35 uppercase tracking-[0.25em] mb-5">Current raise</div>
            <div className="text-5xl font-bold text-white tracking-tight">$300K SAFE</div>
            <div className="text-[#B8883A] font-semibold mt-2">$4M cap · pre-seed</div>
            <div className="h-px bg-white/10 my-7" />
            <p className="text-sm text-white/45 leading-relaxed">
              Capital creates one thing investors can diligence: a first paid HOA + contractor marketplace loop before the Aug. 22–23 Austin Home Show launch path.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-8 bg-[#0d1a12]">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-10">
          <div>
            <span className="text-xs text-white/30 tracking-[0.25em] uppercase">Use of funds</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-5 leading-tight">What the $300K unlocks.</h2>
          </div>
          <div className="grid gap-3">
            {funds.map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-[#B8883A] shrink-0" />
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-[#f4f1ec]">
        <div className="max-w-[1200px] mx-auto">
          <span className="text-xs text-[#2A5240]/45 tracking-[0.25em] uppercase">Verified market proof</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1C1C1A] mt-5 mb-10">Adjacent capital validates the market. None owns the transition moment.</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {marketProof.map(([name, figure, meaning]) => (
              <div key={name} className="bg-white border border-[#2A5240]/10 rounded-2xl p-6">
                <div className="text-xs text-[#2A5240]/45 tracking-[0.18em] uppercase mb-4">{name}</div>
                <div className="text-xl font-bold text-[#1C1C1A] leading-tight">{figure}</div>
                <p className="text-sm text-[#1C1C1A]/55 mt-4 leading-relaxed">{meaning}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-[#2A5240] rounded-2xl text-white">
            <strong>Competitive line:</strong> PayHOA serves boards after self-management. Vantaca/CINC arm the PMC. Assembly becomes a better PMC. GatePass owns the transition moment and the contractor-access layer after it.
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-[#0a130d]">
        <div className="max-w-[1200px] mx-auto">
          <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase">Target-specific hooks</span>
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {hooks.map(([target, hook]) => (
              <div key={target} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-white font-bold mb-3">{target}</div>
                <p className="text-sm text-white/50 leading-relaxed">{hook}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link to="/demo?view=investor" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">
              Open investor proof dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contractors" className="inline-flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full transition-colors">
              View contractor access
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
