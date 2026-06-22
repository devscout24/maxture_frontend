import type { AuthUser } from "@/lib/api";

export const AUTH_STORAGE_KEY = "expovivienda_auth_session";
export const LEGACY_AUTH_STORAGE_KEY = "expovivienda_demo_user";
export const AUTH_EVENT_NAME = "auth-changed";

export type StoredAuthSession = {
	user: AuthUser;
	token: string;
	type: string;
};

type LegacyStoredUser = {
	name?: string;
	email?: string;
};

function readStorageItem(key: string): string | null {
	if (typeof window === "undefined") {
		return null;
	}

	return window.localStorage.getItem(key);
}

function writeStorageItem(key: string, value: string | null) {
	if (typeof window === "undefined") {
		return;
	}

	if (value === null) {
		window.localStorage.removeItem(key);
	} else {
		window.localStorage.setItem(key, value);
	}
}

function emitAuthChange() {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function readStoredAuthSession(): StoredAuthSession | null {
	const storedSession = readStorageItem(AUTH_STORAGE_KEY);

	// console.log('Reading stored session from key:', AUTH_STORAGE_KEY);
	// console.log('Raw stored session:', storedSession);

	if (storedSession) {
		try {
			const parsed = JSON.parse(storedSession) as StoredAuthSession;
			// console.log('Parsed session:', parsed);
			// console.log('Token from parsed session:', parsed.token);
			return parsed;
		} catch (error) {
			// console.error('Failed to parse stored session:', error);
			writeStorageItem(AUTH_STORAGE_KEY, null);
		}
	}

	const legacyUser = readStorageItem(LEGACY_AUTH_STORAGE_KEY);

	if (!legacyUser) {
		return null;
	}

	try {
		const parsedLegacyUser = JSON.parse(legacyUser) as LegacyStoredUser;

		if (!parsedLegacyUser.email) {
			return null;
		}

		return {
			user: {
				id: 0,
				name: parsedLegacyUser.name ?? parsedLegacyUser.email,
				email: parsedLegacyUser.email,
				role: "user",
				avatar: null,
				phone: null,
				premium: 0,
			},
			token: "legacy-demo-session",
			type: "Bearer",
		};
	} catch {
		return null;
	}
}

export function writeStoredAuthSession(session: StoredAuthSession | null) {
	if (session) {
		writeStorageItem(AUTH_STORAGE_KEY, JSON.stringify(session));
		writeStorageItem(LEGACY_AUTH_STORAGE_KEY, null);
	} else {
		writeStorageItem(AUTH_STORAGE_KEY, null);
		writeStorageItem(LEGACY_AUTH_STORAGE_KEY, null);
	}

	emitAuthChange();
}

export function clearStoredAuthSession() {
	writeStoredAuthSession(null);
}
