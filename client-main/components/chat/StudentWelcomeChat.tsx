"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EDUCATION_LEVELS,
  EducationLevel,
  parseAgeFromSpeech,
  parseEducationLevelFromSpeech,
} from "@/lib/education-levels";
import { studentLearningService } from "@/services/studentLearning.service";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { getTamilGreeting } from "@/lib/tamil-greetings";
import {
  GraduationCap,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

type WelcomeStep = "welcome" | "education" | "age" | "saving";

interface StudentWelcomeChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.volume = 0.95;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function StudentWelcomeChat({
  open,
  onOpenChange,
  onComplete,
}: StudentWelcomeChatProps) {
  const { user, refreshUser } = useEnhancedUser();
  const [step, setStep] = useState<WelcomeStep>("welcome");
  const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(
    null,
  );
  const [ageInput, setAgeInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");
  const recognitionRef = useRef<{ stop: () => void; start: () => void } | null>(
    null,
  );
  const hasSpokenWelcome = useRef(false);

  const firstName = user?.name?.split(" ")[0] || "Student";
  const greeting = getTamilGreeting();

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      const SpeechRecognitionCtor =
        (window as Window & {
          SpeechRecognition?: typeof window.SpeechRecognition;
          webkitSpeechRecognition?: typeof window.SpeechRecognition;
        }).SpeechRecognition ||
        (window as Window & {
          webkitSpeechRecognition?: typeof window.SpeechRecognition;
        }).webkitSpeechRecognition;

      if (!SpeechRecognitionCtor) {
        toast.message("Voice input is not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim() || "";
        setVoiceNote(transcript);
        onResult(transcript);
      };

      recognition.start();
    },
    [],
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    if (!open) {
      hasSpokenWelcome.current = false;
      setStep("welcome");
      setEducationLevel(null);
      setAgeInput("");
      setVoiceNote("");
      window.speechSynthesis?.cancel();
      return;
    }

    if (step === "welcome" && !hasSpokenWelcome.current) {
      hasSpokenWelcome.current = true;
      const script = `${greeting.transliteration || "Vanakkam"}, ${firstName}. Welcome to MR5 School. I am your AI teacher. Before we begin, I would like to know your highest education level so I can teach you in the best way.`;
      speak(script);
    }
  }, [open, step, firstName, greeting.transliteration]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const saveProfile = async (age: number) => {
    if (!educationLevel) return;
    setStep("saving");

    try {
      await studentLearningService.updateLearningProfile({
        age,
        educationLevel,
        welcomeChatCompleted: true,
      });

      await studentLearningService.appendChatMemory({
        role: "assistant",
        content: `${greeting.transliteration || "Vanakkam"}, ${firstName}! Welcome to MR5 School. I will remember your education level (${educationLevel}) and age (${age}) in every lesson.`,
        source: "welcome",
        mode: "voice",
      });

      await studentLearningService.appendChatMemory({
        role: "user",
        content: `My highest education level is ${educationLevel}. I am ${age} years old.`,
        source: "welcome",
        mode: "voice",
      });

      await refreshUser();
      speak(
        `Perfect, ${firstName}. I will remember this and personalize every lesson for you.`,
        () => {
          onOpenChange(false);
          onComplete();
        },
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not save your learning profile. Please try again.");
      setStep("age");
    }
  };

  const handleEducationPick = (level: EducationLevel) => {
    setEducationLevel(level);
    speak(`Great. ${level}. Now please tell me your age.`);
    setStep("age");
  };

  const handleEducationVoice = () => {
    startListening((text) => {
      const parsed = parseEducationLevelFromSpeech(text);
      if (!parsed) {
        toast.message("I could not detect the level. Please tap a button or try again.");
        return;
      }
      handleEducationPick(parsed);
    });
  };

  const handleAgeSubmit = () => {
    const age = Number(ageInput);
    if (!Number.isFinite(age) || age < 5 || age > 120) {
      toast.error("Please enter a valid age between 5 and 120.");
      return;
    }
    saveProfile(age);
  };

  const handleAgeVoice = () => {
    startListening((text) => {
      const parsed = parseAgeFromSpeech(text);
      if (!parsed) {
        toast.message("Please say your age clearly, for example: I am 16.");
        return;
      }
      setAgeInput(String(parsed));
      saveProfile(parsed);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border border-indigo-400/20 bg-slate-950 text-white">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-indigo-300" />
          Welcome to MR5 School
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          First-time student welcome · voice + learning profile
        </DialogDescription>

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-white/10 bg-indigo-500/10 p-4">
                <p className="text-sm leading-relaxed text-indigo-50">
                  Dear {firstName}, {greeting.transliteration}! Your AI teacher is
                  speaking a welcome message now. This happens only once, the
                  first time you join as a student.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Volume2 className="h-4 w-4" />
                Listen, then continue to share your highest qualification.
              </div>
              <Button
                className="w-full bg-indigo-500 hover:bg-indigo-400"
                onClick={() => {
                  speak(
                    "What is your highest education level? You can speak or tap one of the options.",
                  );
                  setStep("education");
                }}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {step === "education" && (
            <motion.div
              key="education"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <p className="text-sm text-slate-300">
                What is your <strong>highest education level</strong>?
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {EDUCATION_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleEducationPick(level)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/15"
                  >
                    {level}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full border-white/15 bg-white/5"
                onClick={listening ? stopListening : handleEducationVoice}
              >
                {listening ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" />
                    Stop listening
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Speak my qualification
                  </>
                )}
              </Button>
              {voiceNote && (
                <p className="text-xs text-slate-400">Heard: “{voiceNote}”</p>
              )}
            </motion.div>
          )}

          {step === "age" && (
            <motion.div
              key="age"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <GraduationCap className="h-4 w-4" />
                Selected: {educationLevel}
              </div>
              <p className="text-sm text-slate-300">How old are you?</p>
              <Input
                type="number"
                min={5}
                max={120}
                value={ageInput}
                onChange={(event) => setAgeInput(event.target.value)}
                placeholder="Enter your age"
                className="border-white/10 bg-white/5 text-white"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500"
                  onClick={handleAgeSubmit}
                >
                  Save & start learning
                </Button>
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5"
                  onClick={listening ? stopListening : handleAgeVoice}
                >
                  {listening ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Say my age
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "saving" && (
            <motion.div
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-8 text-sm text-slate-300"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-300" />
              Saving your learning profile and chat memory…
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
