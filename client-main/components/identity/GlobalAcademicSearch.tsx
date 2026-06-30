"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
	BookOpen,
	GraduationCap,
	Loader2,
	Search,
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
				"overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl",
				isFullscreen
					? "relative mt-3 max-h-[min(60vh,420px)]"
					: "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[100] max-h-[min(70vh,320px)]",
			)}
			role="presentation"
		>
			<div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
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

			<ul id={listboxId} role="listbox" className="max-h-80 overflow-y-auto overscroll-contain py-1">
				{error ? (
					<li className="px-4 py-3 text-sm text-destructive" role="option">
						{error}
					</li>
				) : null}

				{!error && suggestions.length === 0 && !isLoading ? (
					<li className="px-4 py-3 text-sm text-muted-foreground" role="option">
						No matches yet. Try a course title, learner name, or MR5 UID.
					</li>
				) : null}

				{suggestions.map((item, index) => (
					<li key={`${item.type}-${item.href}-${item.label}`} role="option" aria-selected={index === activeIndex}>
						<button
							type="button"
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => navigate(item.href)}
							className={cn(
								"touch-target-inline flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:bg-accent focus-visible:outline-none",
								index === activeIndex ? "bg-accent" : "hover:bg-accent",
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
								<GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden />
							) : null}
						</button>
					</li>
				))}
			</ul>

			{query.trim() ? (
				<div className="border-t border-border px-4 py-2">
					<button
						type="button"
						onClick={() => {
							const href = submit();
							if (href) navigate(href);
						}}
						className="touch-target-inline text-xs font-medium text-primary hover:underline"
					>
						Press Enter to search “{query.trim()}”
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
		<div ref={rootRef} data-tour-id={tourId} className={cn("relative w-full", className)}>
			{form}
			{panel}
		</div>
	);
}
