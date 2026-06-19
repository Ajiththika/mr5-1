"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PRICING_TIERS } from "@/lib/pricing-tiers";

export function HomePricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section
      id="pricing"
      aria-labelledby="home-pricing-heading"
      className="mt-16 scroll-mt-24"
    >
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Risk-free 14-day trial</span>
        </motion.div>

        <motion.h2
          id="home-pricing-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold tracking-tight text-white md:text-4xl"
        >
          Simple, Transparent{" "}
          <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Pricing
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-3 max-w-2xl text-muted-foreground"
        >
          Start free with AI tutoring and 3D classrooms, or upgrade for unlimited
          courses and certificates.
        </motion.p>
      </div>

      <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PRICING_TIERS.map((tier, index) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            isAnnual={isAnnual}
            index={index}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          View full pricing details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
