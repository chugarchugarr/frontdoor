import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const points = [
  { num: '01', title: 'Built for Texas HOAs', body: 'We understand how Austin communities work — from deed restrictions to Travis County requirements. No generic one-size-fits-all software.' },
  { num: '02', title: 'Flat-rate pricing. No surprises.', body: '$20 per unit per year. That\'s it. No hidden fees, no per-module costs, no "enterprise" tiers. A 200-unit HOA pays $4,000/yr — vs. $16,000–$24,000 with a management company.' },
  { num: '03', title: 'The work happens automatically', body: 'Nine agents run your day-to-day on autopilot — collecting dues, sending notices, processing ARC requests, and running votes. You approve. The platform executes.' },
  { num: '04', title: 'Live in 14 days. No vendor lock-in.', body: 'We migrate your data and train your board. Fully live in under two weeks. You own your data — export it anytime. Cancel with 30 days notice. No contracts.' },
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1C1C1A] leading-tight">
              Your board does community.<br />
              <span className="text-[#2A5240]">We do the paperwork.</span>
            </h2>
            <p className="text-lg text-[#1C1C1A]/50 mt-8 max-w-md leading-relaxed">
              The average HOA board member spends 12 hours a month on admin. GatePass cuts that by over 80% — so you get your weekends back.
            </p>

            {/* TAM context for investors scanning the page */}
            <div className="mt-8 p-5 bg-[#2A5240]/8 border border-[#2A5240]/15 rounded-xl">
              <p className="text-xs text-[#2A5240] tracking-[0.15em] uppercase font-semibold mb-2">The market</p>
              <p className="text-sm text-[#1C1C1A]/60 leading-relaxed">
                ~22,000 HOAs in Texas. ~3,000 in Austin metro alone. The US HOA management industry is a $100B/year market — almost entirely captured by legacy property management companies charging $80–120/unit/year. GatePass does it for $20.
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
