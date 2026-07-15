import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a130d]">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-8 pt-40 pb-32">
        <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6 block">Legal</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">Privacy Policy</h1>
        <p className="text-sm text-white/40 mb-12">Last updated: April 2026</p>
        <div className="space-y-8 text-white/60 text-base leading-relaxed">
          <p>GatePass ("we", "us", "our") is committed to protecting the privacy of HOA communities and their members. This policy explains how we collect, use, and protect your information.</p>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">What we collect</h2>
            <p>We collect information necessary to operate your HOA: homeowner contact details, dues records, violation history, ARC submissions, and board communications. We do not sell this data to third parties.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">How we use it</h2>
            <p>Your data is used exclusively to power GatePass services for your community. Payment data is processed by Stripe and never stored on our servers.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Data ownership</h2>
            <p>Your association owns its data. Records are exportable at any time and retained for the life of the subscription. If the association cancels, GatePass will provide a full export and delete the data from active systems 30 days later.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:info@gatepasshoa.com" className="text-[#B8883A] hover:underline">info@gatepasshoa.com</a>.</p>
          </div>
          <p className="text-white/30 text-sm pt-8 border-t border-white/10">This page summarizes current GatePass data practices and may be updated as formal legal review progresses.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
