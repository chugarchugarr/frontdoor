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
          <p>GatePass is currently a prelaunch website and modeled product demo. Submitting a form does not create a paid subscription, contractor access right, association approval, or guaranteed service relationship.</p>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Service description</h2>
            <p>GatePass is software for routing property work through association rules, contractor access, execution records, and association-owned exports. GatePass does not provide legal advice, perform property inspections, diagnose property conditions, guarantee contractor performance, or act as the association's property manager.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Exterior observations</h2>
            <p>An exterior observation is a signal only. It is not a diagnosis, inspection result, authorization to enter property, authorization to perform work, or statement that the association has approved a project.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Association permission and homeowner choice</h2>
            <p>Each association remains responsible for applying its governing documents, policies, and approval process. Homeowners remain responsible for selecting and contracting with service providers unless a separate written agreement states otherwise.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Contractor access and verification</h2>
            <p>Applying or paying for contractor access does not guarantee approval, ranking, leads, job volume, placement in a specific association channel, or permission to perform work. Any GatePass verification label refers only to the defined records reviewed at that time. It is not an endorsement or quality guarantee.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Pricing shown on the website</h2>
            <p>The website describes intended pricing: association software at $20 per unit per year and founding contractor access at $99 once after approval. Payment terms require a separate checkout or written agreement before they become binding.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Association records</h2>
            <p>GatePass is designed so the association retains control of the workflow data and can export the records it creates. Production ownership, retention, access, and export terms will be governed by the applicable written agreement and privacy policy.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Modeled demo</h2>
            <p>The public demo is for product evaluation. It uses modeled data and does not represent production customer activity, transactions, contractor performance, or realized economics.</p>
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