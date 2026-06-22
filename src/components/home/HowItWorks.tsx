import { Search, CalendarCheck, Home } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: <Search size={24} />,
    title: "Search Properties",
    description:
      "Browse our extensive collection of premium properties across the Dominican Republic using advanced filters",
  },
  {
    number: 2,
    icon: <CalendarCheck size={24} />,
    title: "Schedule Tours",
    description:
      "Book virtual or in-person tours with our expert agents and explore properties in detail",
  },
  {
    number: 3,
    icon: <Home size={24} />,
    title: "Find Your Home",
    description:
      "Complete your purchase with our guidance and move into your dream property",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            How ExpoVivienda Works
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Your journey to finding the perfect property
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              {/* Icon Circle with number badge */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-[#1E40AF] flex items-center justify-center text-white">
                  {step.icon}
                </div>
                {/* Number badge */}
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white text-[#2664EB] text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 text-base mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[#4B5563] text-[16px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}