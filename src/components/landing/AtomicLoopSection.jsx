import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const loop = [
  ['Transition review', 'The board enters through PMC pain, contract timing, missing records, and compliance risk.'],
  ['Contractor slot', 'GatePass opens verified access by trade and community — not commodity leads.'],
  ['Homeowner job', 'ARC approvals and work orders become routed marketplace demand.'],
  ['Quote + fee', 'Contractor quote and transaction records capture the value GatePass controls.'],
  ['HOA credit', 'A share flows back to the community as a credit against platform or transition support.'],
  ['Compliance memory', 'The finished work becomes permanent operating memory that makes the community harder to churn.'],
];

export default function AtomicLoopSection() {
  return (
    <section className="bg-[#f4f1ec] py-28 px-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-start">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
            <span className="text-xs text-[#2A5240]/45 tracking-[0.25em] uppercase">How the marketplace works</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1C1C1A] mt-6 leading-tight">
              One loop turns HOA pain into contractor revenue.
            </h2>
            <p className="text-lg text-[#1C1C1A]/55 mt-6 leading-relaxed">
              Software is the wedge. Marketplace is the business. Transition memory is the moat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-9">
              <Link to="/demo?view=marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#2A5240] hover:bg-[#214231] px-6 py-3.5 rounded-full transition-colors">
                See the proof loop <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/investors" className="inline-flex items-center gap-2 text-sm text-[#2A5240] hover:text-[#1C1C1A] border border-[#2A5240]/20 hover:border-[#2A5240]/40 px-6 py-3.5 rounded-full transition-colors">
                Investor brief
              </Link>
            </div>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-3">
            {loop.map(([title, body], i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.45 }} className="bg-white border border-[#2A5240]/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-[#2A5240]/35">0{i + 1}</span>
                  <span className="w-2 h-2 rounded-full bg-[#B8883A]" />
                </div>
                <h3 className="font-bold text-[#1C1C1A] text-lg leading-tight">{title}</h3>
                <p className="text-sm text-[#1C1C1A]/50 mt-3 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
