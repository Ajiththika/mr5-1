"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchAcademic } from "@/services/identity.service";
import type { AcademicSearchResponse } from "@/types/identity";
import { isMr5UidInput, normalizeMr5Uid, profilePath } from "@/lib/identity/uid";

const EMPTY: AcademicSearchResponse = {
	intent: "empty",
	profiles: [],
	courses: [],
	suggestions: [],
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = window.setTimeout(() => setDebounced(value), delayMs);
		return () => window.clearTimeout(timer);
	}, [value, delayMs]);
	return debounced;
}

export function useGlobalAcademicSearch(initialQuery = "") {
	const [query, setQuery] = useState(initialQuery);
	const [results, setResults] = useState<AcademicSearchResponse>(EMPTY);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const requestIdRef = useRef(0);
	const debouncedQuery = useDebouncedValue(query, 180);

	const intent = useMemo(() => {
		const trimmed = query.trim();
		if (!trimmed) return "empty" as const;
		if (isMr5UidInput(trimmed)) return "uid" as const;
		return "mixed" as const;
	}, [query]);

	const fetchSuggestions = useCallback(async (value: string) => {
		const trimmed = value.trim();
		if (!trimmed) {
			setResults(EMPTY);
			setIsLoading(false);
			setError(null);
			return;
		}

		const requestId = ++requestIdRef.current;
		setIsLoading(true);
		setError(null);

		try {
			const data = await searchAcademic(trimmed, 8);
			if (requestId !== requestIdRef.current) return;
			setResults(data);
		} catch (err) {
			if (requestId !== requestIdRef.current) return;
			setError(err instanceof Error ? err.message : "Search failed");
			setResults(EMPTY);
		} finally {
			if (requestId === requestIdRef.current) setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		void fetchSuggestions(debouncedQuery);
	}, [debouncedQuery, fetchSuggestions, isOpen]);

	const submit = useCallback(() => {
		const trimmed = query.trim();
		if (!trimmed) return null;

		const normalized = normalizeMr5Uid(trimmed);
		if (normalized) return profilePath(normalized);

		if (isMr5UidInput(trimmed)) {
			const firstProfile = results.profiles[0];
			if (firstProfile) return firstProfile.href;
		}

		if (results.profiles.length === 1 && results.courses.length === 0) {
			return results.profiles[0].href;
		}

		if (results.courses.length === 1 && results.profiles.length === 0) {
			return results.courses[0].href;
		}

		return `/courses?search=${encodeURIComponent(trimmed)}`;
	}, [query, results]);

	return {
		query,
		setQuery,
		results,
		isLoading,
		error,
		isOpen,
		setIsOpen,
		intent,
		submit,
		refresh: () => fetchSuggestions(query),
	};
}
