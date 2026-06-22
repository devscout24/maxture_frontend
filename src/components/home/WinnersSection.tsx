"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getWinners, type WinnerItem } from "@/lib/api";

function getWinnerAvatarUrl(winner: WinnerItem): string | null {
  if (!winner.avatar) return null;
  return winner.avatar.startsWith("http") ? winner.avatar : `https://backend.expoviviendas.com/${winner.avatar.replace(/^\/+/, "")}`;
}

function getWinnerInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatWinnerDate(drawDate: string): string {
  const date = new Date(drawDate);
  if (Number.isNaN(date.getTime())) {
    return drawDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function WinnersSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["winners"],
    queryFn: getWinners,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const winners = data?.data?.items ?? [];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Our Happy Winners
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-2xl mx-auto">
            Join the growing list of people who have won their dream homes through ExpoVivienda raffles.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-24 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Failed to load winners.
          </div>
        ) : winners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No winners found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner) => {
              const avatarUrl = getWinnerAvatarUrl(winner);
              return (
                <article
                  key={`${winner.winner_name}-${winner.property_title}-${winner.draw_date}`}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={winner.winner_name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2664EB] to-[#1E40AF] text-white">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/15 text-3xl font-bold backdrop-blur-sm">
                          {getWinnerInitials(winner.winner_name)}
                        </div>
                      </div>
                    )}

                    <div className="absolute right-3 top-3 rounded-full bg-[#2664EB] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                      Winner
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      {winner.winner_name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      <span>{formatWinnerDate(winner.draw_date)}</span>
                    </div>

                    <div className="mt-4 rounded-xl bg-blue-50/80 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        Prize Won
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                        {winner.property_title}
                      </p>
                      <p className="mt-1 text-base font-bold text-[#2664EB]">
                        {formatPrice(Number(winner.property_price) || 0)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                      <MapPin size={12} className="mt-0.5 shrink-0 text-[#2664EB]" />
                      <span>{winner.property_address}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
