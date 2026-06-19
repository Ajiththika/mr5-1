"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Scale,
  Shield,
  Accessibility,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import {
  RELATED_POLICY_LINKS,
  type PolicyDocument,
} from "@/lib/legal-content";

const ICONS: Record<string, ReactNode> = {
  terms: <Scale className="h-5 w-5" />,
  privacy: <Shield className="h-5 w-5" />,
  accessibility: <Accessibility className="h-5 w-5" />,
};

interface PolicyPageClientProps {
  document: PolicyDocument;
}

export default function PolicyPageClient({ document }: PolicyPageClientProps) {
  const icon = ICONS[document.slug] ?? <FileText className="h-5 w-5" />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-r from-primary/15 via-purple-600/10 to-cyan-600/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4">{document.badge}</Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {document.title}
            </h1>
            <p className="text-lg text-muted-foreground">{document.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Version {document.version}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Last updated {document.lastUpdated}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 pb-20">
        <nav
          aria-label="Policy sections"
          className="mb-10 flex flex-wrap gap-2"
        >
          {document.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-white"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <BentoGrid>
          {document.sections.map((section, index) => (
            <BentoItem
              key={section.id}
              colSpan={index === 0 ? 12 : 6}
              title={section.title}
              subtitle={section.summary}
              icon={icon}
              className="scroll-mt-28"
            >
              <div id={section.id} className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </BentoItem>
          ))}

          <BentoItem
            colSpan={12}
            title="Related Policies"
            subtitle="Review our other legal and accessibility documents."
            icon={<FileText className="h-5 w-5" />}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {RELATED_POLICY_LINKS.filter(
                (link) => link.href !== `/${document.slug}`,
              ).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-white/10"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground/70">
              This document is provided as an implementation framework and does
              not constitute legal advice. Final text requires review by qualified
              counsel before production deployment.
            </p>
          </BentoItem>
        </BentoGrid>
      </main>

      <Footer />
    </div>
  );
}
