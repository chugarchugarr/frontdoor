import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0a130d] border-t border-white/5 px-8 py-12">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="font-bold text-lg text-white tracking-tight">
            Gate<span style={{ color: '#B8883A' }}>Pass</span>
          </div>
          <p className="text-xs text-white/30 mt-1.5">Association-owned operating system for governed property work. Built in Austin, TX.</p>
        </div>
        <div className="flex flex-wrap items-center gap-8">
          <Link to="/demo" className="text-xs text-white/40 hover:text-white transition-colors tracking-wide uppercase">See the demo</Link>
          <Link to="/onboard" className="text-xs text-white/40 hover:text-white transition-colors tracking-wide uppercase">Associations</Link>
          <Link to="/contractors" className="text-xs text-white/40 hover:text-white transition-colors tracking-wide uppercase">Contractors</Link>
          <Link to="/pricing" className="text-xs text-white/40 hover:text-white transition-colors tracking-wide uppercase">Pricing</Link>
          <Link to="/investors" className="text-xs text-white/40 hover:text-white transition-colors tracking-wide uppercase">Investors</Link>
          <Link to="/privacy" className="text-xs text-white/40 hover:text-white transition-colors tracking-wide uppercase">Privacy</Link>
          <Link to="/terms" className="text-xs text-white/40 hover:text-white transition-colors tracking-wide uppercase">Terms</Link>
          <a href="mailto:info@gatepasshoa.com" className="text-xs text-white/40 hover:text-white transition-colors tracking-wide">info@gatepasshoa.com</a>
        </div>
        <p className="text-xs text-white/20">© {new Date().getFullYear()} GatePass — Austin, Texas</p>
      </div>
    </footer>
  );
}