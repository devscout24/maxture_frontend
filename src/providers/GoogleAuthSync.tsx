"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { writeStoredAuthSession, readStoredAuthSession, clearStoredAuthSession } from "@/lib/store";

export function GoogleAuthSync() {
  const { data: session, status } = useSession();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user && !hasSynced.current) {
      const existingSession = readStoredAuthSession();
      const backendToken = (session as any).backendToken as string | undefined;
      const backendUser = (session as any).backendUser as any | undefined;
      const googleAccessToken = (session as any).accessToken as string | undefined;
      const googleEmail = session.user.email ?? "";

      // Don't overwrite a valid regular (email/password) login session.
      // Real JWT tokens have 3 dot-separated segments.
      const existingIsRegularLogin =
        existingSession?.token && existingSession.token.split(".").length === 3;
      if (existingIsRegularLogin && existingSession?.user.email === googleEmail) {
        console.log("[GoogleAuthSync] Regular login session detected — skipping Google sync.");
        hasSynced.current = true;
        return;
      }

      // ------------------------------------------------------------------
      // Determine which token to store:
      //  1. backendToken  → real JWT from /auth/social/google/register  ✅ preferred
      //  2. google-jwt:XX → Google access_token (degraded / backend down)
      //  3. google:email  → last-resort fallback identifier
      // ------------------------------------------------------------------
      const isMockSession = !backendToken;
      const tokenToStore = backendToken
        ?? (googleAccessToken ? `google-jwt:${googleAccessToken}` : `google:${googleEmail}`);

      if (isMockSession) {
        console.warn(
          "[GoogleAuthSync] No backendToken found — backend may be unreachable. " +
          "Using degraded mock session. Some authenticated features may be unavailable.",
          { tokenToStore }
        );
      } else {
        console.log("[GoogleAuthSync] Real backend token received — full session active.");
      }

      // ------------------------------------------------------------------
      // Determine role:
      //  1. backendUser.role  → authoritative from backend          ✅ preferred
      //  2. google_auth_role cookie → set by GoogleRoleModal before OAuth
      //  3. "user"            → safe default if cookie is missing/expired
      // ------------------------------------------------------------------
      const getCookie = (name: string): string | null => {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
        return match ? match[2] : null;
      };

      const cookieRole = getCookie("google_auth_role");
      const roleToStore: "user" | "agent" =
        (backendUser?.role === "agent" || backendUser?.role === "user")
          ? backendUser.role
          : (cookieRole === "agent" || cookieRole === "user")
            ? cookieRole
            : "user"; // safe default — cookie missing or expired

      if (!backendUser?.role && !cookieRole) {
        console.warn("[GoogleAuthSync] google_auth_role cookie is missing or expired — defaulting role to \"user\".");
      }

      console.log("[GoogleAuthSync] Syncing session →", {
        email: googleEmail,
        role: roleToStore,
        isMockSession,
        backendUserId: backendUser?.id ?? null,
      });

      writeStoredAuthSession({
        user: {
          id: backendUser?.id || 0,
          name: backendUser?.name || session.user.name || session.user.email || "User",
          email: googleEmail,
          role: roleToStore,
          avatar: backendUser?.avatar || session.user.image || null,
          phone: backendUser?.phone || null,
          premium: backendUser?.premium || 0,
        },
        token: tokenToStore,
        type: "Bearer",
      });

      hasSynced.current = true;
      console.log("[GoogleAuthSync] Session sync complete.");
    }

    if (status === "unauthenticated") {
      hasSynced.current = false;
      const existing = readStoredAuthSession();
      // Only clear Google-prefixed tokens — never touch real JWT sessions.
      if (existing?.token?.startsWith("google:") || existing?.token?.startsWith("google-jwt:")) {
        console.log("[GoogleAuthSync] User signed out — clearing Google session.");
        clearStoredAuthSession();
      }
    }
  }, [status, session]);

  return null;
}