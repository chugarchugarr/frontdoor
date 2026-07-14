import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const funds = [
  'First paid HOA pilot',
  'CTO/product completion',
  'Founding Community LOI deadline',
  'Board-safe transition-support reserve',
  'Contractor supply activation',
];

const marketProof = [
  ['PayHOA', '$27.5M Series A led by Elephant', 'Boards pay for post-self-management HOA SaaS.'],
  ['Vantaca', '$300M+ Cove Hill round at $1.25B valuation', 'HOA software has venture-scale PMC-side momentum.'],
  ['CINC', 'Hg + Spectrum Equity; $25B+ processed in 2025', 'The incumbent payment/management rail is huge and PMC-side.'],
];

const diligence = [
  ['Wedge', 'A board-safe transition review creates the first trusted relationship with an HOA.'],
  ['Marketplace', 'Verified contractor access turns HOA-approved work into transaction flow.'],
  ['Moat', 'Every transition, approval, quote, payment, and credit becomes board-owned operating memory.'],
];

export default function Investors() {
  return (
    <div className="min-h-screen bg-[#0a130d]">
      <Navbar />

      <section className="pt-36 pb-20 px-6 md:px-8 bg-[#0a130d] border-b border-white/10">
        <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-end">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-5 block">GatePass pre-seed · Austin</span>
            <h1 className="gp-display text-6xl md:text-7xl lg:text-8xl text-white leading-[0.88]">
              Software wedge.<br />Marketplace business.<br /><span className="text-[#B8883A]">Transition-memory moat.</span>
            </h1>
            <p className="text-base md:text-lg text-white/50 mt-8 max-w-2xl leading-relaxed">
              GatePass starts where boards already hurt: management transition, missing records, and compliance risk. Then it turns community permission into verified contractor access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link to="/marketplace-loop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">
                View marketplace proof loop <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/demo?view=transition" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full transition-colors">
                View transition graph
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.7 }} className="gp-panel rounded-[32px] p-6 md:p-8 shadow-2xl shadow-black/20">
            <div className="text-xs text-white/35 uppercase tracking-[0.25em] mb-5">Current raise</div>
            <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">$500K SAFE</div>
            <div className="text-[#B8883A] font-semibold mt-2">$6M post-money · pre-seed</div>
            <div className="h-px bg-white/10 my-7" />
            <p className="text-sm text-white/45 leading-relaxed">
              The round is for one diligence target: convert the demo loop into one paid HOA, one contractor transaction, and one exportable proof pack.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-7">
              {[["1", "paid HOA"], ["1", "job loop"], ["1", "proof pack"]].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/30 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-8 bg-[#0d1a12] border-b border-white/10">
        <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-10">
          <div>
            <span className="text-xs text-white/30 tracking-[0.25em] uppercase">Diligence target</span>
            <h2 className="gp-display text-5xl md:text-6xl text-white mt-5 leading-[0.94]">What has to become real.</h2>
            <p className="text-white/45 mt-5 leading-relaxed">A clean proof boundary. No theater. No public name-drop list.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {diligence.map(([title, body], index) => (
              <div key={title} className="gp-panel rounded-[28px] p-6 min-h-[210px]">
                <div className="font-mono text-xs text-[#B8883A] mb-8">0{index + 1}</div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed mt-4">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-8 bg-[#f4f1ec]">
        <div className="max-w-[1120px] mx-auto">
          <span className="text-xs text-[#2A5240]/45 tracking-[0.25em] uppercase">Verified market proof</span>
          <h2 className="gp-display text-5xl md:text-6xl text-[#1C1C1A] mt-5 mb-10 leading-[0.94]">The market is funded. The transition moment is still open.</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {marketProof.map(([name, figure, meaning]) => (
              <div key={name} className="bg-white border border-[#2A5240]/10 rounded-[28px] p-6 shadow-sm">
                <div className="text-xs text-[#2A5240]/45 tracking-[0.18em] uppercase mb-4">{name}</div>
                <div className="text-xl font-bold text-[#1C1C1A] leading-tight">{figure}</div>
                <p className="text-sm text-[#1C1C1A]/55 mt-4 leading-relaxed">{meaning}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-6 md:p-7 bg-[#2A5240] rounded-[28px] text-white text-sm md:text-base leading-relaxed">
            <strong>Competitive line:</strong> PayHOA serves boards after self-management. Vantaca/CINC arm the PMC. Assembly becomes a better PMC. GatePass owns the transition moment and the contractor-access layer after it.
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-8 bg-[#0a130d]">
        <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <div>
            <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase">Use of funds</span>
            <h2 className="gp-display text-5xl md:text-6xl text-white mt-5 leading-[0.94]">Capital goes into proof, not theater.</h2>
            <p className="text-white/45 mt-5 leading-relaxed">The next investor-facing asset is not more copy. It is a real paid HOA record, a real contractor transaction, and a proof pack that cleanly separates production from demo data. Austin Home Show weekend is an internal Founding Community LOI deadline.</p>
          </div>
          <div className="gp-panel rounded-[28px] p-6 md:p-8">
            <div className="grid gap-3">
              {funds.map((item) => (
                <div key={item} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-b-0">
                  <CheckCircle2 className="w-5 h-5 text-[#B8883A] shrink-0" />
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/investor-proof" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">
                Open proof dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contractors" className="inline-flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full transition-colors">
                Contractor access
              </Link>
            </div>
            <div className="mt-7 rounded-2xl bg-black/20 border border-white/10 p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-white/30 mb-3">Proof boundary</div>
              <p className="text-sm text-white/50 leading-relaxed m-0">
                Demo GMV is labeled demo. Production metrics stay real-record only. Named investor targeting belongs in private outreach, not on the public page.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 pb-20 bg-[#0a130d]">
        <div className="max-w-[1120px] mx-auto border-t border-white/10 pt-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="text-white text-2xl md:text-3xl font-bold tracking-tight">The open question is simple.</div>
              <p className="text-white/45 mt-3 leading-relaxed">Can GatePass turn one board transition into one contractor transaction and one defensible memory record?</p>
            </div>
            <Link to="/marketplace-loop" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">
              View the loop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
