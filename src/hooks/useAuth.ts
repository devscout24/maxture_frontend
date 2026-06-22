"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
	loginUser,
	logoutUser,
	registerUser,
	type AuthSessionResponse,
	type LoginPayload,
	type RegisterPayload,
	type RegisterResponse,
	type AuthUser,
} from "@/lib/api";
import {
	AUTH_EVENT_NAME,
	clearStoredAuthSession,
	readStoredAuthSession,
	type StoredAuthSession,
	writeStoredAuthSession,
} from "@/lib/store";

type UseAuthResult = {
	user: AuthUser | null;
	token: string | null;
	isLoggedIn: boolean;
	session: StoredAuthSession | null;
	login: (payload: LoginPayload) => Promise<AuthSessionResponse>;
	register: (payload: RegisterPayload) => Promise<RegisterResponse>;
	logout: () => Promise<void>;
	isLoading: boolean;
	loginError: Error | null;
	registerError: Error | null;
	logoutError: Error | null;
};

function toStoredSession(response: AuthSessionResponse | RegisterResponse): StoredAuthSession {



	
	const session = {
		user: response.data.user,
		token: response.data.authorisation.token,
		type: response.data.authorisation.type,
	};
	

	return session;
}

export default function useAuth(): UseAuthResult {
	const queryClient = useQueryClient();
	const [session, setSession] = useState<StoredAuthSession | null>(() => readStoredAuthSession());



	useEffect(() => {
		const syncAuthState = () => {
			const newSession = readStoredAuthSession();
			setSession(newSession);
			queryClient.setQueryData(["auth"], newSession);
		};

		window.addEventListener("storage", syncAuthState);
		window.addEventListener(AUTH_EVENT_NAME, syncAuthState);

		return () => {
			window.removeEventListener("storage", syncAuthState);
			window.removeEventListener(AUTH_EVENT_NAME, syncAuthState);
		};
	}, [queryClient]);

	// Login mutation
	const loginMutation = useMutation({
		mutationFn: loginUser,
		onSuccess: (response) => {
			const nextSession = toStoredSession(response);
			setSession(nextSession);
			writeStoredAuthSession(nextSession);
			queryClient.setQueryData(["auth"], nextSession);

			toast.success(response.message || "Login Successfully", {
				style: {
					background: 'black',
					color: 'white',
				},
				position: 'top-right',
			});
		},
		onError: (error) => {
			toast.error(error.message || "Login failed", {
				style: {
					background: 'black',
					color: 'white',
				},
				position: 'top-right',
			});
		},
	});

	// Register mutation
	const registerMutation = useMutation({
		mutationFn: registerUser,
		onSuccess: (response) => {
			const nextSession = toStoredSession(response);
			setSession(nextSession);
			writeStoredAuthSession(nextSession);
			queryClient.setQueryData(["auth"], nextSession);
			toast.success(response.message || "Registration successfully done", {
				style: {
					background: 'black',
					color: 'white',
				},
				position: 'top-right',
			});
		},
		onError: (error) => {
			toast.error(error.message || "Registration failed", {
				style: {
					background: 'black',
					color: 'white',
				},
				position: 'top-right',
			});
		},
	});

	// Logout mutation
	const logoutMutation = useMutation({
		mutationFn: async () => {
			// Get token from stored session
			const session = readStoredAuthSession();
			const token = session?.token || '';
			// Call logout API if token exists and is not a mock token
			if (token && !token.startsWith('google:') && !token.startsWith('google-jwt:') && token !== 'legacy-demo-session') {
				try {
					const response = await logoutUser(token);
	
					return response;
				} catch (error) {
	
					// Even if API fails, proceed with local cleanup
					return { success: true, message: 'Logged out locally' };
				}
			} else {

				return { success: true, message: 'Logged out locally' };
			}
		},
		onSuccess: (response) => {
			clearStoredAuthSession();
			setSession(null);
			queryClient.setQueryData(["auth"], null);
			queryClient.clear();
			// Show custom styled toast and navigate to home
			toast.success(response?.message || "Successfully logged out", {
				style: {
					background: 'black',
					color: 'white',
				},
				position: 'top-right',
			});
			// Wait 2 seconds before navigating to home page
			signOut({ redirect: false }).then(() => {
				setTimeout(() => {
					window.location.href = '/';
				}, 500);
			});
		},
		onError: (error) => {
			toast.error(error.message || "Logout failed", {
				style: {
					background: 'black',
					color: 'white',
				},
				position: 'top-right',
			});
		},
	});

	const login = async (payload: LoginPayload) => {
		return loginMutation.mutateAsync(payload);
	};

	const register = async (payload: RegisterPayload) => {
		return registerMutation.mutateAsync(payload);
	};

	const logout = async () => {
		await logoutMutation.mutateAsync();
	};

	return {
		user: session?.user ?? null,
		token: session?.token ?? null,
		isLoggedIn: Boolean(session?.user),
		session,
		login,
		register,
		logout,
		isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
		loginError: loginMutation.error,
		registerError: registerMutation.error,
		logoutError: logoutMutation.error,
	};
}
