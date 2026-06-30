"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { loginSchema } from "@/lib/schemas";
import { Mail, Lock, LogIn, Wand2, Eye, EyeOff } from "lucide-react";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	sanitizeAuthErrorMessage,
	clearSensitiveFormState,
	AUTH_INVALID_MESSAGE,
} from "@/lib/auth-security";

function LoginForm() {
    const { login } = useEnhancedUser();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect");
    const sessionExpired = searchParams.get("expired") === "true";


    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            loginSchema.parse(formData);
            await login(formData.email, formData.password, redirectTo ?? undefined);
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.errors.forEach((e) => {
                    if (e.path[0]) {
                        fieldErrors[e.path[0]] = e.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                setErrors({
                    general: sanitizeAuthErrorMessage(err, AUTH_INVALID_MESSAGE),
                });
            }
        } finally {
            clearSensitiveFormState(setFormData);
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="auth-card overflow-hidden relative"
        >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4 border border-primary/20">
                    <Wand2 className="w-3 h-3" />
                    Student Access
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase italic">Welcome Back</h1>
                <p className="text-muted-foreground text-sm">Enter your credentials to continue learning</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {sessionExpired && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                        Your session expired. Please sign in again.
                    </div>
                )}

                {process.env.NODE_ENV === "development" && (
                    <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-left text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground mb-1">Demo login (dev)</p>
                        <p className="font-mono">student@mr5school.com</p>
                        <p className="font-mono mb-2">Student@123456</p>
                        <button
                            type="button"
                            className="text-primary font-semibold hover:underline"
                            onClick={() =>
                                setFormData({
                                    email: "student@mr5school.com",
                                    password: "Student@123456",
                                })
                            }
                        >
                            Fill demo credentials
                        </button>
                    </div>
                )}

                {errors.general && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                        {errors.general}
                    </motion.div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="student@mr5school.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="pl-10 h-11 bg-muted/50 border-border rounded-xl focus:border-primary/50 transition-all text-foreground"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-destructive text-[10px] uppercase font-bold tracking-tighter ml-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Password</Label>
                            <button
                                type="button"
                                onClick={() => setForgotOpen(true)}
                                className="text-[10px] uppercase font-bold text-primary hover:underline"
                            >
                                Forgot?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                spellCheck={false}
                                className="pl-10 h-11 bg-muted/50 border-border rounded-xl focus:border-primary/50 transition-all text-foreground pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-destructive text-[10px] uppercase font-bold tracking-tighter ml-1">{errors.password}</p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    aria-label="Sign In"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold h-12 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 group"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            Authenticating...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 uppercase tracking-widest italic font-black">
                            Sign In
                            <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    )}
                </Button>

                <GoogleSignInButton />
            </form>

            <div className="mt-8 text-center text-xs text-muted-foreground">
                New to our galaxy?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-bold uppercase tracking-wider ml-1 hover:underline underline-offset-4">
                    Register
                </Link>
            </div>
            <ForgotPasswordModal _open={forgotOpen} onOpenChange={setForgotOpen} />
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <div className="auth-page-shell flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_oklch(var(--primary)/0.08)_0%,_transparent_50%)]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,_oklch(0.55_0.2_300/0.06)_0%,_transparent_50%)]" />

            <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
