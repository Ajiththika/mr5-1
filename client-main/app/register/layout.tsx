import type { ReactNode } from "react";
import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@/lib/seo";

export const metadata: Metadata = genMeta({
  title: "Create Account",
  description:
    "Join MR5 School and start learning in an immersive 3D virtual classroom with AI teachers and personalized lessons.",
  url: "/register",
  noIndex: true,
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
