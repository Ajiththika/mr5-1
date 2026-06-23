"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Lock,
    CreditCard,
    LogIn,
    ChevronRight,
    PlayCircle,
    Sparkles,
    Zap,
    Globe,
    Users,
    Star,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { SchoolCampusSceneProps } from "@/components/3d/school-campus-scene";
import { CAMPUS_ROOMS } from "@/lib/campus-rooms";

const ClassroomMiniPreview = dynamic(
    () =>
        import("@/components/3d/ClassroomMiniPreview").then(
            (mod) => mod.ClassroomMiniPreview,
        ),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ),
    },
);

export default function CoursePage() {
    const { user, loading: authLoading } = useEnhancedUser();
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;

    const [hasAccess, setHasAccess] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [courseData, setCourseData] = useState<any>(null);
    const [courseError, setCourseError] = useState(false);
    const [previewMode, setPreviewMode] = useState<"classroom" | "campus">("classroom");
    const [SchoolScene, setSchoolScene] = useState<ComponentType<SchoolCampusSceneProps> | null>(null);

    useEffect(() => {
        import("@/components/3d/school-campus-scene").then((mod) => {
            setSchoolScene(() => mod.SchoolCampusScene);
        });
    }, []);

    // Fetch Course Data & Verify Access
    useEffect(() => {
        const init = async () => {
            if (authLoading) return;

            try {
                // 1. Fetch Course Info (Public)
                try {
                    const cRes = await apiClient.get(`/api/courses/${courseId}`);
                    setCourseData(cRes.data.data);
                    setCourseError(false);
                } catch (error) {
                    console.error('Course loading error:', error);
                    setCourseError(true);
                }

                // 2. If User is Logged In, Check Access
                if (user) {
                    if (courseId === '123' || user.role === 'admin') {
                        setHasAccess(true);
                    } else {
                        try {
                            const accessRes = await apiClient.get(`/api/enrollments/check/${courseId}`);
                            if (accessRes.data.access) {
                                setHasAccess(true);
                            }
                        } catch (error) {
                            console.error('Enrollment check error:', error);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setVerifying(false);
            }
        };

        init();
    }, [user, authLoading, courseId]);

    const handleEnroll = async () => {
        if (!user) return router.push("/login?redirect=/course/" + courseId);

        // In a real scenario, this would trigger the actual payment flow
        // For the demo, we show the intent or redirect to the payment system
        try {
            const res = await apiClient.post('/api/payments/create-checkout-session', { courseId });
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (error) {
            console.error("Enrollment failed", error);
            toast.error("Payment could not be started. Please try again.");
        }
    };

    if (authLoading || verifying) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                </div>
        </div>
    );
    }

    if (courseError || !courseData) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-4">
                    <h1 className="text-2xl font-bold">Course not found</h1>
                    <p className="text-muted-foreground">This course could not be loaded. It may have been removed or the link is invalid.</p>
                    <Button asChild>
                        <Link href="/courses">Browse courses</Link>
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <Navbar />

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-12 md:py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* LEFT: Information Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-2 items-center">
                                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] py-1 px-3">
                                    {courseData?.category || "Academy"}
                                </Badge>
                                <Badge variant="outline" className="border-border text-foreground/50 uppercase tracking-widest text-[10px] py-1 px-3">
                                    {courseData?.level || "All Levels"}
                                </Badge>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight italic text-foreground text-glow">
                                {courseData?.title}
                            </h1>

                            <p className="text-xl text-muted-foreground leading-relaxed font-light max-w-xl">
                                {courseData?.description}
                            </p>
                        </div>

                        {/* Interactive Stats */}
                        <div className="grid grid-cols-3 gap-6 py-8 border-y border-border">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Duration</p>
                                <p className="text-lg font-bold text-foreground uppercase italic">{courseData?.duration || "Lifetime"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Students</p>
                                <p className="text-lg font-bold text-foreground uppercase italic">1.2K+</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rating</p>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <p className="text-lg font-bold text-foreground">4.9</p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Elite Syllabus Benefits</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { icon: Sparkles, text: "AI-Driven Feedback" },
                                    { icon: Globe, text: "Virtual 3D Campus" },
                                    { icon: Zap, text: "Hands-on Projects" },
                                    { icon: ShieldCheck, text: "Industry Certification" }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border group hover:bg-muted transition-colors">
                                        <feature.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium text-muted-foreground">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Visual and Conversion Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:sticky lg:top-32"
                    >
                        <div className="relative group">
                            {/* Visual Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />

                            <div className="relative bg-background/80 backdrop-blur-3xl border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">

                                {/* 3D Cinematic Preview — always visible */}
                                <div className="preview-3d-root relative min-h-[280px] h-[min(70vw,360px)] w-full bg-slate-950 sm:min-h-[360px] sm:h-[min(52vw,440px)]">
                                    {previewMode === "classroom" ? (
                                        <ClassroomMiniPreview className="h-full w-full" />
                                    ) : SchoolScene ? (
                                        <SchoolScene
                                            courseId={courseId}
                                            variant="preview"
                                            className="h-full rounded-none border-0 shadow-none"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-black/80">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    )}

                                    <div className="preview-3d-ui preview-3d-ui--interactive absolute left-3 top-3 flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewMode("classroom")}
                                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md transition-colors ${
                                                previewMode === "classroom"
                                                    ? "border-indigo-400/50 bg-indigo-600/80 text-foreground"
                                                    : "border-white/15 bg-black/45 text-foreground/70 hover:bg-black/60"
                                            }`}
                                        >
                                            Classroom
                                        </button>
                                        {hasAccess && (
                                            <button
                                                type="button"
                                                onClick={() => setPreviewMode("campus")}
                                                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md transition-colors ${
                                                    previewMode === "campus"
                                                        ? "border-sky-400/50 bg-sky-600/80 text-foreground"
                                                        : "border-white/15 bg-black/45 text-foreground/70 hover:bg-black/60"
                                                }`}
                                            >
                                                Campus
                                            </button>
                                        )}
                                    </div>

                                    {!user || !hasAccess ? (
                                        <div className="preview-3d-ui preview-3d-ui--interactive absolute right-3 top-3 flex items-center gap-2 rounded-full border border-amber-400/30 bg-black/55 px-3 py-1.5 backdrop-blur-md">
                                            <Lock className="h-3.5 w-3.5 text-amber-300" />
                                            <span className="text-[10px] font-semibold text-amber-100">
                                                Enroll to enter rooms
                                            </span>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Conversion Area */}
                                <div className="p-5 space-y-6 sm:p-8 lg:p-10 lg:space-y-8">
                                    {!user ? (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black uppercase italic italic">Initialize Membership</h3>
                                                <p className="text-muted-foreground text-sm">Sign in to sync your progress and unlock the full experience.</p>
                                            </div>
                                            <Button
                                                asChild
                                                className="w-full h-16 bg-primary hover:bg-primary/90 text-foreground font-black uppercase tracking-[0.2em] italic text-lg"
                                            >
                                                <Link href={`/login?redirect=/course/${courseId}`}>
                                                    <LogIn className="mr-3 w-5 h-5" /> Login to Enroll
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : !hasAccess ? (
                                        <div className="space-y-8">
                                            <div className="flex items-end justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Global Access Fee</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-5xl font-black text-foreground italic tracking-tighter">${courseData?.price || "99.00"}</span>
                                                        <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">USD</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 mb-2">Lifetime Membership</Badge>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleEnroll}
                                                className="w-full h-20 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-foreground font-black uppercase tracking-[0.2em] italic text-xl shadow-[0_0_40px_rgba(120,110,255,0.4)] group"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-3">
                                                        <CreditCard className="w-6 h-6" />
                                                        Deploy Enrollment
                                                    </div>
                                                    <span className="text-[9px] font-mono tracking-[0.5em] mt-1 opacity-50 group-hover:opacity-100 transition-opacity">SECURE STRIPE CHECKOUT</span>
                                                </div>
                                            </Button>

                                            <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                                Secure Payment Gateway // SSL Encrypted // Verified
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">MEMBERSHIP: ACTIVE</Badge>
                                                <h3 className="text-3xl font-black uppercase italic">Welcome Back, Cadet</h3>
                                                <p className="text-muted-foreground text-sm">Your learning modules are primed and ready for interaction.</p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <Button
                                                    asChild
                                                    className="w-full h-16 bg-primary hover:bg-primary/90 text-foreground font-black uppercase tracking-[0.2em] italic text-lg"
                                                >
                                                    <Link href={`/course/${courseId}/lesson/start`}>
                                                        <PlayCircle className="mr-3 w-6 h-6" /> Enter Classroom
                                                    </Link>
                                                </Button>

                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                                    {CAMPUS_ROOMS.map((room) => {
                                                        const Icon = room.icon;
                                                        return (
                                                        <Button
                                                            key={room.id}
                                                            variant="outline"
                                                            className="border-border hover:bg-muted/50 h-12 justify-start gap-2 px-4 text-xs font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-widest"
                                                            asChild
                                                        >
                                                            <Link href={`/course/${courseId}/room/${room.path}`}>
                                                                <Icon className="h-4 w-4 shrink-0 text-primary" />
                                                                <span className="truncate">{room.label}</span>
                                                                <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-primary" />
                                                            </Link>
                                                        </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Call to Action Footer (for visitor) */}
            {!hasAccess && (
                <div className="border-t border-border bg-black/40 backdrop-blur-xl py-12">
                    <div className="container mx-auto px-4 text-center space-y-6">
                        <h2 className="text-3xl font-bold italic uppercase tracking-widest">Not Convinced?</h2>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Join over 12,000 students already building the future of AI. Our curriculum is constantly updated with the latest breakthroughs.
                        </p>
                        <div className="flex items-center justify-center gap-12 pt-4 opacity-50">
                            <Users className="w-12 h-12" />
                            <Globe className="w-12 h-12" />
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}