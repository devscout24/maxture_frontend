"use client";

import { DashboardProvider } from "@/contexts/DashboardContext";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
