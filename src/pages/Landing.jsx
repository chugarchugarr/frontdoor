import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ModulesGrid from '../components/landing/ModulesGrid';
import ComplianceMemorySection from '../components/landing/ComplianceMemorySection';
import WhySection from '../components/landing/WhySection';
import AustinSection from '../components/landing/AustinSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ModulesGrid />
      <ComplianceMemorySection />
      <WhySection />
      <AustinSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
