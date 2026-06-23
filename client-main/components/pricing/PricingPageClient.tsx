"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { PricingCard, PricingTier } from "@/components/pricing/PricingCard";
import { TrialPromoBanner } from "@/components/pricing/TrialPromoBanner";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING_TIERS } from "@/lib/pricing-tiers";
import { Footer } from "@/components/layout/footer";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { trialService } from "@/services/trial.service";

const FAQS = [
  {
    question: "How does the 5-hour free trial work?",
    answer:
      "Sign up once and start your trial to unlock every Pro feature for 5 hours — all courses, unlimited AI tutoring, certificates, and more. No credit card required. After it ends, you can continue on the free Starter plan or upgrade to Pro.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. You can cancel from your account settings at any time. You keep access until the end of your current billing period.",
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
      "Yes. Our Team plan supports bulk enrollment and centralized billing. Contact sales for organizations larger than 50 members.",
  },
];

export default function PricingPageClient() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [startingTrial, setStartingTrial] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, refreshUser } = useEnhancedUser();

  const tiers: PricingTier[] = PRICING_TIERS;

  const handleProCta = async () => {
    if (!isAuthenticated) {
      router.push("/register");
      return;
    }

    if (user?.trial?.active) {
      router.push("/courses");
      return;
    }

    if (!user?.trial?.canStart) {
      router.push("/courses");
      return;
    }

    setStartingTrial(true);
    try {
      await trialService.startTrial();
      await refreshUser();
      router.push("/courses");
    } catch {
      router.push("/courses");
    } finally {
      setStartingTrial(false);
    }
  };

  const handleStarterCta = () => {
    router.push(isAuthenticated ? "/courses" : "/register");
  };

  const handleTeamCta = () => {
    router.push("/contact");
  };

  const tierHandlers = [handleStarterCta, handleProCta, handleTeamCta];

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="relative flex-1 overflow-hidden px-4 pb-16 pt-20 sm:px-6">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-background to-background" />
          <div className="absolute right-[-10%] top-[-20%] h-[480px] w-[480px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <header className="hero-band mx-auto mb-8 max-w-3xl space-y-4 p-6 text-center sm:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-sm font-semibold text-primary shadow-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>5-hour free trial — full access</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="heading-display text-4xl sm:text-5xl"
            >
              Simple pricing for{" "}
              <span className="text-primary">every learner</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Try every feature free for 5 hours, then choose the plan that fits you. No hidden fees.
            </motion.p>
          </header>

          <TrialPromoBanner />

          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} compact />

          <div className="mx-auto mb-16 grid max-w-5xl grid-cols-1 items-center gap-5 pt-4 md:grid-cols-3 md:gap-6 md:pt-5">
            {tiers.map((tier, index) => (
              <PricingCard
                key={tier.name}
                tier={tier}
                isAnnual={isAnnual}
                index={index}
                compact
                onCtaClick={tierHandlers[index]}
                ctaLoading={index === 1 && startingTrial}
              />
            ))}
          </div>

          <section className="mx-auto max-w-2xl">
            <div className="mb-6 text-center">
              <h2 className="heading-display mb-2 text-2xl sm:text-3xl">Frequently asked questions</h2>
              <p className="text-sm text-muted-foreground sm:text-base">Quick answers about trials and billing.</p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={faq.question} className="elevated-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:p-5"
                  >
                    <span className="text-sm font-semibold text-foreground sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-300",
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
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5 sm:pb-5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          <div className="section-divider mt-14 pt-10 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 p-3">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="heading-display mb-2 text-xl sm:text-2xl">Still have questions?</h3>
            <p className="mb-5 text-sm text-muted-foreground sm:text-base">Our support team is ready to help.</p>
            <Button size="lg" asChild>
              <Link href="/contact">Contact support</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
