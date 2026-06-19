"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { PricingCard, PricingTier } from "@/components/pricing/PricingCard";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_TIERS } from "@/lib/pricing-tiers";
import { Footer } from "@/components/layout/footer";

const FAQS = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, absolutely. You can cancel your subscription at any time from your account settings. You'll retain access until the end of your current billing period.",
  },
  {
    question: "Is there a student discount available?",
    answer:
      "We offer special pricing for students with a valid .edu email address. Verification is automatic during signup.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay.",
  },
  {
    question: "Do you offer team licenses?",
    answer:
      "Yes! Our Team plan supports bulk enrollment and centralized billing. Contact sales for organizations larger than 50 members.",
  },
];

export default function PricingPageClient() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tiers: PricingTier[] = PRICING_TIERS;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col font-sans">
      <Navbar />

      <main className="relative flex-1 overflow-hidden px-4 pb-20 pt-24">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
          <div className="absolute right-[-10%] top-[-20%] h-[600px] w-[600px] animate-pulse-slow rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px] mix-blend-screen" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-4xl space-y-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Risk-free 14-day trial</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-extrabold tracking-tight text-white md:text-7xl"
            >
              Invest in your <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Future Self
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground"
            >
              Unlock the full power of AI-driven education. Simple pricing, no hidden fees.
            </motion.p>
          </div>

          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />

          <div className="mx-auto mb-32 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {tiers.map((tier, index) => (
              <PricingCard key={tier.name} tier={tier} isAnnual={isAnnual} index={index} />
            ))}
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Have questions? We&apos;re here to help.</p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/5 focus:outline-none"
                  >
                    <span className="pr-8 text-lg font-medium">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        openFaq === i && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24 border-t border-white/10 pb-8 pt-16 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">Still have questions?</h3>
            <p className="mb-6 text-muted-foreground">Our support team is ready to assist you.</p>
            <button
              type="button"
              className="rounded-full bg-white px-8 py-3 font-semibold text-black transition-colors hover:bg-gray-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
