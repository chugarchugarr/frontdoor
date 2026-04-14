import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard, AlertTriangle, Paintbrush, Calendar, Vote, Wrench, Building2, Megaphone, LayoutDashboard } from 'lucide-react';

const modules = [
  { name: 'PayOS', tag: '01', desc: 'Dues, autopay, late fees, financial reporting', icon: CreditCard },
  { name: 'Compliance', tag: '02', desc: 'Violation tracking, automated notices, escalation', icon: AlertTriangle },
  { name: 'ARC Agent', tag: '03', desc: 'Architectural review submissions and approvals', icon: Paintbrush },
  { name: 'BoardRoom', tag: '04', desc: 'Meeting scheduling, agendas, and minutes', icon: Calendar },
  { name: 'VoteBox', tag: '05', desc: 'Motions, elections, surveys with live results', icon: Vote },
  { name: 'WorkOrders', tag: '06', desc: 'Maintenance requests, assignment, tracking', icon: Wrench },
  { name: 'Amenities', tag: '07', desc: 'Booking, capacity management, deposit tracking', icon: Building2 },
  { name: 'CommHub', tag: '08', desc: 'Announcements, messages, email notifications', icon: Megaphone },
  { name: 'Dashboard', tag: '09', desc: 'Real-time overview of your entire community', icon: LayoutDashboard },
];

export default function ModulesGrid() {
  return (
    <section className="bg-[#0a130d] py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <span className="text-xs text-white/30 tracking-[0.25em] uppercase">Modules</span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">9 agents. Zero staff needed.</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div key={mod.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="group relative p-8 bg-[#0d1a12] hover:bg-[#1a2e1f] transition-colors duration-300 cursor-default"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="text-xs text-white/20 font-mono tracking-widest">{mod.tag}</span>
                  <Icon className="w-4 h-4 text-white/20 group-hover:text-[#B8883A] transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white/80 group-hover:text-white transition-colors">{mod.name}</h3>
                <p className="text-sm text-white/30 group-hover:text-white/50 mt-2 leading-relaxed transition-colors">{mod.desc}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <span className="text-sm text-white/40">All 9 modules included. </span>
          <Link to="/onboard" className="text-sm font-medium" style={{ color: '#B8883A' }}>
            Get started for $20/unit/year →
          </Link>
        </div>
      </div>
    </section>
  );
}
