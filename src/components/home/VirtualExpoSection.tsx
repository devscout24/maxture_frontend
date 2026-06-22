"use client";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function VirtualExpoSection() {
  const features = [
    "Live property tours",
    "Meet developers",
    "Exclusive deals",
    "Interactive Q&A",
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const triggerDefaults = {
        toggleActions: "play none none none",
      };

      // Heading
      gsap.fromTo(
        headingRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            ...triggerDefaults,
          },
        },
      );

      // Paragraph
      gsap.fromTo(
        paraRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: paraRef.current,
            start: "top 85%",
            ...triggerDefaults,
          },
        },
      );

      // List items staggered
      const items = listRef.current?.querySelectorAll("li");
      if (items) {
        gsap.fromTo(
          items,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: listRef.current,
              start: "top 85%",
              ...triggerDefaults,
            },
          },
        );
      }

      // Button
      gsap.fromTo(
        btnRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: btnRef.current,
            start: "top 90%",
            ...triggerDefaults,
          },
        },
      );

      // Image: slide in from right
      gsap.fromTo(
        imageColRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageColRef.current,
            start: "top 85%",
            ...triggerDefaults,
          },
        },
      );

      // Badge: pop in after image
      gsap.fromTo(
        badgeRef.current,
        { scale: 0.6, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: imageColRef.current,
            start: "top 80%",
            ...triggerDefaults,
          },
          delay: 0.4,
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div ref={textColRef}>
            <h2
              ref={headingRef}
              className="font-display text-3xl font-bold text-[#0F172A] mb-4"
              style={{ opacity: 0 }}
            >
              Experience Virtual Property Fairs
            </h2>
            <p
              ref={paraRef}
              className="text-gray-600 mb-6"
              style={{ opacity: 0 }}
            >
              Join our innovative virtual real estate expos and explore hundreds
              of properties from the comfort of your home. Connect with
              developers, attend live tours, and discover exclusive deals
              available only during our events.
            </p>
            <ul ref={listRef} className="space-y-3 mb-8 grid grid-cols-2 gap-3">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-gray-700 text-[20px]"
                  style={{ opacity: 0 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M10 20C11.36 20 12.66 19.74 13.9 19.22C15.0867 18.7133 16.1433 17.9967 17.07 17.07C17.9967 16.1433 18.7133 15.0867 19.22 13.9C19.74 12.66 20 11.36 20 10C20 8.64 19.74 7.34 19.22 6.1C18.7133 4.91333 17.9967 3.85667 17.07 2.93C16.1433 2.00333 15.0867 1.28667 13.9 0.780001C12.66 0.26 11.36 0 10 0C8.64 0 7.34 0.26 6.1 0.780001C4.91333 1.28667 3.85667 2.00333 2.93 2.93C2.00333 3.85667 1.28667 4.91333 0.78 6.1C0.26 7.34 0 8.64 0 10C0 11.36 0.26 12.66 0.78 13.9C1.28667 15.0867 2.00333 16.1433 2.93 17.07C3.85667 17.9967 4.91333 18.7133 6.1 19.22C7.34 19.74 8.64 20 10 20ZM15.46 7.46L9 13.92L4.8 9.7L6.2 8.3L9 11.08L14.04 6.04L15.46 7.46Z"
                      fill="#10B981"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {/* <Link
              ref={btnRef}
              href="/virtual-expo"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white text-[16px] font-bold px-6 py-3 rounded-[999px] transition-colors"
              style={{ opacity: 0 }}
            >
              Explore Current Expos
            </Link> */}
          </div>

          <div ref={imageColRef} className="relative" style={{ opacity: 0 }}>
            <Image
              src="/images/exper1.jpg"
              alt="Virtual Expo"
              className="rounded-2xl shadow-xl object-cover"
              width={492}
              height={572}
            />
            <div
              ref={badgeRef}
              className="absolute bottom-[32px] right-36 bg-white rounded-xl px-4 py-3 shadow-lg text-center"
              style={{ opacity: 0 }}
            >
              <p className="text-xs text-gray-500">Coming Soon...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
