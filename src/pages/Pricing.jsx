import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const features = [
  'All 9 operating modules included',
  'Unlimited board members',
  'Unlimited homeowners',
  'Data migration from your current system — free',
  'Board training included — free',
  'Live in 14 days or less',
  '24/7 automated operations',
  'Austin-based support',
  'Your data — exportable anytime',
];

const comparisonRows = [
  { label: 'Annual cost (200 units)', mgmt: '$16,000–$24,000/yr', gp: '$4,000/yr' },
  { label: 'Setup fee', mgmt: '$500–$2,000', gp: '$0' },
  { label: 'Per-module pricing', mgmt: 'Yes', gp: 'No' },
  { label: 'Response time', mgmt: 'Days to weeks', gp: 'Instant' },
  { label: 'Data ownership', mgmt: 'Theirs', gp: 'Yours' },
  { label: 'Contract term', mgmt: '12-mo minimum', gp: 'Annual platform enrollment' },
  { label: 'Transition review', mgmt: 'Slow / opaque', gp: 'Starts before payment' },
];

const faqs = [
  {
    q: 'Is there a long-term contract?',
    a: 'GatePass starts with a board-safe transition review before payment. Platform enrollment is annual at $20/unit/year once your board approves the pilot. Your data remains exportable if you leave.',
  },
  {
    q: 'What does migration involve?',
    a: 'We pull your homeowner data, dues history, and open violations from your current system. Typically takes 3–5 business days. You pay nothing until you\'re live.',
  },
  {
    q: "What if our HOA doesn't have a physical gate?",
    a: "GatePass works for any board-managed residential community — gated or not. The name refers to giving your board access to modern operations, not physical infrastructure.",
  },
  {
    q: 'Is GatePass a licensed property management company?',
    a: 'No — intentionally. GatePass is a software tool, not a licensed property management company under Texas law. We are not subject to TREC licensing requirements and we hold no fiduciary responsibility for HOA funds. Payments are processed directly through your HOA\'s Stripe account. This distinction also reduces your board\'s liability by creating auditable, timestamped records for every decision.',
  },
  {
    q: 'Who handles support?',
    a: 'Austin-based humans, not bots. Reach us at info@gatepasshoa.com. We also provide board training as part of onboarding.',
  },
  {
    q: 'What is the expansion path — is $20/unit the only pricing forever?',
    a: 'The $20/unit flat rate is your community\'s operating platform. GatePass is opening founding contractor access in Austin as communities move through transition review. Contractor fees and transaction economics are designed to offset the HOA subscription over time; the base platform stays flat-rate.',
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0d1a12] pt-40 pb-24 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6 block">Pricing</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              One plan.<br />Everything included.
            </h1>
            <p className="text-lg text-white/40 mt-6 max-w-lg leading-relaxed">
              No tiers. No add-ons. No management company markups. Just $20 per unit, per year.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="bg-[#0a130d] py-20 px-8">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#0d1a12] border border-white/10 rounded-2xl p-10"
          >
            <span className="text-xs text-[#B8883A] tracking-[0.2em] uppercase font-semibold">GatePass — Full Access</span>

            <div className="flex items-end gap-3 mt-6">
              <span className="text-7xl font-bold text-white leading-none">$20</span>
              <span className="text-white/40 text-base mb-2">/unit/year</span>
            </div>
            <p className="text-white/40 text-sm mt-3">Annual platform enrollment. No setup fee. Transition review starts before payment.</p>

            <div className="my-8 border-t border-white/10" />

            <ul className="space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#B8883A] mt-0.5 shrink-0" />
                  <span className="text-sm text-white/70">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/onboard"
              className="mt-10 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-8 py-4 rounded-full transition-colors"
            >
              Start transition review <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pilot economics — visible context for anyone doing the numbers */}
      <section className="bg-[#0d1a12] py-16 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs text-white/30 tracking-[0.25em] uppercase">Pilot economics</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { val: '$20', label: 'per unit / year' },
                { val: '$4,000', label: '200-unit community ARR' },
                { val: '$99', label: 'founding contractor seat' },
                { val: 'Austin', label: 'pilot market first' },
              ].map(({ val, label }) => (
                <div key={label} className="p-5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-[#B8883A]">{val}</div>
                  <div className="text-xs text-white/30 mt-1.5 leading-snug">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/20 mt-6">
              Marketplace upside comes after the board-owned operating layer is installed: contractor access, booked work, and export-safe operating memory.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Expansion path */}
      <section className="bg-[#0a130d] py-16 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs text-white/30 tracking-[0.25em] uppercase">Revenue path</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  stage: 'Year 1',
                  title: 'Platform subscription',
                  desc: '$20/unit/yr. Displace the management company. Build community density in Austin.',
                  color: '#B8883A',
                },
                {
                  stage: 'Austin Launch',
                  title: 'Founding contractor marketplace',
                  desc: 'Contractors pay for verified access as communities move through transition review. Fees and transaction economics can flow back to the community.',
                  color: '#5a9e7a',
                },
                {
                  stage: 'Year 3+',
                  title: 'Data & integrations',
                  desc: 'Premium board analytics. Lender/title integrations for unit resales. Transition memory plus contractor history becomes the moat.',
                  color: '#7b9fd4',
                },
              ].map((item) => (
                <div key={item.stage} className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: item.color }}>{item.stage}</span>
                  <h3 className="text-white font-bold mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-[#f4f1ec] py-24 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-14">
              <span className="text-xs text-[#2A5240]/40 tracking-[0.25em] uppercase">Comparison</span>
              <div className="flex-1 h-px bg-[#2A5240]/10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1A] mb-12">
              What you're paying now vs. GatePass
            </h2>

            {/* Header row */}
            <div className="grid grid-cols-3 gap-4 mb-3 px-4">
              <div />
              <div className="text-xs text-[#1C1C1A]/40 font-semibold uppercase tracking-widest text-center">Management Co.</div>
              <div className="text-xs text-[#2A5240] font-semibold uppercase tracking-widest text-center">GatePass</div>
            </div>

            {/* Rows */}
            <div className="rounded-2xl overflow-hidden border border-[#2A5240]/10">
              {comparisonRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 gap-4 px-4 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-[#f4f1ec]'}`}
                >
                  <div className="text-sm text-[#1C1C1A] font-medium">{row.label}</div>
                  <div className="text-sm text-[#1C1C1A]/50 text-center">{row.mgmt}</div>
                  <div className="text-sm text-[#2A5240] font-semibold text-center">{row.gp}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#1C1C1A]/40 mt-4">
              Based on average Austin-area HOA management company pricing for a 200-unit community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0d1a12] py-24 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-14">
              <span className="text-xs text-white/30 tracking-[0.25em] uppercase">Questions</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="space-y-0">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="border-b border-white/10 py-8"
                >
                  <p className="font-semibold text-white text-base">{faq.q}</p>
                  <p className="text-sm text-white/50 mt-2 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#0a130d] py-32 px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs text-[#B8883A] tracking-[0.25em] uppercase mb-6 block">Ready when you are</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Ready to cut your costs?
            </h2>
            <p className="text-lg text-white/40 mt-6 leading-relaxed">
              Start with a board-safe transition review. Setup and migration are included when your board approves enrollment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                to="/onboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d1a12] bg-[#B8883A] hover:bg-[#c99840] px-8 py-4 rounded-full transition-colors"
              >
                Request transition review <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/demo"
                className="text-sm text-white/50 hover:text-white transition-colors border border-white/20 hover:border-white/40 px-8 py-4 rounded-full"
              >
                See the demo →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
