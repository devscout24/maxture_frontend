"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import useAuth from "@/hooks/useAuth";
import { getUserProfile, getAuthToken } from "@/lib/api";
import Image from "next/image";

// Client-side component for auth-dependent navigation
function AuthButton({
  isLoggedIn,
  user,
  userProfile,
  className,
}: {
  isLoggedIn: boolean;
  user: any;
  userProfile: any;
  className?: string;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultClassName =
    "bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 transition-colors rounded-[999px]";
  const finalClassName = className || defaultClassName;

  if (!isClient) {
    // Show login button on server to prevent hydration mismatch
    return (
      <Link href="/login" className={finalClassName}>
        Login/Signup
      </Link>
    );
  }

  return isLoggedIn ? (
    <div className="flex items-center gap-3">
      <Link
        href={user?.role === "agent" ? "/agent-dashboard" : "/dashboard"}
        className={finalClassName}
      >
        Dashboard
      </Link>
      {userProfile?.avatar && (
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={userProfile.avatar}
            alt="Profile"
            className="w-full h-full object-cover"
            width={32}
            height={32}
          />
        </div>
      )}
    </div>
  ) : (
    <Link href="/login" className={finalClassName}>
      Login/Signup
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { isLoggedIn, user } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Fetch user profile data when logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        try {
          const token = getAuthToken();
          if (!token) return;

          // Google sessions use mock tokens — skip API call to avoid 401 forceLogout
          if (token.startsWith("google:") || token.startsWith("google-jwt:")) {
            const stored = localStorage.getItem("expovivienda_auth_session");
            if (stored) {
              const parsed = JSON.parse(stored);
              setUserProfile(parsed.user || null);
            }
            return;
          }

          const response = await getUserProfile(token);
          if (response.success && response.data) {
            setUserProfile(response.data.user);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn]);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const hasSolidNav = !isHome || isScrolled;

  const navShellClass = hasSolidNav
    ? "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
    : "fixed top-0 left-0 right-0 z-50 bg-[rgba(255,255,255,0.16)] backdrop-blur-[8px]";

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActiveLink(href)
        ? href === "/" && isHome
          ? hasSolidNav
            ? "text-gray-900 font-bold"
            : "text-white font-bold"
          : "text-primary-600"
        : hasSolidNav
          ? "text-gray-700 hover:text-gray-900"
          : "text-white/70 hover:text-white"
    }`;

  return (
    <nav className={navShellClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className={`font-display font-bold text-xl tracking-wide ${
              hasSolidNav ? "text-gray-900" : "text-white"
            }`}
          >
            EXPOVIVIENDA
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <AuthButton
              isLoggedIn={isLoggedIn}
              user={user}
              userProfile={userProfile}
            />
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 transition-colors ${
              hasSolidNav ? "text-gray-700" : "text-white"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-2 text-sm font-medium ${
                isActiveLink(link.href)
                  ? "text-primary-600"
                  : "text-gray-700 hover:text-primary-600"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3">
            <AuthButton
              isLoggedIn={isLoggedIn}
              user={user}
              userProfile={userProfile}
              className="block text-center bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg w-full"
            />
          </div>
        </div>
      )}
    </nav>
  );
}
