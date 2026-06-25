import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const points = [
  { num: '01', title: 'Your legal history. Permanently yours.', body: 'Every violation notice, ARC decision, board vote, and dues record is timestamped and stored in a searchable compliance ledger. When you switch from a PMC, your history doesn\'t disappear with them.' },
  { num: '02', title: 'Flat-rate pricing. No PMC games.', body: '$20 per unit per year. That\'s it. A 200-unit HOA pays $4,000/yr — vs. $16,000–$24,000 with a management company that invoices you for every phone call.' },
  { num: '03', title: 'The work gets routed.', body: 'Nine board modules handle dues, notices, ARC requests, votes, and work orders through one operating layer. You approve. GatePass keeps the record.' },
  { num: '04', title: 'Transition support, not hand-waving.', body: 'We map your current contract, migration risk, board responsibilities, and launch path before you switch. Where it makes sense, we can apply case-by-case transition credit instead of pretending every PMC exit is identical.' },
];

export default function WhySection() {
  return (
    <section className="bg-[#f4f1ec] py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-start gap-4 mb-20">
          <span className="text-xs text-[#2A5240]/40 tracking-[0.25em] uppercase mt-1">Why GatePass</span>
          <div className="flex-1 h-px bg-[#2A5240]/10 mt-3" />
        </div>
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="gp-display text-5xl md:text-6xl lg:text-7xl text-[#1C1C1A] leading-[0.92]">
              Your community's records.<br />
              <span className="text-[#2A5240]">Never held hostage again.</span>
            </h2>
            <p className="text-lg text-[#1C1C1A]/50 mt-8 max-w-md leading-relaxed">
              When you fire a PMC, they take your records with them — or charge you to get them back. GatePass stores every compliance event, financial transaction, board decision, contractor interaction, and permit signal in a permanent ledger that belongs to your community.
            </p>

            {/* TAM context for investors scanning the page */}
            <div className="mt-8 p-5 bg-[#2A5240]/8 border border-[#2A5240]/15 rounded-[24px]">
              <p className="text-xs text-[#2A5240] tracking-[0.15em] uppercase font-semibold mb-2">The market</p>
              <p className="text-sm text-[#1C1C1A]/60 leading-relaxed">
                GatePass starts with the board-safe transition layer, then expands into contractor access. The HOA controls the neighborhood rulebook; GatePass makes that permission layer operational and economically useful.
              </p>
            </div>

            <Link to="/pricing" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-white bg-[#2A5240] hover:bg-[#1e3d2f] px-6 py-3 rounded-full transition-colors">
              Calculate your savings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-10">
            {points.map((p, i) => (
              <motion.div key={p.num} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="flex gap-6"
              >
                <span className="text-xs font-mono text-[#2A5240]/40 mt-1 shrink-0 tracking-widest">{p.num}</span>
                <div>
                  <h3 className="font-bold text-[#1C1C1A] text-base">{p.title}</h3>
                  <p className="text-sm text-[#1C1C1A]/50 mt-1.5 leading-relaxed">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
