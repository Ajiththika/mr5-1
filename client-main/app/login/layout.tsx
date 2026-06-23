import type { ReactNode } from "react";
import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@/lib/seo";

export const metadata: Metadata = genMeta({
  title: "Sign In",
  description:
    "Sign in to MR5 School to access your 3D virtual classroom, courses, and AI-powered learning progress.",
  url: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
