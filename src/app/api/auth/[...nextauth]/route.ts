import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { cookies } from "next/headers"

// Backend endpoints for Google social auth
const GOOGLE_REGISTER_PATH = "/auth/social/google/register";
const GOOGLE_LOGIN_PATH    = "/auth/social/google/login";

// Helper: call a backend endpoint and return parsed JSON + status
async function callBackend(url: string, body: Record<string, string | undefined>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { res, data };
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      // No custom authorization.params — NextAuth v4 handles the OAuth
      // flow internally and already provides both access_token and id_token.
    }),
  ],
  // AUTH_SECRET is read explicitly; NEXTAUTH_SECRET is NextAuth v4's auto-detected fallback.
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://expoviviendas.com/api/api";

        // ── Step 1: Read role cookie (safe — handles missing / expired cookie) ──
        let role: "user" | "agent" = "user"; // safe default
        try {
          const cookieStore = await cookies();
          const roleCookie = cookieStore.get("google_auth_role")?.value;
          if (roleCookie === "agent" || roleCookie === "user") {
            role = roleCookie;
          } else if (roleCookie) {
            console.warn(`[NextAuth] Unexpected google_auth_role value: "${roleCookie}" — defaulting to "user"`);
          } else {
            console.log("[NextAuth] google_auth_role cookie missing or expired — defaulting to \"user\"");
          }
        } catch (cookieErr) {
          console.warn("[NextAuth] Could not read cookies — defaulting role to \"user\"", cookieErr);
        }

        const accessToken = account.access_token ?? undefined;
        const idToken     = account.id_token     ?? undefined;

        console.log("[NextAuth] signIn — Google OAuth complete", {
          hasAccessToken: !!accessToken,
          hasIdToken: !!idToken,
          role,
        });

        try {
          // ── Step 2: Try REGISTER (new users + upsert if backend supports it) ──
          console.log(`[NextAuth] signIn — POST ${baseUrl}${GOOGLE_REGISTER_PATH}`);
          const { res: regRes, data: regData } = await callBackend(
            `${baseUrl}${GOOGLE_REGISTER_PATH}`,
            { access_token: accessToken, id_token: idToken, role }
          );

          console.log("[NextAuth] signIn — Register response:", {
            status: regRes.status,
            success: regData?.success,
            message: regData?.message,
          });

          if (regRes.ok && regData?.success && regData?.data?.authorisation?.token) {
            // ✅ New user registered successfully
            (user as any).backendToken = regData.data.authorisation.token;
            (user as any).backendUser  = regData.data.user;
            console.log("[NextAuth] signIn — New user registered. Role:", regData.data.user?.role);

          } else if (regRes.status === 422 || regRes.status === 409) {
            // ── Step 3: User already exists → fall back to LOGIN endpoint ──
            console.log("[NextAuth] signIn — User already exists. Falling back to LOGIN endpoint...");
            console.log(`[NextAuth] signIn — POST ${baseUrl}${GOOGLE_LOGIN_PATH}`);

            const { res: loginRes, data: loginData } = await callBackend(
              `${baseUrl}${GOOGLE_LOGIN_PATH}`,
              { access_token: accessToken }  // login only needs access_token
            );

            console.log("[NextAuth] signIn — Login response:", {
              status: loginRes.status,
              success: loginData?.success,
              message: loginData?.message,
            });

            if (loginRes.ok && loginData?.success && loginData?.data?.authorisation?.token) {
              // ✅ Existing user logged in successfully
              (user as any).backendToken = loginData.data.authorisation.token;
              (user as any).backendUser  = loginData.data.user;
              console.log("[NextAuth] signIn — Existing user logged in. Role:", loginData.data.user?.role);
            } else {
              // Login endpoint also failed — proceed as mock session
              console.error("[NextAuth] signIn — Login fallback also failed:", {
                status: loginRes.status,
                message: loginData?.message,
              });
            }

          } else {
            // Other errors (5xx, malformed response, etc.) — proceed as mock session
            console.error("[NextAuth] signIn — Unexpected register response:", {
              status: regRes.status,
              message: regData?.message,
            });
          }

        } catch (networkErr) {
          // Backend is unreachable — allow NextAuth session to continue in mock mode
          console.error("[NextAuth] signIn — Network error. Proceeding with Google-only session.", networkErr);
        }
      }

      // Always return true — never block the user from signing in
      return true;
    },

    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken     = account.id_token;
      }
      if (user && (user as any).backendToken) {
        token.backendToken = (user as any).backendToken;
        token.backendUser  = (user as any).backendUser;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).accessToken  = token.accessToken;
      (session as any).idToken      = token.idToken;
      (session as any).backendToken = token.backendToken;
      (session as any).backendUser  = token.backendUser;
      return session;
    },
  },
});

export { handler as GET, handler as POST }
