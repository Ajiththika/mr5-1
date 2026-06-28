"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HomePricingSection } from "@/components/home/HomePricingSection";
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
} from "lucide-react";
import { GlobalAcademicSearch } from "@/components/identity/GlobalAcademicSearch";
import LoadingScreen from "@/components/loading/LoadingScreen";
import TeachingAIModal from "@/components/ai/TeachingAIModal";
import { StudentWelcomeChat } from "@/components/chat/StudentWelcomeChat";
import { useVoiceInteraction } from "@/hooks/useVoiceInteraction";
import { getTamilGreeting } from "@/lib/tamil-greetings";
import { motion } from "framer-motion";
import { useCommonTracking } from "@/hooks/useAnalytics";
import { ChatShortcutButton } from "@/components/home/ChatShortcutButton";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
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

      <main id="main-content" className="mr5-page-x flex-1 container mx-auto py-8 pb-20">
        <div className="hero-band mb-8 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="heading-display text-4xl md:text-5xl">
                {t("homepage.title")}
              </h1>
              <p className="mt-2 text-xl font-medium text-foreground/85 md:text-2xl">
                {t("homepage.subtitle")}
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-2 text-sm font-medium text-muted-foreground"
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
            className="relative group w-full md:w-[28rem] perspective-1000 mt-4 md:mt-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700 will-change-transform" />
            <GlobalAcademicSearch
              className="relative"
              placeholder={t("homepage.searchPlaceholder")}
            />
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
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-primary">
                      System Online
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1">
                    <div
                      className={`w-2 h-2 rounded-full ${voiceInteraction.isSpeaking ? "bg-green-500 animate-ping" : "bg-slate-500"}`}
                    />
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      {voiceInteraction.isSpeaking ? "Voice Active" : "Standby"}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="mb-2 text-5xl font-bold leading-tight text-foreground">
                    {greeting?.transliteration ||
                      greeting?.english ||
                      "Vanakkam"}
                  </h2>
                  <p className="mb-4 text-2xl font-semibold text-primary">
                    The Future of Digital Education
                  </p>
                  <p className="max-w-md leading-relaxed text-foreground/80">
                    Step into our live 3D classroom, meet your AI teacher, and
                    learn through immersive lessons built for real students.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button asChild size="lg">
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
                  <Button variant="outline" size="lg" asChild>
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

              <div className="flex-1 relative min-h-[320px] md:min-h-[380px]">
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
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
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
                  className="rounded-sm bg-primary/25 transition-colors hover:bg-primary/50"
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
                  className="group/item flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
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
              <div className="rounded-lg border border-border bg-muted/60 p-3">
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
            <div className="relative mt-2 space-y-6 border-l border-border pl-4">
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

        <HomePricingSection />
      </main>

      <Footer />

      <ChatShortcutButton onClick={openStudentChat} />

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
