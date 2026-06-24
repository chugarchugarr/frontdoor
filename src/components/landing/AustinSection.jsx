import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">We live here too.</h2>

            <p className="text-base text-white/40 mt-8 leading-relaxed max-w-md">
              Spent years in field sales watching HOA boards get crushed — overcharged by management companies, trapped by 12-month contracts, and cut out of the contractor economy moving through their own neighborhoods. GatePass is the platform I wish existed. We know what Travis County requires. We know Hill Country deed restrictions. We built this for communities like ours.
            </p>

            <div className="mt-6 flex items-start gap-3 border-l-2 pl-4" style={{ borderColor: '#B8883A' }}>
              <p className="text-sm text-white/70 leading-relaxed">
                No physical gate required. GatePass works for any HOA or board-managed community — gated or not.
              </p>
            </div>

            {/* Data moat story */}
            <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs text-[#B8883A] tracking-[0.15em] uppercase font-semibold mb-2">The platform gets smarter over time</p>
              <p className="text-sm text-white/50 leading-relaxed">
                Every community that joins feeds GatePass data on transition paths, violation patterns, contractor performance, payment behavior, and ARC approval history. More communities create better benchmarks, stronger contractor access, and a private operating memory no management company can scrape.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-10 pt-8 border-t border-white/10">
              {[['Austin', 'pilot market'], ['$20', 'per unit / year'], ['25', 'founding contractor seats'], ['9 agents', 'working 24/7 for your HOA']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-[#B8883A]">{val}</div>
                  <div className="text-xs text-white/30 mt-1 leading-snug">{label}</div>
                </div>
              ))}
            </div>

            <Link to="/onboard" className="inline-flex items-center gap-2 mt-10 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-6 py-3 rounded-full transition-colors">
              Switch your HOA <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
