"use client";

import { useRef } from "react";
import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import Image from "next/image";

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };

  const onMouseLeave = () => { isDown.current = false; };
  const onMouseUp = () => { isDown.current = false; };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            What Our Clients Say
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Real stories from satisfied homeowners
          </p>
        </div>

        {/* Draggable Scrollable Cards */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className="flex gap-6 overflow-x-auto cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="border border-gray-100 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow shrink-0
                w-[85vw] sm:w-[45vw] lg:w-[calc(33.333%-16px)]"
            >
              {/* Stars */}
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="text-[#2664EB] fill-[#2664EB]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  "{t.content}"
                </p>
              </div>

              {/* User */}
              <div className="flex items-center gap-3">
                <Image
                  src={t.userAvatar}
                  alt={t.userName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.userName}</p>
                  <p className="text-xs text-gray-400">{t.userLocation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}