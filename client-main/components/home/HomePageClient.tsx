"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import {
  Sparkles,
  BookOpen,
  Users,
  Zap,
  Brain,
  Calendar,
  Search,
} from "lucide-react";
import LoadingScreen from "@/components/loading/LoadingScreen";
import TeachingAIModal from "@/components/ai/TeachingAIModal";
import { StudentWelcomeChat } from "@/components/chat/StudentWelcomeChat";
import { useVoiceInteraction } from "@/hooks/useVoiceInteraction";
import { getTamilGreeting } from "@/lib/tamil-greetings";
import { useCommonTracking } from "@/hooks/useAnalytics";
import { motion } from "framer-motion";

const WelcomeAvatar = nextDynamic(
  () =>
    import("@/components/3d/WelcomeAvatar").then((m) => ({
      default: m.WelcomeAvatar,
    })),
  { ssr: false },
);

const IntroVideo = nextDynamic(
  () =>
    import("@/components/intro/IntroVideo").then((m) => ({
      default: m.IntroVideo,
    })),
  { ssr: false },
);

export default function HomePageClient() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("hasSeenGlobalLoading");
    }
    return true;
  });
  const [showIntro, setShowIntro] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isWelcomeChatOpen, setIsWelcomeChatOpen] = useState(false);
  const [greeting, setGreeting] = useState<ReturnType<
    typeof getTamilGreeting
  > | null>(null);

  const { user } = useEnhancedUser();
  const voiceInteraction = useVoiceInteraction("gemini");
  const { trackNavigation } = useCommonTracking();

  const needsStudentWelcome =
    user?.role === "student" && user?.welcomeChatCompleted !== true;

  const openStudentChat = () => {
    if (needsStudentWelcome) {
      setIsWelcomeChatOpen(true);
      return;
    }
    setIsAIModalOpen(true);
  };

  useEffect(() => {
    if (!mounted || loading || showIntro || !needsStudentWelcome) return;
    const timer = window.setTimeout(() => setIsWelcomeChatOpen(true), 1400);
    return () => window.clearTimeout(timer);
  }, [mounted, loading, showIntro, needsStudentWelcome]);

  useEffect(() => {
    setMounted(true);

    const hasSeenIntro = localStorage.getItem("hasSeenIntro_v1");
    if (!hasSeenIntro) {
      setShowIntro(true);
    }

    setGreeting(getTamilGreeting());
    const interval = setInterval(() => setGreeting(getTamilGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  if (showIntro) {
    return (
      <IntroVideo
        onComplete={() => {
          setShowIntro(false);
          setLoading(false);
          sessionStorage.setItem("hasSeenGlobalLoading", "true");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {loading && (
        <LoadingScreen
          onComplete={() => {
            setLoading(false);
            sessionStorage.setItem("hasSeenGlobalLoading", "true");
          }}
        />
      )}
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50 tracking-tight">
                3D Virtual Classroom
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light mt-1">
                Learn with AI Teachers
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-muted-foreground text-sm mt-2 font-medium"
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative group w-full md:w-96 perspective-1000 mt-4 md:mt-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700 will-change-transform" />
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground/70 shadow-2xl backdrop-blur-md transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-white/20">
              <Search className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search courses, lessons, topics..."
                aria-label="Search courses"
                className="bg-transparent border-none outline-none flex-1 placeholder:text-muted-foreground/50 text-foreground w-full"
              />
              <span className="ml-auto text-[10px] font-bold bg-black/20 border border-white/5 px-2 py-1 rounded text-muted-foreground/70 tracking-widest hidden md:inline-block">
                ⌘K
              </span>
            </div>
          </motion.div>
        </div>

        <BentoGrid>
          <BentoItem
            colSpan={8}
            rowSpan={2}
            className="relative overflow-hidden min-h-[400px]"
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row h-full">
              <div className="flex-1 p-5 md:p-8 flex flex-col justify-center space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-medium text-primary-foreground">
                      System Online
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/10">
                    <div
                      className={`w-2 h-2 rounded-full ${voiceInteraction.isSpeaking ? "bg-green-500 animate-ping" : "bg-slate-500"}`}
                    />
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      {voiceInteraction.isSpeaking ? "Voice Active" : "Standby"}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-5xl font-bold leading-tight mb-2">
                    {greeting?.transliteration ||
                      greeting?.english ||
                      "Vanakkam"}
                  </h2>
                  <p className="text-2xl text-muted-foreground font-light mb-4 text-glow">
                    The Future of Digital Education
                  </p>
                  <p className="text-foreground/80 max-w-md leading-relaxed">
                    Step into our live 3D classroom, meet your AI teacher, and
                    learn through immersive lessons built for real students.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/90 text-white rounded-lg shadow-[0_0_20px_rgba(120,110,255,0.3)] border border-white/10"
                  >
                    <Link
                      href={user ? "/dashboard" : "/register"}
                      onClick={() =>
                        trackNavigation(
                          "Homepage",
                          user ? "/dashboard" : "/register",
                        )
                      }
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {user ? "Go to Dashboard" : "Get Started"}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                    asChild
                  >
                    <Link
                      href={user ? "/courses" : "/login"}
                      onClick={() =>
                        trackNavigation(
                          "Homepage",
                          user ? "/courses" : "/login",
                        )
                      }
                    >
                      {user ? "Browse Courses" : "Sign In"}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex-1 relative min-h-[320px] md:min-h-auto">
                <WelcomeAvatar
                  showGreetingText={false}
                  enableVoice={!needsStudentWelcome}
                  className="w-full h-full absolute inset-0"
                  onAvatarClick={openStudentChat}
                />
              </div>
            </div>
          </BentoItem>

          <BentoItem
            colSpan={4}
            title="Study Streak"
            subtitle="Constructive flow state maintained."
            icon={<Zap className="w-5 h-5" />}
          >
            <div className="mt-4 flex items-end gap-2">
              <span className="text-6xl font-bold text-foreground">12</span>
              <span className="text-xl text-muted-foreground mb-2">days</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-purple-500 w-[65%]" />
            </div>
          </BentoItem>

          <BentoItem
            colSpan={4}
            title="Knowledge Graph"
            subtitle="72 concepts mastered this week."
            icon={<Brain className="w-5 h-5" />}
          >
            <div className="mt-4 grid grid-cols-5 gap-1 h-16 items-end">
              {[40, 70, 45, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className="bg-white/10 hover:bg-primary/50 transition-colors rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </BentoItem>

          <BentoItem
            colSpan={4}
            title="Recent Courses"
            icon={<BookOpen className="w-5 h-5" />}
          >
            <div className="space-y-3 mt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer group/item"
                >
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center">
                    <span className="text-xs font-mono text-muted-foreground">
                      0{i}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground group-hover/item:text-primary transition-colors">
                      Advanced React Patterns
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Module {i} • 15m remaining
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </BentoItem>

          <BentoItem
            colSpan={4}
            title="Community"
            icon={<Users className="w-5 h-5" />}
          >
            <div className="space-y-4 text-sm mt-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Learners</span>
                <span className="font-mono text-foreground">1,248</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Global Rank</span>
                <span className="font-mono text-green-400">#42</span>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-muted-foreground">
                  &quot;The AI tutor helped me solve the recursion problem in
                  minutes!&quot;
                </p>
                <p className="text-xs text-foreground mt-2 font-medium">
                  - Sarah J.
                </p>
              </div>
            </div>
          </BentoItem>

          <BentoItem
            colSpan={4}
            title="Upcoming"
            icon={<Calendar className="w-5 h-5" />}
          >
            <div className="relative pl-4 border-l border-white/10 space-y-6 mt-2">
              {[
                { time: "10:00 AM", event: "Live Session: Next.js 14" },
                { time: "02:00 PM", event: "Code Review with AI" },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-surface border border-primary/50 ring-4 ring-background" />
                  <p className="text-xs text-primary font-mono">{item.time}</p>
                  <p className="text-sm text-foreground">{item.event}</p>
                </div>
              ))}
            </div>
          </BentoItem>
        </BentoGrid>
      </main>

      <StudentWelcomeChat
        open={isWelcomeChatOpen}
        onOpenChange={setIsWelcomeChatOpen}
        onComplete={() => setIsAIModalOpen(true)}
      />

      <TeachingAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        voiceInteraction={voiceInteraction}
      />
    </div>
  );
}
