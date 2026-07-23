import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const included = [
  'Association-owned board workspace and records',
  'Dues snapshot and delinquency view',
  'Violations, ARC requests, votes, work orders, amenities, and announcements',
  'Exterior-signal and contractor-access workflow',
  'Credential, insurance, scope, approval, and completion records',
  'Exportable association history',
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0a130d] text-white">
      <Navbar />
      <main>
        <section className="pt-36 pb-20 px-6 md:px-8 border-b border-white/10">
          <div className="max-w-[940px] mx-auto">
            <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase">Pricing</span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mt-6">The association-owned operating system is $20 per unit per year.</h1>
            <p className="text-lg text-white/50 mt-6 max-w-3xl leading-relaxed">The core workspace routes property work from exterior signal to permission, execution, and permanent record. There is no setup fee.</p>
          </div>
        </section>

        <section className="py-20 px-6 md:px-8 bg-[#0d1a12]">
          <div className="max-w-[940px] mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
            <div className="rounded-[32px] bg-white/[0.04] border border-white/10 p-8">
              <div className="text-xs text-white/35 uppercase tracking-[0.2em]">Association software</div>
              <div className="flex items-end gap-3 mt-6">
                <span className="text-7xl font-bold leading-none">$20</span>
                <span className="text-white/45 mb-2">/ unit / year</span>
              </div>
              <p className="text-sm text-white/45 mt-5 leading-relaxed">Annual enrollment begins only after the board agrees to move forward. The workflow review comes first.</p>
              <Link to="/onboard" className="mt-8 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-7 py-3.5 rounded-full transition-colors w-full">Request a workflow review <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="rounded-[32px] bg-white/[0.04] border border-white/10 p-8">
              <h2 className="text-2xl font-bold tracking-tight">Included core tools</h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                {included.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-white/65 leading-relaxed">
                    <Check className="w-4 h-4 text-[#B8883A] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-[#B8883A]/25 bg-[#B8883A]/10 p-5">
                <h3 className="text-lg font-bold">Trusted contractor access</h3>
                <p className="text-sm text-white/60 leading-relaxed mt-2">Founding contractor access is $99 once, after approval. Payment does not buy association permission, ranking, a lead, or guaranteed job volume.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 md:px-8 bg-[#f4f1ec] text-[#1C1C1A]">
          <div className="max-w-[940px] mx-auto grid md:grid-cols-3 gap-4">
            {[
              ['Association control', 'The association owns the workflow, data, and export.'],
              ['Homeowner choice', 'The homeowner chooses the contractor; GatePass does not assign the job.'],
              ['Defined verification', 'Credentials and completion evidence are recorded. Verification is not an endorsement or quality guarantee.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[24px] bg-white border border-[#2A5240]/10 p-6">
                <h3 className="font-bold text-xl tracking-tight">{title}</h3>
                <p className="text-sm text-[#1C1C1A]/60 leading-relaxed mt-3">{body}</p>
              </div>
            ))}
          </div>
          <p className="max-w-[940px] mx-auto text-xs text-[#1C1C1A]/45 mt-6">GatePass provides software. It does not provide legal advice, guarantee contractor performance, or act as the association's property manager.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}