import React from 'react';
import { motion } from 'framer-motion';

export default function AustinSection() {
  return (
    <section className="bg-[#0a130d] py-0 overflow-hidden">
      <div className="grid md:grid-cols-2 min-h-[70vh]">
        <div className="relative min-h-[40vh] md:min-h-0">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://media.base44.com/images/public/69c611675e3c7c700c2c0233/78fe530bf_IMG_1572.jpeg')`,
              filter: 'brightness(0.5) saturate(0.7)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a130d]" />
          <div className="absolute bottom-8 left-8">
            <span className="text-xs text-white/30 tracking-[0.2em] uppercase">Austin, Texas</span>
          </div>
        </div>
        <div className="flex flex-col justify-center px-10 md:px-16 py-20 bg-[#0d1a12]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-xs text-[#B8883A] tracking-[0.2em] uppercase mb-6 block">Deep in the heart</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">We live here too.</h2>
            <p className="text-base text-white/40 mt-6 leading-relaxed max-w-md">
              GatePass was built by Austinites tired of watching HOA boards suffer under outdated software and predatory management companies. We know what Travis County requires. We know the quirks of Hill Country deed restrictions. We built this for communities like ours.
            </p>
            <div className="mt-6 flex items-start gap-3 border-l-2 pl-4" style={{ borderColor: '#B8883A' }}>
              <p className="text-sm text-white/70 leading-relaxed">
                No physical gate required. GatePass works for any HOA or board-managed community.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-white/10">
              {[['12 hrs', 'saved per board member / month'], ['14 days', 'avg. time to go live'], ['$0', 'setup or migration fees'], ['9 agents', 'working 24/7 for your HOA']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-[#B8883A]">{val}</div>
                  <div className="text-xs text-white/30 mt-1 leading-snug">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
