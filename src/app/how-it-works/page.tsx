import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Ticket,
  BellRing,
  Home,
  BadgeCheck,
  ArrowRight,
  Sparkles,
  CalendarCheck2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | ExpoVivienda",
  description:
    "Learn how ExpoVivienda works, from browsing properties to winning a dream home through raffles.",
};

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search Properties",
    description:
      "Browse verified homes, fair listings, and raffle properties using the search and filter tools.",
  },
  {
    number: "02",
    icon: Ticket,
    title: "Join a Raffle",
    description:
      "Pick the property you like, review the prize details, and secure your raffle tickets.",
  },
  {
    number: "03",
    icon: BellRing,
    title: "Get Notified",
    description:
      "Receive updates about your tickets, draw status, and winner announcements in your dashboard.",
  },
  {
    number: "04",
    icon: CalendarCheck2,
    title: "Live Draw Day",
    description:
      "The draw is held live and the results are published transparently for all participants.",
  },
  {
    number: "05",
    icon: BadgeCheck,
    title: "Claim the Prize",
    description:
      "If you win, our team coordinates the transfer process and guides you through the final steps.",
  },
  {
    number: "06",
    icon: Home,
    title: "Move In",
    description:
      "Complete the paperwork and get ready to enjoy your new home with full support from our team.",
  },
];

const highlights = [
  {
    title: "Transparent process",
    description: "Every step is visible and easy to follow from your account.",
  },
  {
    title: "Verified listings",
    description: "All featured properties are reviewed before they go live.",
  },
  {
    title: "Live announcements",
    description: "Winners are announced with clear, public draw results.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-[#F9FAFB] min-h-screen">
      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(38,100,235,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(30,64,175,0.08),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-[#2664EB] mb-5">
              <Sparkles size={14} />
              Simple, transparent, and fair
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              How ExpoVivienda Works
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed">
              From browsing premium properties to winning a raffle, everything is designed
              to be clear, secure, and easy to follow.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-10 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.number}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2664EB] text-white shadow-sm">
                        <Icon size={22} />
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-[#2664EB]">
                        {step.number}
                      </span>
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-gray-900">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {step.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <aside className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="rounded-2xl bg-gradient-to-br from-[#2664EB] to-[#1E40AF] p-6 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                  <Sparkles size={16} />
                  Why people trust us
                </div>
                <h2 className="mt-3 text-2xl font-bold leading-tight">
                  A clean path from discovery to ownership.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/85">
                  ExpoVivienda keeps the property journey easy to understand, with
                  clear listings, live raffle tracking, and transparent winner updates.
                </p>

                <div className="mt-6 space-y-3">
                  {highlights.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                    >
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/80">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-100 bg-[#F8FAFF] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Home size={16} className="text-[#2664EB]" />
                  Ready to explore properties?
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Start with the property listings, then move into raffles when you find
                  the home you want.
                </p>
                <Link
                  href="/properties"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2664EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF]"
                >
                  Browse Properties
                  <ArrowRight size={16} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}