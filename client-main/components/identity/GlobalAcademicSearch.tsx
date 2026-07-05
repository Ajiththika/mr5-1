"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
	BookOpen,
	GraduationCap,
	Loader2,
	Search,
	SearchX,
	Shield,
	Sparkles,
	UserRound,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalAcademicSearch } from "@/hooks/useGlobalAcademicSearch";
import type { SearchSuggestion } from "@/types/identity";

type GlobalAcademicSearchProps = {
	className?: string;
	inputClassName?: string;
	placeholder?: string;
	showShortcut?: boolean;
	onNavigate?: () => void;
	variant?: "inline" | "compact" | "fullscreen";
	autoFocus?: boolean;
	"data-tour-id"?: string;
};

function SuggestionIcon({ type }: { type: SearchSuggestion["type"] }) {
	if (type === "course") return <BookOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden />;
	return <UserRound className="h-4 w-4 shrink-0 text-primary" aria-hidden />;
}

export function GlobalAcademicSearch({
	className,
	inputClassName,
	placeholder = "Search courses, names, or MR5 UIDs…",
	showShortcut = true,
	onNavigate,
	variant = "inline",
	autoFocus = false,
	"data-tour-id": tourId,
}: GlobalAcademicSearchProps) {
	const router = useRouter();
	const listboxId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [mounted, setMounted] = useState(false);
	const {
		query,
		setQuery,
		results,
		isLoading,
		error,
		isOpen,
		setIsOpen,
		intent,
		submit,
	} = useGlobalAcademicSearch();

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (autoFocus) inputRef.current?.focus();
	}, [autoFocus]);

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [setIsOpen]);

	useEffect(() => {
		const onKeyDown = (event: globalThis.KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				inputRef.current?.focus();
				setIsOpen(true);
			}
			if (event.key === "Escape") setIsOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [setIsOpen]);

	const suggestions = results.suggestions;
	const showPanel = isOpen && (query.trim().length > 0 || isLoading);

	useEffect(() => {
		setActiveIndex(suggestions.length ? 0 : -1);
	}, [suggestions]);

	const navigate = (href: string) => {
		setIsOpen(false);
		setQuery("");
		onNavigate?.();
		router.push(href);
	};

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		if (activeIndex >= 0 && suggestions[activeIndex]) {
			navigate(suggestions[activeIndex].href);
			return;
		}
		const href = submit();
		if (href) navigate(href);
	};

	const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
		if (!showPanel || !suggestions.length) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((i) => (i + 1) % suggestions.length);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
		} else if (event.key === "Enter" && activeIndex >= 0) {
			event.preventDefault();
			navigate(suggestions[activeIndex].href);
		}
	};

	const isCompact = variant === "compact";
	const isFullscreen = variant === "fullscreen";

	const panel = showPanel ? (
		<div
			className={cn(
				"w-full min-w-0 overflow-hidden rounded-xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl ring-1 ring-black/5 backdrop-blur-md dark:ring-white/10",
				isFullscreen
					? "relative mt-3 max-h-[min(60vh,420px)]"
					: "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[100] max-h-[min(70vh,360px)]",
			)}
			role="presentation"
		>
			{suggestions.length > 0 || isLoading ? (
				<div className="border-b border-border/70 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:px-4">
					{intent === "uid" ? (
						<span className="inline-flex items-center gap-1.5">
							<Shield className="h-3.5 w-3.5" aria-hidden />
							Profile UID search
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5">
							<Sparkles className="h-3.5 w-3.5" aria-hidden />
							Courses & learners
						</span>
					)}
				</div>
			) : null}

			{isLoading && suggestions.length === 0 ? (
				<div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
					Searching…
				</div>
			) : null}

			{error ? (
				<div className="px-4 py-4 text-sm text-destructive" role="alert">
					{error}
				</div>
			) : null}

			{!error && suggestions.length === 0 && !isLoading ? (
				<div className="flex flex-col items-center gap-3 px-4 py-6 text-center sm:px-6 sm:py-8">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/80">
						<SearchX className="h-5 w-5 text-muted-foreground" aria-hidden />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-semibold text-foreground">
							No matches for &ldquo;{query.trim()}&rdquo;
						</p>
						<p className="text-xs leading-relaxed text-muted-foreground">
							Try a course title, learner name, or MR5 UID like MR5-STU-XXXX
						</p>
					</div>
					<button
						type="button"
						onClick={() => {
							const href = submit();
							if (href) navigate(href);
						}}
						className="mt-1 inline-flex min-h-10 w-full max-w-xs items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Search all courses
					</button>
				</div>
			) : null}

			{suggestions.length > 0 ? (
				<ul id={listboxId} role="listbox" className="max-h-72 overflow-y-auto overscroll-contain py-1">
					{suggestions.map((item, index) => (
						<li
							key={`${item.type}-${item.href}-${item.label}`}
							id={`${listboxId}-opt-${index}`}
							role="option"
							aria-selected={index === activeIndex}
						>
							<button
								type="button"
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => navigate(item.href)}
								className={cn(
									"flex w-full min-h-11 items-center gap-3 px-3 py-2.5 text-left transition-colors focus-visible:bg-accent focus-visible:outline-none sm:px-4 sm:py-3",
									index === activeIndex ? "bg-accent" : "hover:bg-accent/70",
								)}
							>
								<SuggestionIcon type={item.type} />
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm font-medium">{item.label}</span>
									{item.subLabel ? (
										<span className="block truncate text-xs text-muted-foreground">{item.subLabel}</span>
									) : null}
								</span>
								{item.type === "profile" ? (
									<GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
								) : null}
							</button>
						</li>
					))}
				</ul>
			) : null}

			{suggestions.length > 0 && query.trim() ? (
				<div className="border-t border-border/70 px-3 py-2 sm:px-4">
					<button
						type="button"
						onClick={() => {
							const href = submit();
							if (href) navigate(href);
						}}
						className="w-full text-left text-xs font-medium text-primary hover:underline"
					>
						View all results for &ldquo;{query.trim()}&rdquo;
					</button>
				</div>
			) : null}
		</div>
	) : null;

	const form = (
		<form
			onSubmit={handleSubmit}
			className={cn(
				"relative flex w-full items-center rounded-xl border border-border bg-card text-sm text-foreground shadow-[0_1px_2px_oklch(var(--shadow-color)/0.06),0_6px_18px_oklch(var(--shadow-color)/0.05)] transition-all duration-300 focus-within:border-primary/30",
				isCompact ? "px-3 py-2" : "px-4 py-3",
				inputClassName,
			)}
			role="search"
		>
			<Search
				className={cn("shrink-0 text-muted-foreground", isCompact ? "mr-2 h-4 w-4" : "mr-3 h-5 w-5")}
				aria-hidden
			/>
			<input
				ref={inputRef}
				value={query}
				onChange={(event) => {
					setQuery(event.target.value);
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				onKeyDown={handleInputKeyDown}
				type="search"
				inputMode="search"
				enterKeyHint="search"
				autoComplete="off"
				spellCheck={false}
				placeholder={placeholder}
				aria-label="Global academic search"
				aria-expanded={showPanel}
				aria-controls={listboxId}
				aria-autocomplete="list"
				aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
				className="w-full flex-1 border-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
				style={{ fontSize: "16px" }}
			/>
			{isLoading ? (
				<Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
			) : null}
			{showShortcut && !isCompact && !isFullscreen ? (
				<span className="ml-auto hidden rounded border border-border bg-muted px-2 py-1 text-[10px] font-bold tracking-widest text-muted-foreground md:inline-block">
					⌘K
				</span>
			) : null}
		</form>
	);

	if (isFullscreen && mounted) {
		return createPortal(
			<div className="fixed inset-0 z-[200] flex flex-col bg-background/95 px-4 pb-[max(1rem,var(--safe-bottom))] pt-[max(1rem,var(--safe-top))] backdrop-blur-md">
				<div className="mx-auto flex w-full max-w-xl items-center gap-2">
					<div ref={rootRef} className="relative min-w-0 flex-1">
						{form}
						{panel}
					</div>
					<button
						type="button"
						onClick={() => onNavigate?.()}
						className="touch-target inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-card p-2"
						aria-label="Close search"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
			</div>,
			document.body,
		);
	}

	return (
		<div ref={rootRef} data-tour-id={tourId} className={cn("relative z-20 w-full min-w-0", className)}>
			{form}
			{panel}
		</div>
	);
}
