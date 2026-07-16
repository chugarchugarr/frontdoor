import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a130d] text-white">
      <Navbar />
      <main className="max-w-[800px] mx-auto px-8 pt-40 pb-32">
        <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6 block">Legal</span>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">Terms of Service</h1>
        <p className="text-sm text-white/40 mb-12">Last updated: July 2026</p>
        <div className="space-y-8 text-white/60 text-base leading-relaxed">
          <p>GatePass is currently a prelaunch website and modeled product demo. Submitting a form does not create a paid subscription, contractor access right, or guaranteed service relationship.</p>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Service description</h2>
            <p>GatePass provides software. It does not provide legal advice or act as the association's property manager. Boards, managers, residents, and contractors remain responsible for their own decisions and obligations.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Pricing shown on the website</h2>
            <p>The website describes intended pricing: HOA software at $20 per unit per year and founding contractor access at $99 once after approval. Payment terms require a separate checkout or written agreement before they become binding.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Contractor applications</h2>
            <p>Applying as a contractor does not guarantee approval, access, leads, job volume, or placement in any specific association channel.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Modeled demo</h2>
        <p>The public demo is for product evaluation. It uses modeled data and does not represent production customer activity.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Contact</h2>
            <p>Questions? Email <a href="mailto:info@gatepasshoa.com" className="text-[#B8883A] hover:underline">info@gatepasshoa.com</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
