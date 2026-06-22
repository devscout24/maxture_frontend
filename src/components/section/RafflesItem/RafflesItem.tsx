"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// API response type
interface RaffleApiResponse {
  success: boolean;
  message: string;
  raffles: Array<{
    id: number;
    thumbnail: string;
    location: string | null;
    title: string;
    price: number;
    start_date: string;
    dead_line: string;
    draw_date: string;
    tickets_sold: number;
    max_tickets: number;
    ticket_price: number;
  }>;
}

// Calculate time left until deadline
const calculateTimeLeft = (deadline: string, currentTime: Date) => {
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - currentTime.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isOver: false };
};

const CountdownBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl py-3 w-full">
    <span className="text-lg font-semibold text-gray-800">{value}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

const StatusBox = ({
  status,
  variant,
}: {
  status: string;
  variant: "sold-out" | "deadline-over" | "ended";
}) => {
  const getStyles = () => {
    switch (variant) {
      case "sold-out":
        return "bg-red-100 text-red-600";
      case "deadline-over":
        return "bg-orange-100 text-orange-600";
      case "ended":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div
      className={`col-span-4 flex items-center justify-center rounded-xl py-3 w-full ${getStyles()}`}
    >
      <span className="text-lg font-semibold">{status}</span>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 space-y-4 animate-pulse">
    <div className="relative w-full h-[200px] md:h-[280px] rounded-xl overflow-hidden bg-gray-200" />

    <div className="grid grid-cols-4 gap-2 md:gap-4">
      <div className="h-16 bg-gray-200 rounded-xl" />
      <div className="h-16 bg-gray-200 rounded-xl" />
      <div className="h-16 bg-gray-200 rounded-xl" />
      <div className="h-16 bg-gray-200 rounded-xl" />
    </div>

    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" />
    </div>

    <div className="flex justify-between items-center bg-gray-100 rounded-xl p-4">
      <div className="space-y-2">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-3 w-20 bg-gray-200 rounded ml-auto" />
        <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
      </div>
    </div>

    <div className="h-12 w-full bg-gray-200 rounded-full" />
  </div>
);

const Card = ({
  raffle,
  currentTime,
}: {
  raffle: RaffleApiResponse["raffles"][0];
  currentTime: Date;
}) => {
  const timeLeft = calculateTimeLeft(raffle.dead_line, currentTime);
  const isSoldOut = raffle.tickets_sold >= raffle.max_tickets;

  // Determine the status to show
  const getStatusDisplay = () => {
    if (isSoldOut) {
      return <StatusBox status="Sold Out" variant="sold-out" />;
    }

    if (timeLeft.isOver) {
      // Check if draw date is still in the future
      const drawDate = new Date(raffle.draw_date);
      const now = currentTime;
      if (drawDate > now) {
        return (
          <StatusBox
            status="Deadline Over - Wait for Draw"
            variant="deadline-over"
          />
        );
      } else {
        return <StatusBox status="Raffle Ended" variant="ended" />;
      }
    }

    // Show normal countdown
    return (
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <CountdownBox value={String(timeLeft.days)} label="Days" />
        <CountdownBox value={String(timeLeft.hours)} label="Hours" />
        <CountdownBox value={String(timeLeft.minutes)} label="Minutes" />
        <CountdownBox value={String(timeLeft.seconds)} label="Seconds" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 space-y-4">
      <div className="relative w-full h-[200px] md:h-[280px] rounded-xl overflow-hidden">
        <Image
          src={
            raffle.thumbnail ||
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
          }
          alt={raffle.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 text-white">
          <span className="text-xs opacity-80">
            {raffle.location || "Various Locations"}
          </span>
          <h2 className="text-lg md:text-xl font-semibold">{raffle.title}</h2>
          <p className="text-sm">${raffle.price.toLocaleString()}</p>
        </div>
      </div>

      {getStatusDisplay()}

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{raffle.tickets_sold} sold</span>
          <span>{raffle.max_tickets - raffle.tickets_sold} remaining</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{
              width: `${(raffle.tickets_sold / raffle.max_tickets) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center bg-gray-100 rounded-xl p-4">
        <div>
          <p className="text-xs text-gray-500">Ticket Price</p>
          <p className="font-semibold text-blue-600">${raffle.ticket_price}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Tickets</p>
          <p className="font-semibold text-gray-800">{raffle.max_tickets}</p>
        </div>
      </div>

      <Link
        href={`/raffle/${raffle.id}`}
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-sm font-medium transition text-center"
      >
        View Details
      </Link>
    </div>
  );
};

export default function RafflesItem() {
  const [raffles, setRaffles] = useState<RaffleApiResponse["raffles"]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

  // Set up timer to update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/raffle/index`, {
          headers: {
            "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });

        if (!response.ok) {
          setError(`Failed to load raffles (${response.status})`);
          return;
        }

        const data: RaffleApiResponse = await response.json();
        if (data.success) {
          setRaffles(data.raffles);
        } else {
          console.error("API response unsuccessful:", data);
          setError("Failed to load raffles: API error");
        }
      } catch (error) {
        console.error("Error fetching raffles:", error);
        setError("Failed to fetch raffles: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, []);

  return (
    <section className="bg-[#F9FAFB] mt-10">
      <main className="min-h-screen flex flex-col items-center px-4 py-8 md:py-12">
        <div className="max-w-2xl w-full text-center space-y-3 mb-6">
          <span className="inline-block text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            Active Raffles · Win Your Dream Home
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            Win a Luxury Home
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Enter our exclusive property raffle for a chance to win a stunning
            home worth $3,250,000. Limited tickets available!
          </p>
        </div>

        {loading ? (
          <div className="w-full max-w-2xl space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <SkeletonCard key={`raffle-skeleton-${index}`} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : raffles.length > 0 ? (
          <div className="w-full max-w-2xl space-y-6">
            {raffles.map((raffle) => (
              <Card key={raffle.id} raffle={raffle} currentTime={currentTime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No raffles available at the moment.</p>
          </div>
        )}
      </main>
    </section>
  );
}
