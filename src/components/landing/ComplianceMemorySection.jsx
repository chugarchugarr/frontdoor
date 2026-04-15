import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Download, Lock } from 'lucide-react';

const EVENTS = [
  { type: 'VIOLATION', tag: 'FineBot', text: 'Notice sent to Unit 14B — unsanctioned fence installation', time: '2 days ago', color: '#B8883A' },
  { type: 'ARC APPROVED', tag: 'ARC Agent', text: 'Exterior paint approval — Unit 22A — Sherwin Williams SW7015', time: '5 days ago', color: '#2A5240' },
  { type: 'VOTE CLOSED', tag: 'VoteBox', text: 'Special assessment passed — 67% approval (53/79 votes)', time: '8 days ago', color: '#2A5240' },
  { type: 'DUES DELINQUENT', tag: 'PayOS', text: 'Unit 7C flagged — 62 days past due — lien process initiated', time: '11 days ago', color: '#B8883A' },
  { type: 'BOARD MEETING', tag: 'BoardRoom', text: 'Minutes recorded — Q1 budget review — 4 board members present', time: '14 days ago', color: '#555' },
];

const pillars = [
  {
    icon: Shield,
    title: 'Legally defensible records',
    body: 'Every compliance action is timestamped, actor-attributed, and immutable. Holds up in small claims court, insurance disputes, and HOA audits.',
  },
  {
    icon: Clock,
    title: '5-year rolling history',
    body: 'Nothing gets lost when board members rotate or resign. New boards inherit the full institutional memory of the community.',
  },
  {
    icon: Download,
    title: 'One-click PMC transition pack',
    body: 'Switching from a management company? Export your complete compliance history as a structured report — ready for your attorney or new manager.',
  },
  {
    icon: Lock,
    title: 'Your data. Always.',
    body: 'GatePass never holds records hostage. Export everything at any time, in full, for free. No data ransom.',
  },
];

export default function ComplianceMemorySection() {
  return (
    <section className="bg-[#f4f1ec] py-32 px-8 border-t border-[#2A5240]/10">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-start gap-4 mb-20">
          <span className="text-xs text-[#2A5240]/40 tracking-[0.25em] uppercase mt-1">Compliance Memory</span>
          <div className="flex-1 h-px bg-[#2A5240]/10 mt-3" />
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">

          {/* Left: headline + pillars */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1C1C1A] leading-tight">
              The only HOA platform<br />
              <span className="text-[#2A5240]">that remembers everything.</span>
            </h2>
            <p className="text-lg text-[#1C1C1A]/50 mt-6 max-w-md leading-relaxed">
              PMCs lose your records when you fire them. Spreadsheets lose context when board members rotate. GatePass builds a permanent, searchable compliance ledger — every action, every decision, every dollar — that belongs to your community forever.
            </p>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div key={p.title}
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2A5240]/10 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-[#2A5240]" />
                    </div>
                    <h3 className="font-bold text-[#1C1C1A] text-sm">{p.title}</h3>
                    <p className="text-sm text-[#1C1C1A]/50 mt-1.5 leading-relaxed">{p.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: live event feed mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="rounded-2xl overflow-hidden border border-[#2A5240]/12 bg-white shadow-sm"
          >
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-[#2A5240]/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#1C1C1A]/40 tracking-[0.15em] uppercase">Compliance Timeline</p>
                <p className="text-sm font-semibold text-[#1C1C1A] mt-0.5">Steiner Ranch HOA</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#2A5240] bg-[#2A5240]/8 px-3 py-1.5 rounded-full font-medium">
                <Shield className="w-3 h-3" />
                247 events logged
              </div>
            </div>

            {/* Events */}
            <div className="divide-y divide-[#2A5240]/6">
              {EVENTS.map((ev, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                  className="px-6 py-4 flex items-start gap-4"
                >
                  <div className="shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: ev.color + '18', color: ev.color }}>
                      {ev.type}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1C1C1A]/80 leading-snug">{ev.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#2A5240]/60 font-mono">{ev.tag}</span>
                      <span className="text-[11px] text-[#1C1C1A]/30">·</span>
                      <span className="text-[11px] text-[#1C1C1A]/30">{ev.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#f4f1ec]/50 border-t border-[#2A5240]/8 flex items-center justify-between">
              <span className="text-xs text-[#1C1C1A]/40">Showing last 5 of 247 events</span>
              <button className="text-xs font-medium text-[#2A5240] flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                <Download className="w-3 h-3" /> Export compliance pack
              </button>
            </div>
          </motion.div>

        </div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="mt-20 p-8 bg-[#2A5240] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div>
            <p className="text-sm font-semibold text-white">Switching from a management company?</p>
            <p className="text-sm text-white/60 mt-1 max-w-lg">
              We'll help you export your compliance history, migrate your data, and go live in 14 days — even if you're mid-contract.
            </p>
          </div>
          <a href="/onboard"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[#2A5240] bg-white hover:bg-[#f4f1ec] px-6 py-3 rounded-full transition-colors whitespace-nowrap">
            Start the switch →
          </a>
        </motion.div>

      </div>
    </section>
  );
}
