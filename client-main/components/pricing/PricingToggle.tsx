"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PricingToggleProps {
    isAnnual: boolean;
    onToggle: (value: boolean) => void;
    compact?: boolean;
}

export const PricingToggle = ({ isAnnual, onToggle, compact = false }: PricingToggleProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center", compact ? "mb-8 space-y-3" : "mb-12 space-y-4")}>
            <div className="relative flex items-center rounded-full border border-border bg-muted p-1 shadow-inner">
                <motion.div
                    className="absolute bottom-1 top-1 z-0 rounded-full bg-primary shadow-md shadow-primary/20"
                    initial={false}
                    animate={{
                        left: isAnnual ? "50%" : "4px",
                        right: isAnnual ? "4px" : "50%",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />

                <button
                    type="button"
                    onClick={() => onToggle(false)}
                    className={cn(
                        "relative z-10 min-w-[100px] rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        !isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    Monthly
                </button>
                <button
                    type="button"
                    onClick={() => onToggle(true)}
                    className={cn(
                        "relative z-10 min-w-[100px] rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    Yearly
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                    Save up to 20% with yearly billing
                </span>
                <span className="hidden rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 sm:inline-block">
                    Best Value
                </span>
            </div>
        </div>
    );
};
