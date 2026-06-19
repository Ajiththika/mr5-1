import { Suspense } from "react";
import { generateMetadata } from "@/lib/seo";
import LegalAcceptClient from "@/components/legal/LegalAcceptClient";

export const metadata = generateMetadata({
  title: "Accept Legal Agreements",
  description:
    "Review and accept MR5 School Terms of Service and Privacy Policy to access the LMS and 3D classrooms.",
  url: "/legal/accept",
  noIndex: true,
});

export default function LegalAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          Loading…
        </div>
      }
    >
      <LegalAcceptClient />
    </Suspense>
  );
}
