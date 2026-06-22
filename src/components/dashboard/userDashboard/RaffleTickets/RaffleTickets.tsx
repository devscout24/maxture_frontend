"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/userDashboard/DashboardLayout";
import { useDashboard } from "@/contexts/DashboardContext";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";


import { getMyTickets, type MyTicketItem } from "@/lib/api";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function resolveTicketTitle(item: MyTicketItem) {
  return (
    item.title || item.property_title || item.name || item.property?.title || ""
  );
}

function resolveTicketLocation(item: MyTicketItem) {
  return item.location || item.address || item.property?.address || "";
}

function resolveTicketImage(item: MyTicketItem) {
  return item.image || item.thumbnail || item.property?.thumbnail || "";
}

function resolveTicketDate(item: MyTicketItem) {
  return item.raffleDrawDate || item.raffle_draw_date || item.draw_date || "";
}

function resolveTicketNumber(item: MyTicketItem) {
  return item.ticketNumber || item.ticket_number || "";
}

function resolveWinner(item: MyTicketItem) {
  return item.winner ?? item.is_winner ?? false;
}

export default function RaffleTickets() {
  const { profile } = useDashboard();

  const [hasMounted, setHasMounted] = useState(false);



  useEffect(() => {
    setHasMounted(true);
  }, []);

  const ticketsQuery = useQuery({
    queryKey: ["my-tickets"],
    queryFn: () => getMyTickets(),
    enabled: hasMounted,
    staleTime: 5 * 60 * 1000,
  });

  const tickets = ticketsQuery.data?.data.tickets ?? [];
  const isLoading = hasMounted && ticketsQuery.isLoading;

  return (
    <DashboardLayout
      ticketsCount={profile?.tickets_count || 0}
      savedCount={profile?.saved_properties_count || 0}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Raffle Tickets</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {tickets.length} tickets available
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="animate-pulse overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Property",
                    "Raffle Draw Date",
                    "Ticket Number",
                    "Winner",
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 2, 3, 4].map((row) => (
                  <tr key={row}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
                        <div className="h-4 w-40 rounded bg-gray-100" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-28 rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-32 rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-12 rounded-full bg-gray-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          No Ticket is there.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Property",
                  "Raffle Draw Date",
                  "Ticket Number",
                  "Winner",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {tickets.map((item) => {
                const title = resolveTicketTitle(item);
                const location = resolveTicketLocation(item);
                const image = resolveTicketImage(item);
                const raffleDate = resolveTicketDate(item);
                const ticketNumber = resolveTicketNumber(item);
                const winner = resolveWinner(item);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {image ? (
                          <Image
                            src={image}
                            alt={title || "Ticket property"}
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                            width={44}
                            height={44}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {title || "Untitled Property"}
                          </p>
                          {location ? (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {location}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900 text-sm">
                        {raffleDate ? formatDate(raffleDate) : "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-mono text-sm text-gray-900 font-medium">
                        {ticketNumber || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          winner
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {winner ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
