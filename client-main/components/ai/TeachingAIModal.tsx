'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MicOff,
    X,
    Sparkles,
    Send,
    Bot,
    User,
    Image as ImageIcon,
    Heart,
    Volume2,
    VolumeX,
    Loader2,
    ArrowDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MoodDetector } from '@/components/classroom/MoodDetector';
import Image from 'next/image';
import { MR5_LOGO_PATH } from '@/lib/brand/logo';
import { toast } from 'sonner';
import { useEnhancedUser } from '@/contexts/EnhancedUserContext';
import { studentLearningService } from '@/services/studentLearning.service';
import { buildStudentAiSystemPrompt, type ClassroomAiContext } from '@/lib/build-student-ai-prompt';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
    role: 'user' | 'ai';
    content: string;
    type?: 'text' | 'image';
}

interface TeachingAIModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId?: string;
    lessonId?: string;
    courseTitle?: string;
    lessonTitle?: string;
    classroomContext?: ClassroomAiContext;
    voiceInteraction?: {
        transcript: string;
        listening: boolean;
        startListening: () => void;
        stopListening: () => void;
        response: string;
        isSpeaking: boolean;
        isProcessing: boolean;
        browserSupportsSpeechRecognition: boolean;
    };
}

export function TeachingAIModal({ isOpen, onClose, courseId, lessonId, courseTitle, lessonTitle, classroomContext, voiceInteraction }: TeachingAIModalProps) {
    const { user } = useEnhancedUser();
    const { locale } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [emotionalState, setEmotionalState] = useState({
        engagement: 'High',
        confidence: 'Medium',
        curiosity: 'Strong'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const isNearBottom = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [latency, setLatency] = useState(24);
    const [showSessionHud, setShowSessionHud] = useState(false);
    const sessionId = useRef(Math.random().toString(36).substr(2, 6).toUpperCase());

    // Simulate live latency updates
    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(Math.floor(Math.random() * (45 - 15) + 15));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setShowSessionHud(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (user?.role !== 'student') {
            if (messages.length === 0) {
                setMessages([
                    {
                        role: 'ai',
                        content:
                            'Vanakkam! I am your MR5 AI Teacher. Ask me about lessons, the whiteboard, study breaks, or anything you are learning today.',
                    },
                ]);
            }
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const response = await studentLearningService.getAiContext();
                if (cancelled) return;

                const profile = response.data.profile;
                const history = response.data.recentMessages
                    .filter((entry) => entry.role === 'user' || entry.role === 'assistant')
                    .map((entry) => ({
                        role: entry.role === 'user' ? 'user' as const : 'ai' as const,
                        content: entry.content,
                    }));

                if (history.length > 0) {
                    setMessages(history);
                } else {
                    const welcomeName = profile?.name?.split(' ')[0] || 'Learner';
                    const levelLine = profile?.educationLevel
                        ? ` I already know you are studying at **${profile.educationLevel}** level.`
                        : '';
                    const ageLine = profile?.age ? ` I remember you are **${profile.age}** years old.` : '';

                    setMessages([
                        {
                            role: 'ai',
                            content: `Vanakkam, ${welcomeName}! I am your MR5 AI Teacher.${levelLine}${ageLine} Ask me anything about lessons, your 3D classroom, or study breaks — I will teach you in a way that fits you.`,
                        },
                    ]);
                }
            } catch (error) {
                console.error('Failed to load student chat memory', error);
                setMessages([
                    {
                        role: 'ai',
                        content:
                            'Vanakkam! I am your MR5 AI Teacher. I am here to help you learn in a friendly, personal way.',
                    },
                ]);
            }
        })();

        return () => {
            cancelled = true;
        };
        // Only reload memory when modal opens for a student session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, user?.role, user?.id]);

    const {
        transcript = '',
        listening = false,
        startListening = () => { },
        stopListening = () => { },
        response = '',
        isSpeaking = false,
        isProcessing = false,
        browserSupportsSpeechRecognition = false,
    } = voiceInteraction || {};

    useEffect(() => {
        if (!isOpen) stopListening();
    }, [isOpen, stopListening]);

    useEffect(() => {
        if (listening && response && !isProcessing && !isSpeaking) {
            stopListening();
        }
    }, [listening, response, isProcessing, isSpeaking, stopListening]);

    // Auto-scroll to bottom
    // Scroll tracking
    const scrollToBottom = () => {
        if (viewportRef.current) {
            viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        const isBottom = distanceToBottom < 100;

        isNearBottom.current = isBottom;
        setShowScrollButton(!isBottom);
    };

    // Auto-scroll to bottom only if user was already near bottom
    useEffect(() => {
        if (isNearBottom.current) {
            scrollToBottom();
        }
    }, [messages, transcript, isProcessing]);

    // Update messages when AI responds
    useEffect(() => {
        if (response) {
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        }
    }, [response]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Send message to Gemini API
    const persistChatExchange = async (
        userContent: string,
        aiContent: string,
        mode: 'text' | 'voice' = 'text',
    ) => {
        if (user?.role !== 'student') return;

        try {
            await studentLearningService.appendChatMemory({
                role: 'user',
                content: userContent,
                source: lessonId ? 'lesson' : 'homepage',
                mode,
                course: courseId,
            });
            await studentLearningService.appendChatMemory({
                role: 'assistant',
                content: aiContent,
                source: lessonId ? 'lesson' : 'homepage',
                mode,
                course: courseId,
            });
        } catch (error) {
            console.error('Failed to persist chat memory', error);
        }
    };

    const sendToGeminiAPI = async (messageContent: string, imageData?: string) => {
        try {
            setIsSending(true);

            // Create abort controller for cancellation
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            // Prepare the message content
            let content: string | { text: string; images?: string[] } = messageContent;
            if (imageData) {
                content = {
                    text: messageContent,
                    images: [imageData]
                };
            }

            // Prepare messages array for the API
            const contextParts = buildStudentAiSystemPrompt({
                user,
                recentMessages: messages.map((msg) => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                })),
                courseTitle,
                lessonTitle,
                courseId,
                lessonId,
                classroom: classroomContext,
                locale,
            });

            const apiMessages = [
                {
                    role: "system",
                    content: contextParts,
                },
                ...messages.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                {
                    role: "user",
                    content
                }
            ];

            // Call Gemini API through backend
            const response = await fetch("/api/ai/gemini", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    multimodal: !!imageData,
                    options: {
                        temperature: 0.7,
                        max_tokens: 1000
                    }
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed with status ${response.status}: ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();

            // Add AI response to messages
            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
            await persistChatExchange(messageContent, data.response, imageData ? 'text' : 'text');

            // Simulate emotional analysis (in a real implementation, this would call the analyzeEmotions API)
            const emotions = ['High', 'Medium', 'Strong'];
            setEmotionalState({
                engagement: emotions[Math.floor(Math.random() * emotions.length)],
                confidence: emotions[Math.floor(Math.random() * emotions.length)],
                curiosity: emotions[Math.floor(Math.random() * emotions.length)]
            });

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Request was cancelled');
                return;
            }

            console.error("Gemini API Error:", error);
            toast.error("AI Tutor Error", {
                description: error.message || "Failed to get response from AI tutor. Please try again."
            });

            // Add error message to chat
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "Sorry, I encountered an error processing your request. Please try again."
            }]);
        } finally {
            setIsSending(false);
        }
    };

    const handleSendMessage = async (text?: string) => {
        const messageToSend = text || inputMessage;
        if (!messageToSend.trim() && !imagePreview) return;

        // Add user message to chat
        const newUserMessage: Message = {
            role: 'user',
            content: messageToSend,
            type: imagePreview ? 'image' : 'text'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputMessage('');

        // Send to Gemini API
        await sendToGeminiAPI(messageToSend, imagePreview || undefined);
        setImagePreview(null);
    };

    // Handle image upload
    const handleImageUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error("Invalid file type", {
                description: "Please upload an image file (JPEG, PNG, etc.)"
            });
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large", {
                description: "Please upload an image smaller than 5MB"
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Handle drag and drop events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Toggle mute
    const toggleMute = () => {
        setIsMuted(!isMuted);
        // In a real implementation, this would integrate with the TTS service
    };

    // Cancel current request
    const cancelRequest = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsSending(false);
            toast.info("Request cancelled");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <DialogContent
                        showCloseButton={false}
                        className={cn(
                            "flex flex-col gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none duration-200",
                            // xs–watch: full-screen sheet (overrides default dialog centering)
                            "fixed inset-0 top-0 left-0 z-50 h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none",
                            // sm (480px+): floating centered panel
                            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(92dvh,900px)] sm:max-h-[900px] sm:w-[min(calc(100vw-1.25rem),680px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
                            // md (768px+): tablet width
                            "md:w-[min(calc(100vw-2rem),880px)]",
                            // lg (1024px+): desktop with sidebar
                            "lg:w-[min(calc(100vw-2.5rem),1200px)] lg:rounded-3xl",
                            // xl (1440px+): large monitors
                            "xl:w-[min(calc(100vw-3rem),1280px)]",
                            // 2xl (1920px+): ultrawide cap
                            "2xl:w-[min(calc(100vw-4rem),1400px)]",
                        )}
                    >
                        <DialogDescription className="sr-only">
                            Interactive AI Tutor session where you can ask questions and get real-time feedback.
                        </DialogDescription>

                        {/* Background Ambient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-cyan-500/5 to-transparent pointer-events-none" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-none border border-white/10 bg-[#030712]/90 shadow-2xl backdrop-blur-2xl sm:rounded-2xl lg:flex-row lg:rounded-3xl"
                        >
                            {/* Session HUD — collapsible below lg, fixed sidebar at lg+ */}
                            <div
                                className={cn(
                                    "relative flex shrink-0 flex-col gap-3 overflow-hidden border-white/5 bg-black/40 p-3 sm:gap-4 sm:p-4 lg:w-72 lg:gap-6 lg:border-r lg:p-6 xl:w-80",
                                    showSessionHud
                                        ? "max-h-[min(48dvh,380px)] overflow-y-auto border-b sm:max-h-[min(44vh,420px)] lg:max-h-none lg:overflow-visible"
                                        : "hidden lg:flex",
                                )}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

                                <div>
                                    <div className="mb-1 flex items-center gap-2 sm:mb-2">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                        <h3 className="text-xs font-semibold uppercase tracking-widest text-white opacity-80 sm:text-sm">
                                            Live Session
                                        </h3>
                                    </div>
                                    <p className="font-mono text-[10px] text-gray-400 sm:text-xs">ID: {sessionId.current}</p>
                                </div>

                                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                                    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-1 shadow-inner">
                                        <MoodDetector compact />
                                    </div>

                                    <div className="space-y-2 sm:space-y-3">
                                        <h4 className="pl-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 sm:text-xs">
                                            Neurometric Analysis
                                        </h4>

                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            <div className="group relative overflow-hidden rounded-lg border border-white/5 bg-white/5 p-2 sm:rounded-xl sm:p-3">
                                                <div className="absolute inset-0 bg-red-500/5 transition-colors group-hover:bg-red-500/10" />
                                                <Heart className="mb-1 h-3.5 w-3.5 text-red-400 sm:mb-2 sm:h-4 sm:w-4" />
                                                <div className="text-sm font-bold text-white sm:text-xl">{emotionalState.engagement}</div>
                                                <div className="text-[9px] uppercase text-gray-400 sm:text-[10px]">Engage</div>
                                            </div>

                                            <div className="group relative overflow-hidden rounded-lg border border-white/5 bg-white/5 p-2 sm:rounded-xl sm:p-3">
                                                <div className="absolute inset-0 bg-amber-500/5 transition-colors group-hover:bg-amber-500/10" />
                                                <Sparkles className="mb-1 h-3.5 w-3.5 text-amber-400 sm:mb-2 sm:h-4 sm:w-4" />
                                                <div className="text-sm font-bold text-white sm:text-xl">{emotionalState.confidence}</div>
                                                <div className="text-[9px] uppercase text-gray-400 sm:text-[10px]">Conf.</div>
                                            </div>

                                            <div className="group relative overflow-hidden rounded-lg border border-white/5 bg-white/5 p-2 sm:rounded-xl sm:p-3">
                                                <div className="absolute inset-0 bg-cyan-500/5 transition-colors group-hover:bg-cyan-500/10" />
                                                <Bot className="mb-1 h-3.5 w-3.5 text-cyan-400 sm:mb-2 sm:h-4 sm:w-4" />
                                                <div className="text-sm font-bold text-white sm:text-xl">{emotionalState.curiosity}</div>
                                                <div className="text-[9px] uppercase text-gray-400 sm:text-[10px]">Curious</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="mx-0 rounded-lg border border-white/5 bg-black/20 py-1.5 text-center font-mono text-[9px] space-y-0.5 sm:mx-2 sm:py-2 sm:text-[10px] sm:space-y-1">
                                        <div className="flex items-center justify-center gap-2 text-green-400">
                                            <div className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </div>
                                            <span className="tracking-widest opacity-90">SYSTEM ONLINE</span>
                                        </div>
                                        <div className="text-gray-500 flex justify-center gap-3">
                                            <span>LATENCY: <span className={latency < 30 ? "text-green-400/80" : "text-yellow-400/80"}>{latency}ms</span></span>
                                            <span className="text-white/20">|</span>
                                            <span className="text-cyan-400/80">LIVE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content - AI Chat */}
                            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-gradient-to-b from-transparent to-black/20 pb-[env(safe-area-inset-bottom)]">
                                {/* Header */}
                                <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-white/5 px-3 py-2.5 backdrop-blur-sm sm:px-5 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-5">
                                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3 md:gap-4">
                                        <div className="relative shrink-0">
                                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 p-[2px] sm:h-10 sm:w-10 md:h-12 md:w-12">
                                                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-black">
                                                    <Image
                                                        src={MR5_LOGO_PATH}
                                                        alt="MR5 AI"
                                                        fill
                                                        sizes="(max-width: 768px) 40px, 48px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 rounded-full bg-black p-0.5">
                                                <span className="block h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse sm:h-3 sm:w-3" />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <DialogTitle className="truncate text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 sm:text-lg md:text-xl">
                                                AI Tutor
                                            </DialogTitle>
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <span className="hidden rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-cyan-300 min-[400px]:inline-flex">
                                                    Interactive
                                                </span>
                                                {listening && (
                                                    <span className="text-xs text-red-400 font-medium animate-pulse flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                        LIVE INPUT
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 md:gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowSessionHud((open) => !open)}
                                            className="h-8 rounded-full border border-white/10 bg-white/5 px-2.5 text-[9px] font-medium uppercase tracking-wide text-cyan-300 hover:bg-white/10 min-[400px]:h-9 min-[400px]:px-3 min-[400px]:text-[10px] lg:hidden"
                                        >
                                            {showSessionHud ? "Hide" : "Session"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={toggleMute}
                                            className="h-9 w-9 rounded-full border border-white/5 bg-white/5 text-gray-400 transition-all hover:scale-105 hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
                                        >
                                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={onClose}
                                            className="h-9 w-9 rounded-full border border-white/5 bg-red-500/10 text-red-400 transition-all hover:rotate-90 hover:bg-red-500 hover:text-white hover:scale-105 sm:h-10 sm:w-10"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                                    <ScrollArea
                                        className="h-0 min-h-0 flex-1 px-3 py-3 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8"
                                        viewportRef={viewportRef as React.RefObject<HTMLDivElement>}
                                        onScroll={handleScroll}
                                    >
                                        <div className="space-y-5 pb-3 sm:space-y-6 md:space-y-8 md:pb-4">
                                            {messages.length === 0 && (
                                                <div className="h-full flex flex-col items-center justify-center py-20 opacity-0 animate-in fade-in zoom-in duration-700">
                                                    <div className="relative mb-8">
                                                        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                                                        <div className="relative w-24 h-24 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                                                            <Sparkles className="w-12 h-12 text-white" />
                                                        </div>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-white mb-3 text-center">
                                                        Ready when you are
                                                    </h3>
                                                    <p className="text-gray-400 text-center max-w-sm leading-relaxed">
                                                        I&apos;m analyzing your learning patterns. Ask me anything about your coursework or upload an image to get started.
                                                    </p>
                                                </div>
                                            )}

                                            {messages.map((msg, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className={cn("flex gap-2.5 sm:gap-4 md:gap-5", msg.role === 'user' ? 'flex-row-reverse' : '')}
                                                >
                                                    <div className={cn(
                                                        "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-lg sm:h-9 sm:w-9 md:h-10 md:w-10",
                                                        msg.role === 'user'
                                                            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
                                                            : 'bg-gradient-to-br from-cyan-500 to-blue-600',
                                                    )}>
                                                        {msg.role === 'user' ? (
                                                            <User className="w-5 h-5 text-white" />
                                                        ) : (
                                                            <Image
                                                                src={MR5_LOGO_PATH}
                                                                alt="AI"
                                                                fill
                                                                sizes="40px"
                                                                className="object-cover"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="group relative max-w-[88%] space-y-1 sm:max-w-[82%] md:max-w-[75%] md:space-y-2">
                                                        <div className={cn(
                                                            "rounded-2xl px-3.5 py-3 shadow-xl backdrop-blur-md sm:rounded-3xl sm:px-5 sm:py-3.5 md:px-6 md:py-4",
                                                            msg.role === 'user'
                                                                ? 'rounded-tr-sm border border-violet-500/20 bg-violet-600/10 text-white'
                                                                : 'rounded-tl-sm border border-white/5 bg-white/5 text-gray-100',
                                                        )}>
                                                            {msg.type === 'image' && msg.content ? (
                                                                <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={msg.content}
                                                                        alt="Uploaded content"
                                                                        className="max-w-xs max-h-60 object-contain bg-black/20"
                                                                    />
                                                                </div>
                                                            ) : null}
                                                            <div className="prose prose-invert prose-sm leading-relaxed max-w-none">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                        <div className={`text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'text-right pr-2' : 'pl-2'}`}>
                                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {/* Real-time Transcript (User Speaking) */}
                                            {listening && transcript && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex gap-5 flex-row-reverse items-end"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                                                        <Mic className="w-5 h-5 text-red-400" />
                                                    </div>
                                                    <div className="rounded-3xl rounded-tr-sm px-6 py-4 max-w-[75%] bg-red-500/5 border border-red-500/10 text-gray-300">
                                                        <div className="flex space-x-1 items-center mb-1">
                                                            <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                                            <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                                            <span className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                                        </div>
                                                        <p className="italic">{transcript}</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* AI Processing/Speaking Indicator */}
                                            {(isProcessing || isSpeaking || isSending) && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex gap-5"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 overflow-hidden relative">
                                                        <Image
                                                            src={MR5_LOGO_PATH}
                                                            alt="AI Processing"
                                                            fill
                                                            sizes="40px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3 h-10 px-4 rounded-full bg-white/5 border border-white/5">
                                                        <span className="text-xs text-cyan-300 font-medium tracking-wide">AI IS THINKING</span>
                                                        <div className="flex gap-1">
                                                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_0ms]" />
                                                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
                                                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_400ms]" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div ref={scrollRef} />
                                        </div>
                                    </ScrollArea>

                                    {/* Scroll to Bottom Button */}
                                    <AnimatePresence>
                                        {showScrollButton && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                onClick={scrollToBottom}
                                                className="absolute bottom-3 right-3 z-30 rounded-full bg-cyan-500 p-2 text-white shadow-lg transition-colors hover:bg-cyan-600 sm:bottom-4 sm:right-6 md:right-8"
                                            >
                                                <ArrowDown className="w-5 h-5" />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>

                                    {/* Image Preview Area */}
                                    <AnimatePresence>
                                        {imagePreview && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                className="px-8 pb-2"
                                            >
                                                <div className="relative inline-block group">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-md rounded-xl" />
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={imagePreview}
                                                        alt="User uploaded preview"
                                                        className="relative rounded-xl max-h-40 object-contain border border-white/20 shadow-xl"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setImagePreview(null)}
                                                        className="absolute -top-3 -right-3 h-8 w-8 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Input Area */}
                                    <div
                                        className="shrink-0 bg-gradient-to-t from-[#030712] to-transparent p-2.5 sm:p-4 lg:p-6"
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        {/* Drag and drop overlay */}
                                        <AnimatePresence>
                                            {isDragging && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-6 bg-cyan-500/10 border-2 border-dashed border-cyan-500 rounded-2xl flex items-center justify-center z-20 backdrop-blur-sm"
                                                >
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                                                            <ImageIcon className="w-8 h-8 text-cyan-400" />
                                                        </div>
                                                        <p className="text-cyan-400 font-bold text-lg">Drop image to upload</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="relative mx-auto flex max-w-4xl items-end gap-1 rounded-[20px] border border-white/10 bg-white/5 p-1 shadow-2xl transition-all duration-300 focus-within:border-cyan-500/50 focus-within:bg-white/[0.07] sm:gap-2 sm:rounded-[24px] sm:p-1.5">

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={triggerFileInput}
                                                className="h-10 w-10 shrink-0 rounded-full text-gray-400 hover:bg-white/10 hover:text-white sm:h-11 sm:w-11 md:h-12 md:w-12"
                                                disabled={isSending}
                                            >
                                                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </Button>

                                            <div className="min-w-0 flex-1 py-1">
                                                <input
                                                    type="text"
                                                    value={inputMessage}
                                                    onChange={(e) => setInputMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                    placeholder={listening ? "Listening..." : "Ask about your studies..."}
                                                    className="w-full border-none bg-transparent px-1.5 py-2 text-sm text-white placeholder-gray-500 focus:ring-0 sm:px-2 sm:py-2.5 sm:text-base"
                                                    disabled={isSending}
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Hidden file input */}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileInputChange}
                                                accept="image/*"
                                                className="hidden"
                                            />

                                            <div className="flex items-center gap-0.5 pr-0.5 pb-0.5 sm:gap-1 sm:pr-1 sm:pb-1">
                                                {browserSupportsSpeechRecognition ? (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={listening ? stopListening : startListening}
                                                        className={cn(
                                                            "h-10 w-10 rounded-full transition-all duration-300 sm:h-11 sm:w-11",
                                                            listening
                                                                ? 'animate-pulse bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                                                : 'text-gray-400 hover:bg-white/10 hover:text-white',
                                                        )}
                                                        disabled={isSending}
                                                    >
                                                        {listening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
                                                    </Button>
                                                ) : null}

                                                <Button
                                                    size="icon"
                                                    onClick={isSending ? cancelRequest : () => handleSendMessage()}
                                                    className={cn(
                                                        "h-10 w-10 rounded-full shadow-lg transition-all duration-300 sm:h-11 sm:w-11",
                                                        isSending
                                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                                            : inputMessage.trim() || imagePreview
                                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 hover:shadow-cyan-500/25'
                                                                : 'cursor-not-allowed bg-white/10 text-gray-500',
                                                    )}
                                                    disabled={(!inputMessage.trim() && !imagePreview) && !isSending}
                                                >
                                                    {isSending ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Send className="w-5 h-5 ml-0.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="mt-2 hidden text-center text-[10px] uppercase tracking-wide text-gray-600 sm:mt-3 sm:block md:mt-4">
                                            AI-Powered Study Assistant • Mr5 School
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}

export default TeachingAIModal;