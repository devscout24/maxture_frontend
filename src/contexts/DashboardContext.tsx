"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getSidebarCounts, getAuthToken } from "@/lib/api";
import { readStoredAuthSession } from "@/lib/store";
import isValidToken from "@/lib/token-validation";
import useAuth from "@/hooks/useAuth";

type DashboardProfile = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  memberSince: string;
  avatar: string | null;
  tickets_count: number;
  saved_properties_count: number;
  total_spent: number;
};

function mapProfileData(
  userData: NonNullable<
    Awaited<ReturnType<typeof getUserProfile>>
  >["data"]["user"],
  counts?: { tickets_count: number; saved_properties_count: number },
): DashboardProfile {
  return {
    name: userData.name || "",
    email: userData.email || "",
    phone: userData.phone || "",
    address: userData.address || "",
    memberSince: userData.created_at
      ? new Date(userData.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        })
      : "March 2025",
    avatar: userData.avatar || null,
    tickets_count: counts?.tickets_count ?? userData.tickets_count ?? 0,
    saved_properties_count:
      counts?.saved_properties_count ?? userData.saved_properties_count ?? 0,
    total_spent: userData.total_spent || 0,
  };
}

type DashboardContextType = {
  profile: DashboardProfile | null;
  isLoading: boolean;
  initials: string;
  refreshProfile: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}

type DashboardProviderProps = {
  children: ReactNode;
};

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { logout } = useAuth();
  const authQuery = useQuery({
    queryKey: ["auth"],
    queryFn: () => readStoredAuthSession(),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const authToken = authQuery.data?.token ?? null;

  const profileQuery = useQuery<DashboardProfile | null>({
    queryKey: ["dashboard-profile", authToken ?? "anonymous"],
    enabled: !!authToken,
    queryFn: async () => {
      const token = authToken ?? getAuthToken();
      const isValid = token ? isValidToken(token) : false;
      if (!token || !isValid) {
        await logout();
        return null;
      }

      const isGoogleSession = token.startsWith("google:");
      if (isGoogleSession) {
        const stored =
          typeof window !== "undefined"
            ? JSON.parse(
                localStorage.getItem("expovivienda_auth_session") || "null",
              )
            : null;

        return stored?.user
          ? {
              name: stored.user.name || "",
              email: stored.user.email || "",
              phone: stored.user.phone || null,
              address: null,
              memberSince: "Recently joined",
              avatar: stored.user.avatar || null,
              tickets_count: 0,
              saved_properties_count: 0,
              total_spent: 0,
            }
          : null;
      }

      const response = await getUserProfile(token);
      if (!response.success || !response.data) {
        return null;
      }

      let counts;
      try {
        const countsResp = await getSidebarCounts(token);
        counts = countsResp.data;
      } catch (error) {
        console.warn(
          "Failed to fetch sidebar counts, falling back to profile values:",
          error,
        );
      }

      return mapProfileData(response.data.user, counts);
    },
  });

  const profile = profileQuery.data ?? null;
  const isLoading = profileQuery.isLoading || profileQuery.isFetching;

  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) ?? "";

  const refreshProfile = async () => {
    await profileQuery.refetch();
  };

  const value: DashboardContextType = {
    profile,
    isLoading,
    initials,
    refreshProfile,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
