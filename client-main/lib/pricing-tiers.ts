import type { PricingTier } from "@/components/pricing/PricingCard";

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    description: "Basic access after your trial ends.",
    price: { monthly: 0, annual: 0 },
    ctaText: "Start Learning Free",
    features: [
      { text: "Access to basic courses", included: true },
      { text: "5 AI Tutor queries / day", included: true },
      { text: "Community support", included: true },
      { text: "Basic progress tracking", included: true },
      { text: "5-hour full-access trial (once)", included: true },
      { text: "Unlimited AI interactions", included: false },
      { text: "Certificate of completion", included: false },
    ],
  },
  {
    name: "Pro Learner",
    description: "Everything unlocked — start with a 5-hour free trial.",
    price: { monthly: 19, annual: 190 },
    popular: true,
    ctaText: "Start 5-Hour Trial",
    features: [
      { text: "Access to all courses", included: true },
      { text: "Unlimited AI Tutor queries", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Personalized learning path", included: true },
      { text: "Certificate of completion", included: true },
      { text: "1-on-1 Mentorship", included: false },
    ],
  },
  {
    name: "Team & School",
    description: "For classrooms and collaborative learning.",
    price: { monthly: 99, annual: 990 },
    ctaText: "Contact Sales",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Student management", included: true },
      { text: "Custom curriculum", included: true },
      { text: "Bulk enrollment", included: true },
      { text: "API Access", included: true },
      { text: "Dedicated account manager", included: true },
    ],
  },
];
