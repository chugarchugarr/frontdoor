import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, DoorOpen, Hammer, Landmark, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: ShieldCheck,
    label: '01',
    title: 'Contractors see exterior signals',
    body: 'Roofs, fences, drainage, paint, and visible conditions can indicate expensive problems before homeowners know what they mean.',
  },
  {
    icon: DoorOpen,
    label: '02',
    title: 'The HOA controls the path',
    body: 'Observations route through the association’s permission layer — not door-to-door solicitation, cold calls, or unmanaged vendor pressure.',
  },
  {
    icon: Hammer,
    label: '03',
    title: 'Contractors apply for permissioned access',
    body: 'Trades can reserve founding access while communities enroll. Live work volume will be reported only after real jobs are processed.',
  },
  {
    icon: Landmark,
    label: '04',
    title: 'The record compounds',
    body: 'Each approved observation, work path, and contractor interaction becomes part of the association-owned operating record.',
  },
];

export default function MarketplaceSection() {
  return (
    <section className="bg-[#0b150f] py-32 px-8 border-y border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-start gap-4 mb-16">
          <span className="text-xs text-white/30 tracking-[0.25em] uppercase mt-1">Marketplace</span>
          <div className="flex-1 h-px bg-white/10 mt-3" />
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              <p className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6">The HOA is the gate</p>
              <h2 className="gp-display text-5xl md:text-6xl lg:text-7xl text-white leading-[0.92]">
                Software earns trust.<br />
                <span style={{ color: '#B8883A' }}>Access creates the market.</span>
              </h2>
              <p className="text-base md:text-lg text-white/45 mt-8 max-w-lg leading-relaxed">
                GatePass is not a vendor directory. It gives contractors a permissioned way to surface exterior observations through the HOA, while homeowners receive relevant work paths without solicitation at the door.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/demo?view=transition" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-6 py-3.5 rounded-full transition-colors">
                  See the transition graph <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/contractors" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white border border-white/15 hover:border-white/35 px-6 py-3.5 rounded-full transition-colors">
                  Contractor access →
                </Link>
                <Link to="/investors" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white border border-white/15 hover:border-white/35 px-6 py-3.5 rounded-full transition-colors">
                  Investor brief →
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-[28px] overflow-hidden">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="bg-[#0a130d] p-7 md:p-8 hover:bg-[#101d14] transition-colors"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs text-white/20 font-mono tracking-widest">{step.label}</span>
                    <Icon className="w-4 h-4 text-[#B8883A]/70" />
                  </div>
                  <h3 className="text-lg font-bold text-white/85 leading-tight">{step.title}</h3>
                  <p className="text-sm text-white/35 mt-3 leading-relaxed">{step.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
