"use client";

import { MessageCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAudio } from "@/hooks/useAudio";

interface ChatShortcutButtonProps {
  onClick: () => void;
}

export function ChatShortcutButton({ onClick }: ChatShortcutButtonProps) {
  const { t } = useTranslation();
  const { playChatOpen } = useAudio();

  return (
    <button
      type="button"
      onClick={() => {
        playChatOpen();
        onClick();
      }}
      data-tour-id="tour-ai-chat"
      aria-label={t("homepage.chatAria")}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-sky-400/30 bg-gradient-to-r from-sky-600/90 to-indigo-600/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(14,165,233,0.35)] backdrop-blur-md transition-transform hover:scale-[1.03] active:scale-95 sm:px-5"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">{t("homepage.chatShortcut")}</span>
    </button>
  );
}
