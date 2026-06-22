import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        backgroundImage: "url('/images/bgg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
          Ready to Find Your Perfect Property?
        </h2>
        <p className="text-[rgba(255,255,255,0.90)] text-sm sm:text-base max-w-md mx-auto mb-8">
          Join thousands of satisfied homeowners who found their dream properties with ExpoVivienda
        </p>

        <Link
          href="/properties"
          className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
        >
          Start Exploring <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}