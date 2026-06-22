"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAllProperties } from "@/hooks/useProperties";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProperties() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Fetch properties
  const { properties, isLoading: loading, error } = useAllProperties();


  // GSAP animations
  useEffect(() => {
    if (loading || !sectionRef.current || !headingRef.current) return;

    const ctx = gsap.context(() => {
      // Heading: slide up + fade in on scroll
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
            toggleActions: "play none none none",
          },
        }
      );

      // Cards: staggered slide up + fade in
      const cards = cardsRef.current?.querySelectorAll(".property-card");
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [properties, loading]);

  // Helper function to get image URL with fallback
  const getImageUrl = (thumbnail: string | null) => {
    if (thumbnail) {
      return thumbnail.startsWith("http") 
        ? thumbnail 
        : `https://expoviviendas.com/api/${thumbnail}`;
    }
    return "/images/a1.jpg"; // Fallback image
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-[35px] lg:text-[48px] font-bold text-black">Featured Properties</h2>
            <p className="text-gray-500 mt-1">Handpicked premium properties for discerning buyers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                <div className="h-52 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-[35px] lg:text-[48px] font-bold text-black">Featured Properties</h2>
            <p className="text-gray-500 mt-1">Handpicked premium properties for discerning buyers</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 mb-4">Failed to load properties</p>
            <p className="text-gray-500 text-sm">{error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headingRef} className="mb-10" style={{ opacity: 0 }}>
          <h2 className="text-[35px] lg:text-[48px] font-bold text-black">Featured Properties</h2>
          <p className="text-gray-500 mt-1">Handpicked premium properties for discerning buyers</p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="property-card bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              style={{ opacity: 0 }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={getImageUrl(property.thumbnail)}
                  alt={property.title || property.name || ""}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {property.feautured_tag && (
                  <span className="absolute top-3 right-3 bg-white/20 text-black backdrop-blur-[2.5px] shadow-lg text-[14px] font-semibold px-2.5 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-primary-600 font-bold text-[24px] mb-1">
                  {formatPrice(typeof property.price === "string" ? parseFloat(property.price) : property.price || 0)}
                </p>
                <h3 className="font-semibold text-black text-[19px] mb-1 line-clamp-2">
                  {property.title || property.name}
                </h3>
                <div className="flex items-center gap-1 text-gray-400 text-[16px] mb-3">
                  <MapPin size={16} />
                  <span>{property.address}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-gray-500 text-xs border-t border-gray-100 pt-3 mb-4">
                  <span className="flex items-center gap-1">
                    <Bed size={13} /> {property.bedrooms ? `${property.bedrooms.toLocaleString()} bedrooms` : "0 bedrooms"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath size={13} /> {property.bathrooms ? `${property.bathrooms.toLocaleString()} bathrooms` : "0 bathrooms"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize size={13} /> {property.area ? `${property.area.toLocaleString()} m²` : "0 m²"}
                  </span>
                </div>

                <Link
                  href={`/properties/${property.id}`}
                  className="flex items-center justify-end gap-1 text-primary-600 text-[16px] font-medium hover:gap-2 transition-all"
                >
                  View Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
