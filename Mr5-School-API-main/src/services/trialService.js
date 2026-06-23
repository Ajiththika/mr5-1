export const TRIAL_DURATION_MS = 5 * 60 * 60 * 1000;

export const isTrialActive = (user) => {
	if (!user?.trialExpiresAt) return false;
	return new Date(user.trialExpiresAt).getTime() > Date.now();
};

export const hasProAccess = (user) => {
	if (!user) return false;
	if (user.role === "admin" || user.role === "AI-TEACHER") return true;
	return isTrialActive(user);
};

export const getTrialStatus = (user) => {
	const active = isTrialActive(user);
	const used = Boolean(user?.trialUsed);
	const expiresAt = user?.trialExpiresAt || null;
	const remainingMs = active && expiresAt
		? Math.max(0, new Date(expiresAt).getTime() - Date.now())
		: 0;

	return {
		active,
		used,
		expiresAt,
		startedAt: user?.trialStartedAt || null,
		remainingMs,
		canStart: !used && !active,
		hasProAccess: hasProAccess(user),
		durationHours: TRIAL_DURATION_MS / (60 * 60 * 1000),
	};
};

export const startTrial = (user) => {
	if (isTrialActive(user)) {
		return getTrialStatus(user);
	}

	if (user.trialUsed) {
		const error = new Error("You have already used your free trial");
		error.statusCode = 400;
		throw error;
	}

	const now = new Date();
	user.trialUsed = true;
	user.trialStartedAt = now;
	user.trialExpiresAt = new Date(now.getTime() + TRIAL_DURATION_MS);

	return user;
};
