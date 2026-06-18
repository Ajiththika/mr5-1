import { generateMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import PricingPageClient from "@/components/pricing/PricingPageClient";

export const metadata: Metadata = generateMetadata({
  title: "Pricing - Free & Premium 3D Learning Plans",
  description:
    "Choose your MR5 School plan. Start free with AI tutoring and 3D classrooms, or upgrade to Premium for unlimited courses, certificates, and personalized learning.",
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
