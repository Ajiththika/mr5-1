"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GANESHA_CREDIT_MANDATORY,
  MODEL_ASSETS,
} from "@/lib/3d/model-registry";

/** Routes that use full-viewport 3D — global footer would shift the canvas. */
function isImmersiveScenePath(pathname: string) {
  return /\/room\/(classroom|mensa|principal|bathroom)\/?$/.test(pathname);
}

/**
 * Global license compliance strip — visible on every page.
 * Required for CC BY 4.0 third-party 3D assets.
 */
export function LicenseAttributionBar() {
  const pathname = usePathname() ?? "";
  if (isImmersiveScenePath(pathname)) return null;

  return (
    <div
      role="contentinfo"
      aria-label="Third-party 3D model attribution"
      className="border-t border-border/60 bg-muted/30 px-4 py-2 text-center text-[10px] leading-relaxed text-muted-foreground"
    >
      <span>{GANESHA_CREDIT_MANDATORY}</span>
      {" · "}
      <Link
        href={MODEL_ASSETS.ganesha.licenseFile}
        className="underline underline-offset-2 hover:text-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        License file
      </Link>
      {" · "}
      <Link href="/about#3d-attributions" className="underline underline-offset-2 hover:text-primary">
        All 3D credits
      </Link>
    </div>
  );
}
