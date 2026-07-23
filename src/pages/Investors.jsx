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

const systemLayers = [
  ['Route the work', 'Exterior signals move through association rules, resident choice, contractor access, execution, and documentation.'],
  ['Keep control local', 'The association owns the workflow and data. A management company may operate inside the system without becoming the permanent control point.'],
  ['Learn from outcomes', 'Every completed project can strengthen the community-specific record of rules, contractors, approvals, and results.'],
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
              <h1 className="gp-display text-6xl md:text-7xl lg:text-8xl text-white leading-[0.9] mt-6">The operating system for governed property work.</h1>
              <p className="text-base md:text-lg text-white/55 mt-8 max-w-3xl leading-relaxed">GatePass routes property work from an exterior signal to association permission, verified execution, and a permanent record. Contractors pay for trusted access to communities; associations retain control of the workflow and data.</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link to="/demo" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors">See the modeled demo <ArrowRight className="w-4 h-4" /></Link>
                <a href="mailto:info@gatepasshoa.com" className="inline-flex items-center gap-2 text-sm text-white/65 hover:text-white border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full transition-colors">Email the founder</a>
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7">
              <div className="text-xs text-white/35 uppercase tracking-[0.25em] mb-5">Current raise</div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight">$500,000 SAFE</div>
              <p className="text-[#B8883A] font-semibold mt-2">$6 million post-money valuation.</p>
              <p className="text-sm text-white/45 leading-relaxed mt-6">The production target is one paid Austin association, one approved contractor work path, one documented completion, and one export the association can keep.</p>
            </div>
          </div>
        </section>

        <section id="current-status" className="py-20 px-6 md:px-8 bg-[#0d1a12] border-b border-white/10">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
            <div>
              <span className="text-xs text-white/30 tracking-[0.25em] uppercase">Current status</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-5 leading-tight">The operating path is modeled. Production contact is next.</h2>
              <p className="text-white/45 mt-5 leading-relaxed">GatePass is pre-revenue. The demo is modeled. No paid customer, production transaction, or realized network economics is being implied.</p>
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
            {systemLayers.map(([title, body]) => (
              <div key={title} className="rounded-[28px] bg-white border border-[#2A5240]/10 p-7">
                <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
                <p className="text-sm text-[#1C1C1A]/60 leading-relaxed mt-4">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 px-6 md:px-8 bg-[#0a130d]">
          <div className="max-w-[1120px] mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-12">
            <div>
              <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase">How it becomes real</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-5 leading-tight">One signal. One permissioned path. One permanent record.</h2>
            </div>
            <div className="space-y-5 text-white/55 leading-relaxed">
              <p>A lawfully visible exterior condition or a homeowner-supplied observation enters as a signal, not a diagnosis. The association applies its rules. The homeowner chooses. An approved contractor executes under a documented scope. The association keeps the result.</p>
              <p>Contractors pay for trusted access after approval. Payment does not purchase board approval, ranking, a lead, or guaranteed work.</p>
              <p>GatePass can operate alongside a management company. The association remains the principal and retains the workflow, data, and export.</p>
              <p>GatePass provides software. It does not provide legal advice, guarantee contractor performance, or act as the association's property manager.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}