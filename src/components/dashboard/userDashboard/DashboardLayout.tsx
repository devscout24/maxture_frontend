"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import {
  Award,
  Grid3x3,
  Heart,
  LogOut,
  Menu,
  Ticket,
  User,
  X,
} from "lucide-react";


import useAuth from "@/hooks/useAuth";
import { useDashboard } from "@/contexts/DashboardContext";
import Image from "next/image";

type AccountLink = {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: number;
};

type DashboardLayoutProps = {
  children: ReactNode;
  /** User's display initials for the avatar */
  initials?: string;
  /** Counts to display as badge numbers on sidebar links */
  ticketsCount?: number;
  savedCount?: number;
};

const quickLinks = [
  { label: "Browse Raffles", href: "/raffle", icon: <Award size={14} /> },
  { label: "All Listings", href: "/properties", icon: <Grid3x3 size={14} /> },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  const pathname = usePathname();
  const { logout } = useAuth();
  const { profile, initials } = useDashboard();
  const normalizedPath = (pathname || "").replace(/\/$/, "");

  const [sidebarOpen, setSidebarOpen] = useState(false);


  const accountLinks: AccountLink[] = [
    {
      key: "profile",
      label: "Profile",
      icon: <User size={14} />,
      href: "/dashboard",
    },
    {
      key: "saved",
      label: "Saved",
      icon: <Heart size={14} />,
      href: "/dashboard/saved",
      badge: profile?.saved_properties_count || 0,
    },
    {
      key: "tickets",
      label: "Raffle Tickets",
      icon: <Ticket size={14} />,
      href: "/dashboard/raffle-tickets",
      badge: profile?.tickets_count || 0,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <Link
              href="/"
              className="font-bold text-xl text-[#1B2B5E] tracking-wide"
            >
              EXPOVIVIENDA
            </Link>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-5">
            {[
              { label: "Home", href: "/" },
              { label: "Properties", href: "/properties" },
              { label: "Virtual Expo", href: "/virtual-expo" },
              { label: "Raffles", href: "/raffles" },
              { label: "Agents", href: "/agents" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center">
              {searchOpen && (
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none w-36 sm:w-52 mr-2 focus:border-primary-600 transition-all"
                />
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
            </div> */}

            <Link
              href="/properties"
              className="hidden sm:block bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              List Property
            </Link>

            {profile?.avatar ? (
              <Image
                src={profile.avatar}
                alt="User Avatar"
                className="w-9 h-9 rounded-full object-fit shrink-0"
                width={36}
                height={36}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1B2B5E] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div
        className="bg-[#1B2B5E] pt-20 pb-20 text-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bgg.jpg')" }}
      >
        <h1 className="text-2xl sm:text-5xl font-bold text-white pt-10">
          My Dashboard
        </h1>
        <p className="text-white/60 text-[20px] mt-2">
          Manage your properties, tickets, and account settings
        </p>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-6 relative">
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside
            className={`
              fixed top-0 left-0 h-full w-64 bg-white z-40 shadow-xl pt-20 px-5 transition-transform duration-300
              lg:static lg:w-auto lg:h-fit lg:shadow-sm lg:pt-4 lg:px-4 lg:translate-x-0 lg:z-auto
              lg:rounded-2xl lg:border lg:border-gray-100
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-end mb-4">
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <p className="text-[20px] font-bold text-[#4B5563] uppercase tracking-widest mb-3">
              Account
            </p>

            <ul className="space-y-1.5 mb-6">
              {accountLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${normalizedPath === item.href
                      ? "bg-blue-50 text-primary-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span className="bg-[#EFF3FF] text-[#2664EB] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-[11px] font-bold text-[#4B5563] uppercase tracking-widest mb-3">
              Quick Links
            </p>
            <ul className="space-y-1.5 mb-4">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </aside>

          {/* ── Page Content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
