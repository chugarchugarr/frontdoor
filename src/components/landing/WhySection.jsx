import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const points = [
  { num: '01', title: 'Your operating history stays with the association.', body: 'Every violation notice, ARC decision, board vote, and dues record is designed to be timestamped, attributable, searchable, and exportable. When management changes, your history does not disappear with a vendor portal.' },
  { num: '02', title: 'Flat-rate software pricing.', body: '$20 per unit per year for the GatePass software layer. GatePass works alongside current management and carries no PMC responsibility.' },
  { num: '03', title: 'The work gets routed.', body: 'Nine board modules handle dues, notices, ARC requests, votes, and work orders through one operating layer. You approve. GatePass keeps the record.' },
  { num: '04', title: 'Continuity when management changes.', body: 'GatePass maps the current operating record, migration risk, board responsibilities, and launch path so the association keeps continuity whether it stays with a PMC or changes providers.' },
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
              GatePass gives the association a durable operating record: compliance events, financial transactions, board decisions, contractor interactions, and permit signals in one exportable layer owned by the community.
            </p>

            {/* TAM context for investors scanning the page */}
            <div className="mt-8 p-5 bg-[#2A5240]/8 border border-[#2A5240]/15 rounded-[24px]">
              <p className="text-xs text-[#2A5240] tracking-[0.15em] uppercase font-semibold mb-2">The market</p>
              <p className="text-sm text-[#1C1C1A]/60 leading-relaxed">
                GatePass starts with the contractor-access mechanism: exterior observations surface through the HOA, not around it. The transition layer protects continuity when management changes.
              </p>
            </div>

            <Link to="/pricing" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-white bg-[#2A5240] hover:bg-[#1e3d2f] px-6 py-3 rounded-full transition-colors">
              View pricing <ArrowRight className="w-4 h-4" />
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
