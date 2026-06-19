import { generateMetadata } from "@/lib/seo";
import PolicyPageClient from "@/components/legal/PolicyPageClient";
import { PRIVACY_POLICY } from "@/lib/legal-content";

export const metadata = generateMetadata({
  title: "Privacy Policy",
  description:
    "Learn how MR5 School collects, uses, and protects your data across courses, AI tutoring, and optional 3D learning features.",
  keywords: [
    "MR5 School privacy",
    "LMS privacy policy",
    "EdTech data protection",
    "GDPR CCPA education",
  ],
  url: "/privacy",
  type: "website",
});

export default function PrivacyPage() {
  return <PolicyPageClient document={PRIVACY_POLICY} />;
}
