import type { Metadata } from "next";
import { Inter, Outfit, Geist } from "next/font/google";
import "swiper/css";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { GoogleAuthSync } from "@/providers/GoogleAuthSync";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ExpoVivienda | Discover Your Dream Property in the Dominican Republic",
  description:
    "Explore premium real estate, participate in virtual fairs, and win your dream home via raffles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <QueryProvider>
          <NextAuthProvider>
            <GoogleAuthSync />
            {children}
            <Toaster />
          </NextAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}