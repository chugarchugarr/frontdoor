import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const status = [
  ['Working modeled demo', 'Yes'],
  ['Paid HOA customers', '0'],
  ['Production contractor transactions', '0'],
  ['Production revenue', '$0'],
];

export default function Investors() {
  return (
    <div className="min-h-screen bg-[#0a130d] text-white">
      <Navbar />
      <main>
        <section className="pt-36 pb-20 px-6 md:px-8 border-b border-white/10">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-end">
            <div>
              <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase">GatePass pre-seed · Austin</span>
              <h1 className="gp-display text-6xl md:text-7xl lg:text-8xl text-white leading-[0.9] mt-6">HOA permission is the access point.</h1>
              <p className="text-base md:text-lg text-white/55 mt-8 max-w-2xl leading-relaxed">GatePass is building the software and contractor access layer for community associations. The association pays for the board workspace. Contractors apply for access to HOA-approved channels.</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link to="/demo" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">See the demo <ArrowRight className="w-4 h-4" /></Link>
                <a href="mailto:info@gatepasshoa.com" className="inline-flex items-center gap-2 text-sm text-white/65 hover:text-white border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full transition-colors">Email the founder</a>
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7">
              <div className="text-xs text-white/35 uppercase tracking-[0.25em] mb-5">Current raise</div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight">$500,000 SAFE</div>
              <p className="text-[#B8883A] font-semibold mt-2">$6 million post-money valuation.</p>
              <p className="text-sm text-white/45 leading-relaxed mt-6">The money is for the production jump: one paid Austin HOA, one approved contractor transaction, and one export the association can keep.</p>
            </div>
          </div>
        </section>

        <section id="current-status" className="py-20 px-6 md:px-8 bg-[#0d1a12] border-b border-white/10">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
            <div>
              <span className="text-xs text-white/30 tracking-[0.25em] uppercase">Current status</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-5 leading-tight">The demo works. The first paid community is next.</h2>
              <p className="text-white/45 mt-5 leading-relaxed">This page separates product state from customer activity. GatePass is pre-revenue. The demo is modeled. No paid customer or production transaction is being implied.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {status.map(([label, value]) => (
                <div key={label} className="rounded-[24px] bg-white/[0.04] border border-white/10 p-6">
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <div className="text-xs uppercase tracking-[0.16em] text-white/35 mt-2 leading-snug">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 md:px-8 bg-[#f4f1ec] text-[#1C1C1A]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-3 gap-4">
            {[
              ['The customer is organized.', 'At the end of 2025, the United States had 373,000 community associations with 78.1 million residents.'],
              ['The access point is local.', 'A board can decide whether a contractor gets a clean channel into the community. That decision is more valuable than raw permit data.'],
              ['The founder has the scar tissue.', 'GatePass comes from years of Central Texas field sales, not a spreadsheet-only view of home services.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[28px] bg-white border border-[#2A5240]/10 p-7">
                <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
                <p className="text-sm text-[#1C1C1A]/60 leading-relaxed mt-4">{body}</p>
              </div>
            ))}
          </div>
          <div className="max-w-[1120px] mx-auto mt-6 text-xs text-[#1C1C1A]/45">
            Source: <a className="underline" href="https://foundation.caionline.org/publications/factbook/statistical-review/" target="_blank" rel="noreferrer">Foundation for Community Association Research, 2025 Statistical Review</a>.
          </div>
        </section>

        <section className="py-20 px-6 md:px-8 bg-[#0a130d]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-12">
            <div>
              <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase">How it becomes real</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-5 leading-tight">One association. One job. One export.</h2>
            </div>
            <div className="space-y-5 text-white/55 leading-relaxed">
              <p>The first production milestone is not more website language. It is an Austin association paying for the software, a contractor completing one approved next step through GatePass, and the board exporting the record afterward.</p>
              <p>That proves the core motion: the HOA controls access, the contractor gets a better channel than knocking doors, and the association keeps the file.</p>
              <p>The production transaction model is designed to return a defined share to the participating association or homeowner. The exact share and payment structure will not be promised until counsel and production payment infrastructure approve it.</p>
              <p>GatePass provides software. It does not provide legal advice or act as the association's property manager.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
