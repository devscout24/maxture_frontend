"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";

// Social media API response type
interface SocialResponse {
  success: boolean;
  data: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    office?: string;
    phone?: string;
    email?: string;
  };
}

const socialIcons: { [key: string]: any } = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

const companyLinks = [
  { label: "About Us", href: "/about-page" },
  { label: "Our Agents", href: "/agentss" },
  { label: "Raffles", href: "/raffle" },
  { label: "Contacts", href: "/contact" },
];

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialResponse["data"]>({});
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/footer/get-socials`);

        if (response.ok) {
          const data: SocialResponse = await response.json();
          if (data.success && data.data) {
            setSocialLinks(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  const socialEntries = [
    ["facebook", socialLinks.facebook],
    ["instagram", socialLinks.instagram],
    ["twitter", socialLinks.twitter],
    ["linkedin", socialLinks.linkedin],
  ].filter(([, url]) => Boolean(url)) as Array<[string, string]>;

  return (
    <footer className="bg-navy-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-display font-bold text-xl text-white mb-3">
              EXPOVIVIENDA
            </p>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Your trusted partner for finding premium properties in Dominican
              Republic.
            </p>
            <div className="flex gap-4 mt-5">
              {socialEntries.map(([platform, url]) => {
                const Icon = socialIcons[platform.toLowerCase()];
                if (!Icon) {
                  return null;
                }

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition-colors"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <p className="text-white font-semibold uppercase text-xs tracking-widest mb-4">
              Company
            </p>
            <ul className="space-y-2">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white font-semibold uppercase text-xs tracking-widest mb-4">
              Contact
            </p>
            <ul className="space-y-3">
              {socialLinks.office ? (
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-primary-400"
                  />
                  <span>{socialLinks.office}</span>
                </li>
              ) : null}
              {socialLinks.phone ? (
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone size={14} className="shrink-0 text-primary-400" />
                  <span>{socialLinks.phone}</span>
                </li>
              ) : null}
              {socialLinks.email ? (
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail size={14} className="shrink-0 text-primary-400" />
                  <span>{socialLinks.email}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {currentYear} ExpoVivienda. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
