"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HubStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function HubStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: HubStatCardProps) {
  return (
    <div
      className={cn(
        "elevated-card group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className="mt-2 text-xs font-medium text-primary">{trend}</p>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
