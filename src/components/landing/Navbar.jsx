import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0d1a12]/95 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between px-8 h-16 max-w-[1600px] mx-auto">
        <Link to="/" className="font-bold text-xl tracking-tight text-white">
          Gate<span style={{ color: '#B8883A' }}>Pass</span>
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/demo" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide uppercase">Demo</Link>
          <Link to="/onboard" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide uppercase">For HOAs</Link>
          <Link to="/contractors" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide uppercase">Contractors</Link>
          <Link to="/pricing" className="text-sm text-white/60 hover:text-white transition-colors tracking-wide uppercase">Pricing</Link>
        </nav>
        <div className="hidden md:flex items-center gap-6">
          <span className="text-xs text-white/40 tracking-widest uppercase">Austin, TX</span>
          <Link to="/onboard" className="text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-5 py-2 rounded-full transition-colors">
            Get started
          </Link>
        </div>
        <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#0d1a12]/98 border-t border-white/10 px-8 py-6 space-y-5">
          <Link to="/demo" className="block text-sm text-white/70 uppercase tracking-wide" onClick={() => setMobileOpen(false)}>Demo</Link>
          <Link to="/onboard" className="block text-sm text-white/70 uppercase tracking-wide" onClick={() => setMobileOpen(false)}>For HOAs</Link>
          <Link to="/contractors" className="block text-sm text-white/70 uppercase tracking-wide" onClick={() => setMobileOpen(false)}>Contractors</Link>
          <Link to="/pricing" className="block text-sm text-white/70 uppercase tracking-wide" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link to="/onboard" className="inline-block mt-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] px-6 py-2.5 rounded-full" onClick={() => setMobileOpen(false)}>
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}
