/** Client-side auth message sanitization — never surface enumeration hints. */

export const AUTH_INVALID_MESSAGE = "Invalid email or password.";
export const AUTH_LOCKED_MESSAGE = "Too many attempts. Please wait before trying again.";
export const AUTH_NETWORK_MESSAGE =
	"Cannot reach the server. Please check your connection and try again.";
export const AUTH_DB_WARMUP_MESSAGE =
	"The server is still connecting to the database. Wait a few seconds and try again.";
export const FORGOT_PASSWORD_MESSAGE =
	"If an account exists for that email, a reset link has been sent.";

const ENUMERATION_PATTERNS = [
	/not found/i,
	/incorrect password/i,
	/invalid credentials/i,
	/deactivated/i,
	/pending approval/i,
	/already exists/i,
	/no user with that email/i,
	/account disabled/i,
	/user not found/i,
];

export function sanitizeAuthErrorMessage(
	error: unknown,
	fallback = AUTH_INVALID_MESSAGE,
): string {
	const err = error as {
		response?: { status?: number; data?: { message?: string; error?: string } };
		code?: string;
		message?: string;
	};

	if (err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error")) {
		return AUTH_NETWORK_MESSAGE;
	}

	if (err?.response?.status === 503) {
		return AUTH_DB_WARMUP_MESSAGE;
	}

	if (err?.response?.status === 429) {
		return AUTH_LOCKED_MESSAGE;
	}

	if (err?.response?.status === 401 || err?.response?.status === 400) {
		const serverMsg = err.response?.data?.message || err.response?.data?.error;
		if (serverMsg && ENUMERATION_PATTERNS.some((p) => p.test(serverMsg))) {
			return AUTH_INVALID_MESSAGE;
		}
		if (serverMsg === AUTH_LOCKED_MESSAGE) return AUTH_LOCKED_MESSAGE;
		if (serverMsg === AUTH_INVALID_MESSAGE) return AUTH_INVALID_MESSAGE;
		return AUTH_INVALID_MESSAGE;
	}

	return fallback;
}

export function clearSensitiveFormState<T extends { password?: string }>(
	setter: (value: T | ((prev: T) => T)) => void,
) {
	setter((prev) => ({ ...prev, password: "" }));
}
