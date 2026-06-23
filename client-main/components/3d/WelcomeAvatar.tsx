"use client";

import { useState, useEffect, useCallback, useRef, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import {
  getTamilGreeting,
  type TamilGreeting,
  type AvatarGestureState,
} from "@/lib/tamil-greetings";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { Volume2, VolumeX, MessageCircle, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationData } from "@/services/location.service";
import { useTranslation } from "@/hooks/useTranslation";
import {
  markVoiceGreetingPlayed,
  shouldPlayVoiceGreeting,
} from "@/lib/greeting-schedule";

const ClassroomMiniPreview = dynamic(
  () =>
    import("@/components/3d/ClassroomMiniPreview").then(
      (mod) => mod.ClassroomMiniPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-3xl border border-border/40 bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
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
  const { t } = useTranslation();
  const [greeting, setGreeting] = useState<TamilGreeting | null>(() =>
    typeof window !== "undefined" ? getTamilGreeting(new Date(), location || false) : null,
  );
  const [, setGestureState] = useState<AvatarGestureState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
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
    if (!shouldPlayVoiceGreeting()) return;
    markVoiceGreetingPlayed();
    window.speechSynthesis?.cancel();
    const greetingText = `${greeting?.transliteration || "Vanakkam"}! Welcome to MR5 School.`;
    const utterance = new SpeechSynthesisUtterance(greetingText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    utterance.onstart = () => setGestureState("speaking");
    utterance.onend = () => setGestureState("idle");
    utterance.onerror = () => setGestureState("idle");
    speechSynthRef.current = utterance;
    window.speechSynthesis?.speak(utterance);
  }, [isMuted, enableVoice, greeting]);

  useEffect(() => {
    if (!hasGreeted && greeting && enableVoice && shouldPlayVoiceGreeting()) {
      setGestureState("greeting_start");
      setTimeout(() => {
        setGestureState("speaking");
        speakGreeting();
        setHasGreeted(true);
      }, 800);
    }
  }, [hasGreeted, greeting, speakGreeting, enableVoice]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const openChat = useCallback(
    (event?: MouseEvent) => {
      event?.stopPropagation();
      onAvatarClick?.();
    },
    [onAvatarClick],
  );

  const shellClass = `preview-3d-shell group relative overflow-hidden rounded-3xl border border-border/50 shadow-[0_8px_32px_oklch(var(--shadow-color)/0.12)] ${
    compact ? "min-h-[280px]" : "min-h-[320px]"
  } h-full ${className}`;

  if (!greeting) {
    return (
      <div className={shellClass}>
        <ClassroomMiniPreview className="absolute inset-0 h-full w-full" showChrome={false} />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className={shellClass}>
      <ClassroomMiniPreview className="absolute inset-0 h-full w-full" showChrome={false} />
      <div className="preview-cinematic-vignette pointer-events-none" aria-hidden />

      <div className="preview-3d-ui preview-3d-ui--interactive left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
        <School className="h-3.5 w-3.5 text-indigo-300" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-100">
          {t("homepage.title")}
        </span>
      </div>

      {showGreetingText && (
        <div className="preview-3d-ui left-3 top-12 max-w-[200px] rounded-xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
          <p className="text-sm font-bold text-primary">{greeting.primary}</p>
          <p className="text-xs text-slate-300">{greeting.english}</p>
        </div>
      )}

      <div className="preview-3d-ui preview-3d-ui--interactive inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-white/10 bg-slate-950/70 p-3 backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {firstName ? `Hi ${firstName}` : "Welcome"}
          </p>
          <p className="truncate text-[11px] text-slate-400">{t("homepage.subtitle")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {enableVoice && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                if (!isMuted) window.speechSynthesis?.cancel();
                setIsMuted(!isMuted);
              }}
              className="h-9 w-9 border border-white/10 bg-black/40"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
          <Button
            size="sm"
            onClick={openChat}
            className="h-9 gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 px-3 text-xs font-semibold text-white hover:from-indigo-400 hover:to-violet-400"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t("homepage.chatShortcut")}</span>
            <span className="sm:hidden">Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeAvatar;
