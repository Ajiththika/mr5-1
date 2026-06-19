"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { ShieldCheck, Bot, Loader2 } from "lucide-react";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { legalService } from "@/services/legal.service";

export function AIConsentModal() {
    const { user } = useEnhancedUser();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;

        let timer: ReturnType<typeof setTimeout> | undefined;

        legalService
            .getPreferences()
            .then((prefs) => {
                if (!prefs.aiFeatures) {
                    timer = setTimeout(() => setOpen(true), 1500);
                }
            })
            .catch(() => {
                const legacy = localStorage.getItem("mr5-ai-consent");
                if (!legacy) {
                    timer = setTimeout(() => setOpen(true), 1500);
                }
            });

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [user]);

    const handleAccept = async () => {
        try {
            setLoading(true);
            await legalService.updatePreferences({ aiFeatures: true });
            localStorage.setItem("mr5-ai-consent", "true");
            setOpen(false);
        } catch {
            localStorage.setItem("mr5-ai-consent", "true");
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-[#0b1226]/95 backdrop-blur-xl border border-blue-500/20 text-white">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Bot className="h-6 w-6 text-blue-400" />
                        </div>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            AI-Powered Learning
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-blue-100/70 pt-2">
                        MR5 School uses Artificial Intelligence to enhance your learning experience.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-3 text-sm text-blue-100/80 bg-blue-500/10 p-3 rounded-xl border border-blue-500/10">
                        <ShieldCheck className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white mb-1">Privacy First</p>
                            Your data is processed securely. Personal identifiers are minimized when communicating with AI models.
                        </div>
                    </div>
                    <ul className="list-disc list-inside text-sm text-blue-100/60 space-y-1 ml-1">
                        <li>Smart Course Summaries</li>
                        <li>Virtual Learning Coach</li>
                        <li>Auto-Grading Feedback</li>
                    </ul>
                </div>

                <DialogFooter className="flex-col sm:justify-between gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="text-blue-200 hover:text-white"
                    >
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleAccept}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enable AI Features"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
