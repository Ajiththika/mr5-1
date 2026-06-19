import { generateMetadata } from "@/lib/seo";
import PolicyPageClient from "@/components/legal/PolicyPageClient";
import { TERMS_OF_SERVICE } from "@/lib/legal-content";

export const metadata = generateMetadata({
  title: "Terms of Service",
  description:
    "Read the MR5 School Terms of Service covering platform use, 3D classrooms, AI features, subscriptions, and user responsibilities.",
  keywords: [
    "MR5 School terms",
    "LMS terms of service",
    "3D learning platform terms",
    "EdTech legal",
  ],
  url: "/terms",
  type: "website",
});

export default function TermsPage() {
  return <PolicyPageClient document={TERMS_OF_SERVICE} />;
}
