"use client";

import { useState, useEffect } from "react";
import { Search, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import CTASection from "@/components/home/CTASection";
import Image from "next/image";

// API response type
interface AgentsApiResponse {
  success: boolean;
  message: string;
  data: {
    agents: Array<{
      id: number;
      name: string;
      avatar: string;
      role?: string;
      title?: string;
      rating?: number;
    }>;
    stats: {
      total_agents: number;
      total_properties: number;
    };
  };
}

const filters = ["All", "Agents", "Developers", "Luxury Specialists"];

export default function AgentsPages() {
  const [agents, setAgents] = useState<AgentsApiResponse["data"]["agents"]>([]);
  const [stats, setStats] = useState<AgentsApiResponse["data"]["stats"]>({
    total_agents: 0,
    total_properties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/agent/get-agents`);

        if (!response.ok) {
          throw new Error(`Failed to fetch agents: ${response.status}`);
        }

        const data: AgentsApiResponse = await response.json();

        if (data.success && data.data) {
          setAgents(data.data.agents);
          setStats(data.data.stats);
        } else {
          throw new Error(data.message || "Failed to load agents");
        }
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError(err instanceof Error ? err.message : "Failed to load agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.title && a.title.toLowerCase().includes(search.toLowerCase())),
  );

  // Stats for display
  const displayStats = [
    {
      value: stats.total_agents.toString(),
      label: "Expert Agents",
      color: "text-primary-600",
      bg: "bg-blue-50",
    },
    {
      value: stats.total_properties.toString(),
      label: "Properties Listed",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Our Expert Agents & Developers
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
              Connect with experienced real estate professionals who know the
              Dominican Republic market inside and out
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2  gap-4 mb-10">
            {displayStats.map((s) => (
              <div
                key={s.label}
                className={`${s.bg} rounded-2xl p-5 text-center`}
              >
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            {/* <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 w-full sm:w-72">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by agent name"
                className="text-sm text-gray-700 outline-none w-full placeholder:text-gray-400"
              />
            </div> */}

            {/* Filter Tabs */}
            {/* <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === f
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div> */}
          </div>

          {/* Agents Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`agent-skeleton-${index}`}
                  className="border border-gray-100 rounded-2xl p-6 text-center animate-pulse"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-200" />
                  <div className="h-4 w-24 mx-auto bg-gray-200 rounded" />
                  <div className="h-3 w-20 mx-auto bg-gray-200 rounded mt-3" />
                  <div className="h-3 w-28 mx-auto bg-gray-200 rounded mt-2" />
                  <div className="h-9 w-full bg-gray-200 rounded-full mt-6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((agent, idx) => (
                <div
                  key={`${agent.id}-${idx}`}
                  className="border border-gray-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
                >
                  {/* Avatar */}
                  <div className="relative w-20 h-20 mx-auto mb-6 overflow-hidden rounded-full">
                    <Image
                      src={agent.avatar}
                      alt={agent.name}
                      className="object-cover"
                      fill
                      sizes="80px"
                    />
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-gray-900 text-sm">
                    {agent.name}
                  </h3>

                  {/* Role */}
                  <p className="text-primary-600 text-xs font-semibold mt-0.5 mb-1">
                    {agent.role}
                  </p>

                  {/* Company */}
                  <p className="text-gray-400 text-xs mb-3">{agent.title}</p>

                  {/* Button */}
                  <Link
                    href={`/agentss/${agent.id}`}
                    className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold py-2.5 mt-6 rounded-full transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CTASection />
      <Footer />
    </>
  );
}
