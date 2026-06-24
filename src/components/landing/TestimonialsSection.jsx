import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const useCases = [
  {
    pain: 'Management company taking 3 days to route a work order.',
    outcome: 'GatePass routes work orders automatically. Board meets once a month now instead of every week.',
    role: 'Modeled board case',
    community: '220-unit Austin scenario',
    saving: 'Target: lower admin load',
  },
  {
    pain: 'Violations creating constant neighbor-vs-neighbor conflict at every board meeting.',
    outcome: 'Handled automatically and consistently. 80% of residents resolve before the board ever sees it. Board drama down.',
    role: 'Modeled compliance case',
    community: '180-unit Austin scenario',
    saving: 'Target: consistent records',
  },
  {
    pain: 'ARC requests getting lost in email threads for weeks, missing the 45-day compliance clock.',
    outcome: 'Everything tracked, timestamped, and resolved. No more missed deadlines, no more liability.',
    role: 'Modeled ARC case',
    community: '310-unit Austin scenario',
    saving: 'Target: fewer missed deadlines',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#f4f1ec] py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs text-[#2A5240]/40 tracking-[0.25em] uppercase">Use cases</span>
          <div className="flex-1 h-px bg-[#2A5240]/10" />
        </div>
        {/* Honest pre-launch framing */}
        <p className="text-sm text-[#2A5240]/50 mb-14 italic">
          Early access community — these are modeled scenarios, not customer testimonials.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-[#2A5240]/10 flex flex-col"
            >
              {/* Pain */}
              <div className="mb-5">
                <p className="text-xs text-[#1C1C1A]/30 uppercase tracking-widest font-semibold mb-2">The problem</p>
                <p className="text-[#1C1C1A]/60 text-sm leading-relaxed italic">"{t.pain}"</p>
              </div>
              {/* Outcome */}
              <div className="flex-1">
                <p className="text-xs text-[#2A5240] uppercase tracking-widest font-semibold mb-2">With GatePass</p>
                <p className="text-[#1C1C1A] text-sm leading-relaxed">{t.outcome}</p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#2A5240]/10 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#1C1C1A]">{t.role}</p>
                  <p className="text-xs text-[#1C1C1A]/40 mt-0.5">{t.community}</p>
                </div>
                <span className="text-xs font-semibold text-[#2A5240] bg-[#2A5240]/10 px-3 py-1 rounded-full whitespace-nowrap">{t.saving}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/demo" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2A5240] hover:text-[#1e3d2f] transition-colors">
            See the live demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
