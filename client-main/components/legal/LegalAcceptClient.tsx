"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, FileText, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { legalService } from "@/services/legal.service";
import type { PendingLegalDocument } from "@/types/legal-consent";

function getSafeRedirect(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/dashboard";
}

export default function LegalAcceptClient() {
  const { user, loading: authLoading } = useEnhancedUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  const [pending, setPending] = useState<PendingLegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/legal/accept")}`);
      return;
    }

    legalService
      .getRequired()
      .then((docs) => {
        if (docs.length === 0) {
          router.replace(redirectTo);
          return;
        }
        setPending(docs);
      })
      .catch(() => toast.error("Could not load legal requirements"))
      .finally(() => setLoading(false));
  }, [user, authLoading, router, redirectTo]);

  const handleAccept = async () => {
    if (!agreed || pending.length === 0) return;
    try {
      setSubmitting(true);
      await legalService.accept({
        documentVersionIds: pending.map((d) => d.documentVersionId),
        locale: "en",
        source: "web",
      });
      toast.success("Legal agreements accepted");
      router.replace(redirectTo);
    } catch {
      toast.error("Failed to record acceptance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-r from-primary/15 via-purple-600/10 to-cyan-600/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="container relative z-10 mx-auto px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-primary">
              <Shield className="h-4 w-4" />
              Legal consent required
            </div>
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">
              Accept to Enter MR5 School
            </h1>
            <p className="text-muted-foreground">
              Before accessing your dashboard, courses, or 3D classrooms, please
              review and accept the required agreements below.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 pb-20">
        <BentoGrid>
          {pending.map((doc) => (
            <BentoItem
              key={doc.documentVersionId}
              colSpan={6}
              title={doc.title}
              subtitle={`Version ${doc.versionNumber}`}
              icon={<FileText className="h-5 w-5" />}
            >
              <p className="mb-4 text-sm text-muted-foreground">
                Effective {new Date(doc.effectiveAt).toLocaleDateString()}
              </p>
              <Link
                href={doc.slug === "platform-terms" ? "/terms" : doc.slug === "privacy-policy" ? "/privacy" : `/terms`}
                className="text-sm font-medium text-primary hover:underline"
                target="_blank"
              >
                Read full document →
              </Link>
            </BentoItem>
          ))}

          <BentoItem colSpan={12} title="Your Agreement" icon={<Check className="h-5 w-5" />}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 accent-primary"
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                I have read and agree to the{" "}
                {pending.map((d, i) => (
                  <span key={d.documentVersionId}>
                    {i > 0 && (i === pending.length - 1 ? " and " : ", ")}
                    <Link
                      href={d.slug === "privacy-policy" ? "/privacy" : "/terms"}
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      {d.title}
                    </Link>
                  </span>
                ))}
                .
              </span>
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={handleAccept}
                disabled={!agreed || submitting}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Accept & Continue
              </Button>
              <Button variant="outline" asChild className="border-white/10">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground/70">
              Acceptance is recorded with a timestamp for audit purposes.
              LEGAL REVIEW REQUIRED for production retention policies.
            </p>
          </BentoItem>
        </BentoGrid>
      </main>

      <Footer />
    </div>
  );
}
