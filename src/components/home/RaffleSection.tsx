"use client";

import { useEffect, useState, useRef } from "react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRaffles } from "@/hooks/useRaffles";

gsap.registerPlugin(ScrollTrigger);

// API response type


interface BuyTicketResponse {
  success: boolean;
  message: string;
  data: {
    transaction_id: number;
    stripe_session_id: string;
    checkout_url: string;
    ticket_count: number;
    ticket_numbers: string[];
    amount_cents: number;
  };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function RaffleSection() {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 12,
    hours: 8,
    minutes: 34,
    seconds: 52,
  });

  const { raffles, isLoading: loading } = useRaffles();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  const currentRaffle = raffles.length > 0 ? raffles[0] : null;

  // Refs
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (loading || !sectionRef.current || !headingRef.current) return;

    const ctx = gsap.context(() => {
      const trigger = { toggleActions: "play none none none" };

      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", ...trigger },
        }
      );

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: imageRef.current, start: "top 85%", ...trigger },
          }
        );
      }

      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { x: 60, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: cardRef.current, start: "top 85%", ...trigger },
          }
        );
      }

      const boxes = countdownRef.current?.querySelectorAll(".countdown-box");
      if (boxes && boxes.length > 0) {
        gsap.fromTo(
          boxes,
          { scale: 0.7, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.5)", stagger: 0.1,
            scrollTrigger: { trigger: countdownRef.current, start: "top 88%", ...trigger },
          }
        );
      }

      if (btnRef.current) {
        gsap.fromTo(
          btnRef.current,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.5, ease: "power2.out",
            scrollTrigger: { trigger: btnRef.current, start: "top 92%", ...trigger },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [raffles, loading]);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headingRef} className="text-center mb-10">
          <h2 className="font-display text-5xl font-bold text-gray-900">
            Win Your Dream Home
          </h2>
          <p className="text-gray-500 text-[20px] font-medium mt-1">
            Participate in Our Property Raffles
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 items-center animate-pulse gap-6">
            {/* Image Skeleton */}
            <div className="h-[519px] bg-gray-200 rounded-2xl" />

            {/* Card Skeleton */}
            <div className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] p-[40px] rounded-r-2xl h-[470px] space-y-4">
              {/* Label */}
              <div className="h-4 bg-gray-200 rounded w-1/3" />

              {/* Title */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-2/3" />
              </div>

              {/* Price */}
              <div className="h-4 bg-gray-200 rounded w-1/2" />

              {/* Tickets Info */}
              <div className="h-4 bg-gray-200 rounded w-2/5" />

              {/* Countdown Boxes */}
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 h-20 bg-gray-200 rounded-xl" />
                ))}
              </div>

              {/* Button */}
              <div className="h-11 bg-gray-200 rounded-full" />

              {/* Trust Badges */}
              <div className="flex gap-5 justify-center pt-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ) : currentRaffle ? (
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div ref={imageRef}>
              <Image
                src={currentRaffle.thumbnail || "/images/win1.jpg"}
                alt={currentRaffle.title}
                className="object-cover rounded-2xl"
                width={811}
                height={519}
              />
            </div>
            <div ref={cardRef} className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] p-[40px] rounded-r-2xl h-[470px]">
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">
                Current Raffle
              </span>

              <h3 className="font-bold text-2xl text-gray-900 mt-1 mb-1">
                {currentRaffle.title}
              </h3>

              <p className="text-primary-600 font-semibold text-base mb-4">
                Win this {formatPrice(currentRaffle.price)} Property
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-5">
                <span>Tickets Sold</span>
                <span>
                  {currentRaffle.tickets_sold} / {currentRaffle.max_tickets}
                </span>
              </div>

              <div ref={countdownRef} className="flex gap-3 mb-5">
                {units.map(({ label, value }) => (
                  <div
                    key={label}
                    className="countdown-box flex-1 bg-blue-50 rounded-xl py-3 text-center"
                  >
                    <p className="font-bold text-xl text-primary-600">
                      {String(value).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* ✅ Button with onClick redirect */}
              <button
                ref={btnRef}
                onClick={() => router.push('/raffle')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-full transition-colors mb-3"
              >
                Buy Tickets Now
              </button>

              <div className="flex items-center justify-center gap-5 text-xs text-gray-400">
                <span>⊙ Secure</span>
                <span>⊙ Licensed</span>
                <span>✓ Verified</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No raffle has been found.</p>
          </div>
        )}
      </div>
    </section>
  );
}