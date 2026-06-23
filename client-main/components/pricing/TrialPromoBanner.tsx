"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { trialService } from "@/services/trial.service";
import { formatTrialRemaining } from "@/lib/trial";
import { TrialStatus } from "@/types/user";

export function TrialPromoBanner() {
    const { user, isAuthenticated, loading, refreshUser } = useEnhancedUser();
    const [trial, setTrial] = useState<TrialStatus | undefined>(user?.trial);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTrial(user?.trial);
    }, [user?.trial]);

    useEffect(() => {
        if (!trial?.active) return;

        const interval = window.setInterval(() => {
            setTrial((current) => {
                if (!current?.active || !current.expiresAt) return current;
                const remainingMs = Math.max(0, new Date(current.expiresAt).getTime() - Date.now());
                return { ...current, remainingMs, active: remainingMs > 0 };
            });
        }, 60000);

        return () => window.clearInterval(interval);
    }, [trial?.active, trial?.expiresAt]);

    const handleStartTrial = async () => {
        if (!isAuthenticated) return;
        setStarting(true);
        setError(null);

        try {
            const response = await trialService.startTrial();
            if (response.success && response.data) {
                setTrial(response.data);
                await refreshUser();
            }
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                "Unable to start trial. Please try again.";
            setError(message);
        } finally {
            setStarting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="mx-auto mb-8 max-w-5xl rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        One-time offer
                    </div>
                    <h2 className="text-lg font-bold text-foreground md:text-xl">
                        Try everything free for 5 hours
                    </h2>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Get full access to all courses, unlimited AI tutoring, certificates, and every Pro feature — no credit card required.
                    </p>
                    {trial?.active && (
                        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                            <Clock className="h-4 w-4" />
                            {formatTrialRemaining(trial.remainingMs)} remaining in your trial
                        </p>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <div className="shrink-0">
                    {!isAuthenticated ? (
                        <Button asChild size="lg" className="w-full md:w-auto">
                            <Link href="/register">Sign up &amp; start trial</Link>
                        </Button>
                    ) : trial?.active ? (
                        <Button asChild size="lg" variant="secondary" className="w-full md:w-auto">
                            <Link href="/courses">Explore courses</Link>
                        </Button>
                    ) : trial?.canStart ? (
                        <Button
                            size="lg"
                            className="w-full md:w-auto"
                            onClick={handleStartTrial}
                            disabled={starting}
                        >
                            {starting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Starting trial...
                                </>
                            ) : (
                                "Start 5-hour free trial"
                            )}
                        </Button>
                    ) : (
                        <Button asChild size="lg" variant="outline" className="w-full md:w-auto">
                            <Link href="/courses">View plans</Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
