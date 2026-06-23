"use client";

import Link from "next/link";
import { GANESHA_CREDIT_MANDATORY, MODEL_ASSETS } from "@/lib/3d/model-registry";
import { cn } from "@/lib/utils";

interface ModelCreditNoticeProps {
  variant?: "inline" | "footer" | "loading" | "scene";
  className?: string;
}

export function ModelCreditNotice({
  variant = "inline",
  className,
}: ModelCreditNoticeProps) {
  const text = variant === "footer" ? GANESHA_CREDIT_MANDATORY : GANESHA_CREDIT_MANDATORY;

  if (variant === "loading") {
    return (
      <p
        className={cn(
          "mt-3 max-w-xs text-center text-[10px] leading-relaxed text-slate-400",
          className,
        )}
      >
        {GANESHA_CREDIT_MANDATORY}
      </p>
    );
  }

  if (variant === "scene") {
    return (
      <div
        className={cn(
          "pointer-events-auto max-w-[220px] rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-[9px] leading-snug text-slate-300 backdrop-blur-sm",
          className,
        )}
      >
        {GANESHA_CREDIT_MANDATORY}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <p className={cn("text-center text-[10px] leading-relaxed text-muted-foreground", className)}>
        {text}{" "}
        <Link href={MODEL_ASSETS.ganesha.licenseFile} className="underline hover:text-primary" target="_blank" rel="noopener noreferrer">
          License file
        </Link>
        {" · "}
        <Link href="/about#3d-attributions" className="underline hover:text-primary">
          3D credits
        </Link>
      </p>
    );
  }

  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>{text}</p>
  );
}
