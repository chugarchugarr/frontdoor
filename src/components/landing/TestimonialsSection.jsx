import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  { quote: "We cut our management company and saved over $18,000 the first year. GatePass handles everything they never did.", name: 'Board President', community: 'Austin HOA — 220 units' },
  { quote: "Violations used to be a constant fight between neighbors. Now it's handled automatically, consistently, and nobody can argue with the process.", name: 'HOA Treasurer', community: 'Central Austin HOA — 180 units' },
  { quote: "ARC requests used to get lost in email threads for weeks. Now everything is tracked, timestamped, and resolved.", name: 'ARC Chair', community: 'Northwest Austin HOA — 310 units' },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#f4f1ec] py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <span className="text-xs text-[#2A5240]/40 tracking-[0.25em] uppercase">From the community</span>
          <div className="flex-1 h-px bg-[#2A5240]/10" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-[#2A5240]/10"
            >
              <div className="text-4xl font-serif text-[#B8883A] leading-none mb-4">"</div>
              <p className="text-[#1C1C1A] text-base leading-relaxed">{t.quote}</p>
              <div className="mt-8 pt-6 border-t border-[#2A5240]/10">
                <p className="font-semibold text-sm text-[#1C1C1A]">{t.name} — {t.community}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
