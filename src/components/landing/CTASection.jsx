import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="relative bg-[#0a130d] py-40 px-8 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url('https://media.base44.com/images/public/69c611675e3c7c700c2c0233/a266d57c1_IMG_1571.jpeg')` }}
      />
      <div className="relative z-10 max-w-[900px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6 block">Own the operating layer</span>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Turn board control<br /><span style={{ color: '#B8883A' }}>into community leverage.</span>
          </h2>
          <p className="text-lg text-white/40 mt-8 max-w-md mx-auto leading-relaxed">
            Tell us your PMC situation, your board risk, and your contractor needs. GatePass maps the transition path, preserves the compliance record, and opens the access layer your community already controls.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link to="/onboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-8 py-4 rounded-full transition-colors">
              Map the transition <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/demo" className="text-sm text-white/50 hover:text-white transition-colors">
              See it live first →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
