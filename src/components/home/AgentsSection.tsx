"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useAgents from "@/hooks/useAgents";

gsap.registerPlugin(ScrollTrigger);

export default function AgentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { agents, isLoading: loading } = useAgents();


  useEffect(() => {
    if (!agents.length) return;

    const ctx = gsap.context(() => {
      const trigger = { toggleActions: "play none none none" };

      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            ...trigger,
          },
        },
      );

      const cards = gridRef.current?.querySelectorAll(".agent-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              ...trigger,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [agents]);

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headingRef}
          className="text-center mb-12"
          style={{ opacity: 0 }}
        >
          <h2 className="font-display text-5xl font-bold text-black">
            Meet Our Expert Agents
          </h2>
          <p className="text-[#4B5563] mt-1 text-[20px]">
            Connect with licensed professionals
          </p>
        </div>

        <div
          ref={gridRef}
          className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:justify-center"
        >
          {loading
            ? // Skeleton cards
            Array.from({ length: 4 }, (_, index) => (
              <div
                key={`skeleton-${index}`}
                className="agent-card w-full lg:w-[280px] bg-[radial-gradient(114.09%_141.5%_at_100%_0%,rgba(30,64,175,0)_0%,rgba(30,64,175,0.05)_100%)] h-[220px] rounded-2xl p-6 text-center"
              >
                {/* Avatar skeleton */}
                <div className="w-20 h-20 mx-auto mb-4 border-4 border-white bg-gray-300 rounded-full animate-pulse"></div>

                {/* Name skeleton */}
                <div className="h-6 bg-gray-300 rounded animate-pulse mt-5 mb-2"></div>

                {/* Title skeleton */}
                <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-3/4 mx-auto"></div>

                {/* Designation skeleton */}
                <div className="h-4 bg-gray-300 rounded animate-pulse mb-7 w-2/3 mx-auto"></div>

                {/* Stats skeleton */}
                <div className="flex justify-around text-center mb-5">
                  <div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-8"></div>
                    <div className="h-3 bg-gray-200 rounded mt-1"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-8"></div>
                    <div className="h-3 bg-gray-200 rounded mt-1"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-8"></div>
                    </div>
                  </div>
                </div>

                {/* Button skeleton */}
                <div className="h-10 bg-gray-300 rounded-full animate-pulse mt-6 w-full"></div>
              </div>
            ))
            : agents.map((agent) => (
              <div
                key={agent.id}
                className="agent-card relative w-full lg:w-[280px] bg-[radial-gradient(114.09%_141.5%_at_100%_0%,rgba(30,64,175,0)_0%,rgba(30,64,175,0.05)_100%)] h-[320px] rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
                style={{ opacity: 0 }}
              >
                {/* Avatar */}
                <div className="mx-auto mb-4 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)] relative">
                  <Image
                    src={agent.avatar}
                    alt={agent.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Name */}
                <h3 className="font-bold text-gray-900 text-base mt-[20px]">
                  {agent.name}
                </h3>

                {/* Button */}
                <Link
                  href={`/agentss/${agent.id}`}
                  className="absolute bottom-8 left-6 right-6 inline-block bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-full transition-colors text-center"
                >
                  View Profile
                </Link>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
