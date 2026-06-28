const UID_PREFIX_PATTERN = /^MR5-(STU|TCH|ADM)(-|$)/i;
const UID_FULL_PATTERN = /^MR5-(STU|TCH|ADM)-[A-Z0-9]{6}$/;

export function isMr5UidInput(value: string): boolean {
	return UID_PREFIX_PATTERN.test(value.trim());
}

export function normalizeMr5Uid(value: string): string | null {
	const normalized = value.trim().toUpperCase();
	return UID_FULL_PATTERN.test(normalized) ? normalized : null;
}

export function profilePath(uid: string): string {
	return `/u/${encodeURIComponent(uid.trim().toUpperCase())}`;
}

export function certificatePath(verificationId: string): string {
	return `/certificate/${encodeURIComponent(verificationId)}`;
}

export function resolveSearchNavigation(query: string): string {
	const trimmed = query.trim();
	if (!trimmed) return "/courses";

	const normalized = normalizeMr5Uid(trimmed);
	if (normalized) return profilePath(normalized);

	if (isMr5UidInput(trimmed)) {
		return `/courses?search=${encodeURIComponent(trimmed)}&mode=uid`;
	}

	return `/courses?search=${encodeURIComponent(trimmed)}&mode=mixed`;
}
