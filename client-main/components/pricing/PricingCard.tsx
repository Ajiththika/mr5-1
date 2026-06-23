"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PricingFeature {
    text: string;
    included: boolean;
}

export interface PricingTier {
    name: string;
    description: string;
    price: {
        monthly: number;
        annual: number;
    };
    features: PricingFeature[];
    highlight?: boolean;
    ctaText?: string;
    popular?: boolean;
}

interface PricingCardProps {
    tier: PricingTier;
    isAnnual: boolean;
    index: number;
    compact?: boolean;
    onCtaClick?: () => void;
    ctaDisabled?: boolean;
    ctaLoading?: boolean;
}

export const PricingCard = ({
    tier,
    isAnnual,
    index,
    compact = false,
    onCtaClick,
    ctaDisabled = false,
    ctaLoading = false,
}: PricingCardProps) => {
    const rawPrice = isAnnual ? tier.price.annual / 12 : tier.price.monthly;
    const displayPrice = rawPrice % 1 === 0 ? rawPrice.toFixed(0) : rawPrice.toFixed(2);
    const isFree = parseFloat(displayPrice) === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: tier.popular ? -6 : -4 }}
            className={cn(
                "group relative flex h-full flex-col overflow-visible rounded-2xl border-2 transition-all duration-300",
                compact ? "px-6 pb-6 pt-6" : "p-8",
                tier.popular
                    ? [
                          "z-10 border-primary/60",
                          "bg-gradient-to-b from-primary/[0.12] via-primary/[0.04] to-card",
                          "shadow-[0_12px_40px_oklch(var(--primary)/0.18),0_2px_8px_oklch(var(--shadow-color)/0.08)]",
                          "ring-1 ring-primary/25",
                          "dark:from-primary/20 dark:via-primary/10 dark:to-card dark:ring-primary/30",
                          compact && "md:scale-[1.03]",
                      ]
                    : "border-border/70 bg-card/90 shadow-[0_1px_2px_oklch(var(--shadow-color)/0.06),0_6px_20px_oklch(var(--shadow-color)/0.04)] hover:border-primary/20 hover:bg-card hover:shadow-[0_8px_28px_oklch(var(--shadow-color)/0.08)]",
            )}
        >
            {tier.popular && (
                <div className="mb-[30px] flex justify-center">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/40 bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-[0_4px_14px_oklch(var(--primary)/0.35)] ring-2 ring-card dark:ring-background">
                        <Sparkles className="h-3 w-3 fill-current" /> Most Popular
                    </span>
                </div>
            )}

            <div className={cn("relative", compact ? "mb-5" : "mb-8")}>
                <h3 className={cn("mb-2 text-xl font-bold", tier.popular ? "text-primary" : "text-foreground")}>
                    {tier.name}
                </h3>
                <p className="min-h-[40px] text-sm leading-relaxed text-muted-foreground">
                    {tier.description}
                </p>
            </div>

            <div className={compact ? "mb-5" : "mb-8"}>
                <div className="flex items-baseline gap-1">
                    <span className={cn("font-extrabold tracking-tight text-foreground", compact ? "text-4xl" : "text-5xl")}>
                        {isFree ? "Free" : `$${displayPrice}`}
                    </span>
                    {!isFree && (
                        <span className="text-sm font-medium text-muted-foreground">
                            /mo{isAnnual && "*"}
                        </span>
                    )}
                </div>
                {!isFree && isAnnual && (
                    <p
                        className={cn(
                            "mt-2 inline-block rounded-md border px-2 py-1 text-xs font-medium",
                            tier.popular
                                ? "border-primary/20 bg-primary/10 text-foreground"
                                : "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        *Billed ${tier.price.annual} yearly
                    </p>
                )}
            </div>

            <Button
                className={cn(
                    "w-full rounded-xl text-base font-semibold",
                    compact ? "h-12" : "h-14",
                    tier.popular ? (compact ? "mb-6" : "mb-9") : compact ? "mb-5" : "mb-8",
                )}
                variant={tier.popular ? "default" : "outline"}
                onClick={onCtaClick}
                disabled={ctaDisabled || ctaLoading}
            >
                {ctaLoading ? "Please wait..." : tier.ctaText || "Get Started"}
                {!ctaLoading && (
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
            </Button>

            <div className={cn("h-px w-full", compact ? "mb-5" : "mb-8", tier.popular ? "bg-primary/20" : "bg-border")} />

            <div className={cn("flex-1", compact ? "space-y-4" : "space-y-6")}>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Zap className="h-4 w-4 fill-current text-primary" />
                    <span>What&apos;s included:</span>
                </div>
                <ul className={compact ? "space-y-3" : "space-y-4"}>
                    {tier.features.map((feature, i) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            className="group/item flex items-start gap-3 text-sm"
                        >
                            <div
                                className={cn(
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                                    feature.included
                                        ? "border-primary/30 bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground"
                                        : "border-border bg-muted text-muted-foreground",
                                )}
                            >
                                {feature.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </div>
                            <span
                                className={cn(
                                    "leading-6 transition-colors duration-300",
                                    feature.included
                                        ? "text-foreground/85 group-hover/item:text-foreground"
                                        : "text-muted-foreground/60 line-through",
                                )}
                            >
                                {feature.text}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
};
