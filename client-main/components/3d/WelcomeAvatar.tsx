"use client";

import { useState, useEffect, useCallback, useRef, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  getTamilGreeting,
  type TamilGreeting,
  type AvatarGestureState,
} from "@/lib/tamil-greetings";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import {
  Volume2,
  VolumeX,
  MessageCircle,
  Sparkles,
  School,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationData } from "@/services/location.service";

const ClassroomMiniPreview = dynamic(
  () =>
    import("@/components/3d/ClassroomMiniPreview").then(
      (mod) => mod.ClassroomMiniPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-950/40">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-300" />
      </div>
    ),
  },
);

interface WelcomeAvatarProps {
  sceneUrl?: string;
  showGreetingText?: boolean;
  enableVoice?: boolean;
  className?: string;
  onAvatarClick?: () => void;
  compact?: boolean;
  location?: LocationData;
}

export function WelcomeAvatar({
  showGreetingText = true,
  enableVoice = false,
  className = "",
  onAvatarClick,
  compact = false,
  location,
}: WelcomeAvatarProps) {
  const { user } = useEnhancedUser();
  const [greeting, setGreeting] = useState<TamilGreeting | null>(null);
  const [, setGestureState] = useState<AvatarGestureState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [letterOpen, setLetterOpen] = useState(true);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const currentGreeting = getTamilGreeting(new Date(), location || false);
    setGreeting(currentGreeting);

    const interval = setInterval(() => {
      setGreeting(getTamilGreeting(new Date(), location || false));
    }, 60000);

    return () => clearInterval(interval);
  }, [location]);

  const speakGreeting = useCallback(() => {
    if (!enableVoice || isMuted || typeof window === "undefined") return;

    window.speechSynthesis?.cancel();

    const greetingText = `${greeting?.transliteration || "Vanakkam"}! Welcome to MR5 School. Step into our 3D classroom and chat with your AI teacher anytime.`;
    const utterance = new SpeechSynthesisUtterance(greetingText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    const voices = window.speechSynthesis?.getVoices() || [];
    const femaleVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("victoria"),
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => setGestureState("speaking");
    utterance.onend = () => setGestureState("idle");
    utterance.onerror = () => setGestureState("idle");

    speechSynthRef.current = utterance;
    window.speechSynthesis?.speak(utterance);
  }, [isMuted, enableVoice, greeting]);

  useEffect(() => {
    if (!hasGreeted && greeting && enableVoice) {
      setGestureState("greeting_start");
      setTimeout(() => setGestureState("greeting_hold"), 500);
      setTimeout(() => {
        setGestureState("speaking");
        speakGreeting();
        setHasGreeted(true);
      }, 1000);
    }
  }, [hasGreeted, greeting, speakGreeting, enableVoice]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const openChat = useCallback(
    (event?: MouseEvent) => {
      event?.stopPropagation();
      setLetterOpen(false);
      onAvatarClick?.();
    },
    [onAvatarClick],
  );

  const toggleMute = (event: MouseEvent) => {
    event.stopPropagation();
    if (!enableVoice) return;
    if (!isMuted) window.speechSynthesis?.cancel();
    setIsMuted(!isMuted);
  };

  const handleReplayGreeting = (event: MouseEvent) => {
    event.stopPropagation();
    if (!enableVoice) return;
    setGestureState("greeting_start");
    setTimeout(() => setGestureState("greeting_hold"), 500);
    setTimeout(() => {
      setGestureState("speaking");
      speakGreeting();
    }, 1000);
  };

  if (!greeting) return null;

  const firstName = user?.name?.split(" ")[0];

  return (
    <div
      className={`group relative ${compact ? "h-[300px]" : "h-[500px]"} ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-b from-slate-900/80 to-slate-950 shadow-2xl">
        <ClassroomMiniPreview className="absolute inset-0" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(99,102,241,0.12),transparent_50%)]" />

        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-md">
          <School className="h-3.5 w-3.5 text-indigo-300" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-100">
            3D Classroom Preview
          </span>
        </div>

        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {enableVoice && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="h-9 w-9 border border-white/10 bg-black/45 backdrop-blur-md hover:bg-black/65"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleReplayGreeting}
                className="h-9 w-9 border border-white/10 bg-black/45 backdrop-blur-md hover:bg-black/65"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={openChat}
            className="h-9 gap-2 border border-indigo-300/40 bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-400"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-3.5 w-3.5" />
            </span>
            Chat with Teacher
          </Button>
        </div>

        <AnimatePresence>
          {letterOpen && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              onClick={openChat}
              className="absolute bottom-4 left-4 z-20 max-w-[min(100%,280px)] text-left"
            >
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-slate-950/80 shadow-2xl backdrop-blur-xl transition-transform hover:scale-[1.01]">
                <div className="border-b border-white/8 bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-transparent px-4 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20">
                        <MessageCircle className="h-4 w-4 text-indigo-200" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-200">
                          Letter from your AI Teacher
                        </p>
                        <p className="text-xs text-slate-400">
                          Friendly classroom chat · always here for you
                        </p>
                      </div>
                    </div>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                  </div>
                </div>

                <div className="space-y-3 px-4 py-4">
                  <p className="font-serif text-lg leading-relaxed text-white">
                    Dear {firstName || "Learner"},
                  </p>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {greeting.transliteration}! Your virtual classroom is ready.
                    Walk inside, explore the whiteboard, and ask me anything —
                    lessons, homework, or a quick study break plan.
                  </p>
                  <p className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs italic leading-relaxed text-slate-400">
                    &quot;Tap this letter to open chat. I&apos;m your MR5 AI
                    Teacher — patient, clear, and always on your side.&quot;
                  </p>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-slate-500">
                      — MR5 School AI Faculty
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white">
                      Open Chat
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {!letterOpen && (
          <button
            type="button"
            onClick={openChat}
            className="absolute bottom-4 left-4 z-20 max-w-[min(100%,280px)] rounded-2xl border border-indigo-400/25 bg-indigo-500/20 px-4 py-3 text-left backdrop-blur-md transition-colors hover:bg-indigo-500/30"
          >
            <p className="text-sm font-semibold text-white">
              Continue chatting with your AI Teacher
            </p>
            <p className="text-xs text-indigo-100/80">
              Tap to reopen the friendly classroom chat
            </p>
          </button>
        )}

        {showGreetingText && (
          <div className="pointer-events-none absolute left-4 top-16 z-10 max-w-[220px] rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
            <p className="text-sm font-bold text-primary">{greeting.primary}</p>
            <p className="text-xs text-slate-300">{greeting.english}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeAvatar;
