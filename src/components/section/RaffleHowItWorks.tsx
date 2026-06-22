"use client";

import { ShoppingCart, Mail, Calendar, Home } from "lucide-react";

const raffleSteps = [
  {
    number: 1,
    icon: ShoppingCart,
    title: "Purchase Tickets",
    description:
      "Choose how many tickets you want to purchase. Each ticket is $50 and gives you a chance to win.",
  },
  {
    number: 2,
    icon: Mail,
    title: "Get Your Numbers",
    description:
      "Receive your unique raffle numbers via email immediately after purchase confirmation.",
  },
  {
    number: 3,
    icon: Calendar,
    title: "Wait for the Draw",
    description:
      "The draw will be conducted live and streamed on our social media channels on the specified date.",
  },
  {
    number: 4,
    icon: Home,
    title: "Win Your Dream Home",
    description:
      "If your number is drawn, we'll contact you immediately and handle all the legal transfer paperwork.",
  },
];

export default function RaffleHowItWorks() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            How it Works
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
            Participating in our raffle is simple and transparent. Follow these easy steps to
            enter.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {raffleSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex flex-col items-center text-center group"
              >
                {/* Icon Circle with number badge */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#2664EB] flex items-center justify-center text-white transition-transform group-hover:scale-110">
                    <Icon size={28} />
                  </div>
                  {/* Number badge */}
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[#2664EB] text-[#2664EB] text-xs font-bold flex items-center justify-center shadow-sm">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-[14px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
