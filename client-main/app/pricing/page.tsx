import { generateMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import PricingPageClient from "@/components/pricing/PricingPageClient";

export const metadata: Metadata = generateMetadata({
  title: "Pricing - Free & Premium 3D Learning Plans",
  description:
    "Try MR5 School free for 5 hours with full access to all features. Then choose Starter, Pro, or Team plans for AI tutoring and 3D classrooms.",
  keywords: [
    "MR5 School pricing",
    "online learning subscription",
    "AI tutor plans",
    "3D classroom premium",
    "LMS pricing",
    "education platform cost",
  ],
  url: "/pricing",
  type: "website",
});

export default function PricingPage() {
  return <PricingPageClient />;
}
