import { generateMetadata } from "@/lib/seo";
import PolicyPageClient from "@/components/legal/PolicyPageClient";
import { ACCESSIBILITY_STATEMENT } from "@/lib/legal-content";

export const metadata = generateMetadata({
  title: "Accessibility Statement",
  description:
    "MR5 School accessibility commitment: keyboard navigation, screen reader support, display preferences, and 2D fallbacks for 3D lessons.",
  keywords: [
    "MR5 School accessibility",
    "WCAG LMS",
    "inclusive education",
    "3D learning accessibility",
  ],
  url: "/accessibility",
  type: "website",
});

export default function AccessibilityPage() {
  return <PolicyPageClient document={ACCESSIBILITY_STATEMENT} />;
}
