import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a130d] text-white">
      <Navbar />
      <main className="max-w-[800px] mx-auto px-8 pt-40 pb-32">
        <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6 block">Legal</span>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">Privacy Policy</h1>
        <p className="text-sm text-white/40 mb-12">Last updated: July 2026</p>
        <div className="space-y-8 text-white/60 text-base leading-relaxed">
          <p>GatePass is currently a prelaunch website and modeled product demo. This policy describes the information the website collects today.</p>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">What we collect today</h2>
            <p>When you submit an HOA access review or contractor application, we collect the contact and organization details you provide, such as name, email, phone number, company or community name, ZIP code, trade category, role, unit count, management setup, and notes about what you need help with.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">How we use it</h2>
            <p>We use submitted information to review fit, respond to requests, and prepare potential onboarding conversations. GatePass does not sell submitted contact information.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Modeled demo data</h2>
            <p>The public demo uses modeled sample data. It is not production customer data and should not be treated as live HOA, resident, or contractor activity.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Contact</h2>
            <p>Questions about this policy? Email <a href="mailto:info@gatepasshoa.com" className="text-[#B8883A] hover:underline">info@gatepasshoa.com</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
