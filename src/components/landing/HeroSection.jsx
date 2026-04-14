import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BG_SLIDES = [
  { url: 'https://media.base44.com/images/public/69c611675e3c7c700c2c0233/0838a0198_IMG_1574.jpeg', label: 'Austin Skyline — Lady Bird Lake' },
  { url: 'https://media.base44.com/images/public/69c611675e3c7c700c2c0233/1c37c5678_IMG_1573.jpeg', label: 'Downtown Austin from the River' },
  { url: 'https://media.base44.com/images/public/69c611675e3c7c700c2c0233/78fe530bf_IMG_1572.jpeg', label: 'Austin Skyline — Zilker Park' },
  { url: 'https://media.base44.com/images/public/69c611675e3c7c700c2c0233/a266d57c1_IMG_1571.jpeg', label: 'Lady Bird Lake & Colorado River' },
];

const SLIDE_DURATION = 5000;

export default function HeroSection() {
  const [tick, setTick] = useState(0);
  const [slide, setSlide] = useState(0);
  const words = ['neighborhoods.', 'communities.', 'front yards.', 'HOA boards.', 'Austin.'];

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % BG_SLIDES.length), SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-[#0a130d]">
      <AnimatePresence initial={false}>
        <motion.div
          key={slide}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${BG_SLIDES[slide].url}')` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 bg-[#0a130d]/60" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a130d] via-[#0a130d]/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
        {BG_SLIDES.map((bg, i) => (
          <button key={i} onClick={() => setSlide(i)} title={bg.label}
            className={`rounded-full transition-all duration-300 ${i === slide ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
            style={{ minWidth: '20px', minHeight: '20px', padding: '9px' }}
          />
        ))}
      </div>
      <motion.div key={`label-${slide}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="absolute top-24 right-8 z-20 hidden md:flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-xs text-white/60 font-medium">{BG_SLIDES[slide].label}</span>
      </motion.div>
      <div className="relative z-10 max-w-[1600px] mx-auto px-8 pb-20 pt-32 w-full">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50 tracking-[0.2em] uppercase">Now accepting Austin HOAs</span>
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-bold text-white leading-none tracking-tight max-w-4xl">
            Fire your<br />
            <span style={{ color: '#B8883A' }}>management company.</span>
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-white/70 mt-4 max-w-2xl tracking-tight">
            Run your HOA for $20/unit/year.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-white/30 tracking-[0.15em] uppercase">Built for</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={tick}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-xs tracking-[0.15em] uppercase"
                style={{ color: '#B8883A' }}
              >
                {words[tick % words.length]}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="text-lg md:text-xl text-white/50 mt-8 max-w-lg leading-relaxed font-light">
            The average HOA pays $80–120/unit/year for a management company that ignores their calls. GatePass does more, for less, starting day one.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-10">
            <Link to="/onboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">
              Switch in 14 days — free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/demo" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full">
              View live demo
            </Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 1 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <div className="flex flex-wrap items-center gap-10">
            {[['$4k/yr', 'vs $20k+ with a mgmt co.'], ['$20', 'per unit / year'], ['-75%', 'board admin time'], ['14 days', 'avg. time to go live']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-xs text-white/40 mt-0.5 tracking-wide uppercase">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/25 mt-6 tracking-wide">No contracts. No setup fees. Cancel anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}
