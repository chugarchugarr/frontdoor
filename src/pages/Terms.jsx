import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a130d]">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-8 pt-40 pb-32">
        <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6 block">Legal</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">Terms of Service</h1>
        <p className="text-sm text-white/40 mb-12">Last updated: April 2026</p>
        <div className="space-y-8 text-white/60 text-base leading-relaxed">
          <p>By using GatePass, your HOA agrees to these terms. GatePass provides HOA operating software on a subscription basis.</p>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Service</h2>
            <p>GatePass provides software tools for HOA management including dues collection, violation tracking, ARC review, voting, work orders, amenity booking, and communications. Service is month-to-month with 30 days notice to cancel.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Pricing</h2>
            <p>$20 per unit per year, billed annually. No setup fees. No cancellation fees. Price is locked for 12 months from enrollment.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Your responsibilities</h2>
            <p>Your HOA board is responsible for ensuring GatePass is used in compliance with your governing documents and applicable Texas HOA law. GatePass is a software tool, not a licensed property management company.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Limitation of liability</h2>
            <p>GatePass is not liable for decisions made by your board using the platform. Software is provided as-is with a 99.9% uptime SLA.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Contact</h2>
            <p>Questions? Email <a href="mailto:info@gatepasshoa.com" className="text-[#B8883A] hover:underline">info@gatepasshoa.com</a>.</p>
          </div>
          <p className="text-white/30 text-sm pt-8 border-t border-white/10">Full legal terms of service coming soon. This page represents our current service commitments.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
