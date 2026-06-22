"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Target, CheckCircle, Globe } from "lucide-react";
import CTASection from "@/components/home/CTASection";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// --- Static fallback data (same as before) ---
const defaultStats = [
  { value: "12,000+", label: "Happy Clients" },
  { value: "8,500+", label: "Properties Sold" },
  { value: "250+", label: "Expert Agents" },
  { value: "$2.5B+", label: "Total Sales" },
];

const defaultPurposes = [
  {
    icon: <Target size={20} className="text-primary-600" />,
    title: "Our Vision",
    description:
      "To become the most trusted real estate platform in the Caribbean, connecting buyers with their perfect properties through innovation and transparency.",
  },
  {
    icon: <CheckCircle size={20} className="text-primary-600" />,
    title: "Our Mission",
    description:
      "To simplify the property buying experience by providing cutting-edge virtual tools, expert guidance, and exclusive access to premium listings.",
  },
  {
    icon: <Globe size={20} className="text-primary-600" />,
    title: "Our Values",
    description:
      "Integrity, transparency, and excellence drive everything we do. We believe everyone deserves access to quality real estate services.",
  },
];

const journey = [
  {
    year: "2019",
    title: "Platform Launch",
    description:
      "ExpoVivienda was founded with a vision to transform Dominican Republic real estate market.",
  },
  {
    year: "2020",
    title: "First Virtual Expo",
    description:
      "Launched our first virtual property fair, connecting 50+ developers with thousands of buyers.",
  },
  {
    year: "2021",
    title: "Raffle Innovation",
    description:
      "Introduced property raffles, making homeownership accessible to more Dominicans.",
  },
  {
    year: "2022",
    title: "Market Expansion",
    description:
      "Expanded to cover all major cities and coastal areas across the Dominican Republic.",
  },
  {
    year: "2023",
    title: "International Growth",
    description:
      "Reached 10,000+ properties listed and attracted international investors from 30+ countries.",
  },
  {
    year: "2024",
    title: "Industry Leader",
    description:
      "Became the #1 digital real estate platform in the Dominican Republic with 250+ partner developers.",
  },
];

const TeamSkeletonCard = () => (
  <div className="team-card bg-white rounded-2xl overflow-hidden animate-pulse">
    <div className="w-full h-[280px] bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

// --- Types ---
interface TeamItem {
  id: number;
  name: string;
  designation: string;
  description: string;
  image: string;
  order: number;
}

interface CardPro {
  id: number;
  number: string;
  name: string;
}

interface Purpose {
  id: number;
  title: string;
  description: string;
}

const IMAGE_BASE_URL = "https://expoviviendas.com/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function AboutSection() {
  const [teamItems, setTeamItems] = useState<TeamItem[]>([]);
  const [cardPro, setCardPro] = useState<CardPro[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("teamItems", teamItems);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const purposeRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const res = await fetch(`${API_BASE_URL}/about-us/get`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const json = await res.json();
        console.log("API Response:", json);

        if (json.success && json.data) {
          const { cardPro, purposes, team } = json.data;
          if (cardPro?.length) setCardPro(cardPro);
          if (purposes?.length) setPurposes(purposes);
          if (team?.team_items?.length) setTeamItems(team.team_items);
        } else {
          setError("Failed to load data");
        }
      } catch (err) {
        console.error("Failed to fetch about data:", err);
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            setError("Request timeout - please refresh");
          } else {
            setError("Failed to load data");
          }
        } else {
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Hero animations
      if (document.querySelector(".hero-title")) {
        gsap.from(".hero-title", {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });
      }
      if (document.querySelector(".hero-desc")) {
        gsap.from(".hero-desc", {
          y: 40,
          opacity: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
        });
      }
      if (document.querySelector(".hero-btns")) {
        gsap.from(".hero-btns", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out",
        });
      }

      // Section animations with ScrollTrigger
      if (document.querySelector(".stat-card")) {
        gsap.from(".stat-card", {
          scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
        });
      }

      if (document.querySelector(".purpose-card")) {
        gsap.from(".purpose-card", {
          scrollTrigger: { trigger: purposeRef.current, start: "top 85%" },
          y: 50,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
        });
      }

      if (document.querySelector(".purpose-heading")) {
        gsap.from(".purpose-heading", {
          scrollTrigger: { trigger: purposeRef.current, start: "top 90%" },
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      }

      if (document.querySelector(".team-card")) {
        gsap.from(".team-card", {
          scrollTrigger: { trigger: teamRef.current, start: "top 85%" },
          y: 60,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
        });
      }

      if (document.querySelector(".journey-card")) {
        gsap.from(".journey-card", {
          scrollTrigger: { trigger: journeyRef.current, start: "top 85%" },
          x: (i) => (i % 2 === 0 ? -60 : 60),
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
        });
      }

      if (document.querySelector(".journey-dot")) {
        gsap.from(".journey-dot", {
          scrollTrigger: { trigger: journeyRef.current, start: "top 85%" },
          scale: 0,
          opacity: 0,
          duration: 0.5,
          stagger: 0.2,
          ease: "back.out(2)",
        });
      }
    });
    return () => ctx.revert();
  }, [loading, teamItems, cardPro, purposes]);

  // Use API data if available, otherwise fallback to static
  const stats =
    cardPro.length > 0
      ? cardPro.map((c) => ({ id: c.id, value: c.number, label: c.name }))
      : defaultStats.map((s, i) => ({ id: i, value: s.value, label: s.label }));

  const teamList = teamItems.map((m) => ({
    id: String(m.id),
    name: m.name,
    title: m.designation,
    avatar: `${IMAGE_BASE_URL}/${m.image}`,
    bio: m.description,
  }));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16">
        {/* Hero */}
        <section
          className="bg-blue-50 py-16 md:py-20 text-center px-4"
          ref={heroRef}
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="hero-title text-2xl sm:text-3xl md:text-[56px] font-bold text-gray-900 mb-4 md:leading-[61px]">
              Transforming Real Estate in
              <br /> the Dominican Republic
            </h1>
            <p className="hero-desc text-gray-500 mt-[20px] text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              ExpoVivienda was created to connect buyers with premium properties
              through innovative virtual technology, expert guidance, and
              exclusive raffle opportunities.
            </p>
            <div className="hero-btns flex gap-3 justify-center">
              <a
                href="/properties"
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                Explore Properties
              </a>
              <a
                href="/contact"
                className="border border-gray-300 hover:border-primary-600 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Stats */}
          <div
            ref={statsRef}
            className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-12"
          >
            {stats.length > 0 ? (
              stats.map((s) => (
                <div
                  key={s.id}
                  className="stat-card text-center bg-white pt-[32px] pb-[60px] px-[77px] rounded-[16px] bg-transparent shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]"
                >
                  <p className="text-[32px] mb-[8px] font-bold text-[#2664EB]">
                    {s.value}
                  </p>
                  <p className="text-[#4B5563] text-[14px] font-medium mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 py-8">No data found</p>
            )}
          </div>
        </section>

        {/* Our Purpose */}
        <section className="py-16 md:py-20 bg-white" ref={purposeRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="purpose-heading text-center mb-12">
              <h2 className="text-2xl sm:text-5xl font-bold text-gray-900">
                Our Purpose
              </h2>
              <p className="text-[#4B5563] text-sm mt-2">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {purposes.length > 0 ? (
                purposes.map((p) => (
                  <div
                    key={p.id}
                    className="purpose-card bg-blue-50 rounded-2xl p-6"
                  >
                    <h3 className="font-bold text-gray-900 text-sm mb-2">
                      {p.title}
                    </h3>
                    <div
                      className="text-gray-500 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: p.description }}
                    />
                  </div>
                ))
              ) : !loading ? (
                <div className="col-span-1 sm:col-span-3 text-center py-8">
                  <p className="text-gray-600">No data found</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="py-16 md:py-20 bg-gray-50" ref={teamRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Meet Our Team
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Dedicated professionals committed to finding your perfect
                property
              </p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <TeamSkeletonCard key={`team-skeleton-${index}`} />
                ))}
              </div>
            ) : teamList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamList.map((member) => (
                  <div
                    key={member.id}
                    className="team-card bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="overflow-hidden">
                      {/* Using <img> instead of Next Image to avoid domain config issues */}
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-[280px] object-cover object-top hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-black font-semibold text-[20px]">
                        {member.name}
                      </h3>
                      <p className="text-[#2664EB] text-[14px] font-medium mt-0.5 mb-2">
                        {member.title}
                      </p>
                      <div
                        className="text-[#4B5563] text-[14px] leading-[21px]"
                        dangerouslySetInnerHTML={{ __html: member.bio }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  There is no team member yet
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Our Journey — fully static, unchanged */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-[48px] font-bold text-black">
                Our Journey
              </h2>
              <p className="text-[#4B5563] text-[17px] mt-4 max-w-2xl mx-auto">
                Milestones that shaped ExpoVivienda into the leading platform it
                is today
              </p>
            </div>

            <div className="relative" ref={journeyRef}>
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 lg:left-1/2 lg:-translate-x-1/2" />
              <div className="space-y-8 md:space-y-10">
                {journey.map((item, i) => (
                  <div
                    key={item.year}
                    className="relative lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start"
                  >
                    <div
                      className={
                        i % 2 === 0 ? "lg:pr-10" : "lg:pr-10 lg:order-2"
                      }
                    >
                      <div
                        className={
                          "journey-card ml-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:ml-0 " +
                          (i % 2 === 0 ? "lg:text-right" : "")
                        }
                      >
                        <p className="text-[#2664EB] font-bold text-2xl mb-1">
                          {item.year}
                        </p>
                        <h3 className="font-bold text-black text-[18px] mb-2">
                          {item.title}
                        </h3>
                        <p className="text-[#4B5563] text-[14px] leading-[21px]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={
                        i % 2 === 0
                          ? "lg:pl-10"
                          : "hidden lg:block lg:pl-10 lg:order-1"
                      }
                    />
                    <div className="journey-dot absolute left-3 top-6 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-primary-600 shadow lg:left-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <CTASection />
      <Footer />
    </>
  );
}
