"use client";

import Link from "next/link";
import { use } from "react";
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import UserInitials, {
  UserInfo,
} from "@/components/agentDashboard/UserInitials";
import {
  ArrowLeft,
  List,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  X,
  Bath,
  Bed,
  Heart,
  MapPin,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ManagementListing {
  id: string;
  name: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  price: number;
  type: string;
  thumbnail: string;
  gallery: string[];
  agent_name: string;
  agent_avatar: string;
  latitude?: string;
  longitude?: string;
  related_properties: Array<{
    id: number;
    name: string;
    address: string;
    price: number;
    thumbnail: string | null;
    type: string;
    bedrooms: number;
    bathrooms: number;
  }>;
}

const sidebarLinks = [
  {
    label: "My Listings",
    icon: <List size={15} />,
    key: "listings",
  },
  {
    label: "Add Property",
    icon: <PlusCircle size={15} />,
    key: "addproperty",
  },
  {
    label: "Profile & Settings",
    icon: <Settings size={15} />,
    key: "settings",
  },
];

function SimilarPropertyCard({ property }: { property: any }) {
  return (
    <Link
      href={`/agent-dashboard/${property.id}`}
      className="group overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={
            property.thumbnail ||
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200"
          }
          alt={property.name || ""}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className="p-4">
        <p className="text-primary-600 font-bold text-lg">
          {formatPrice(property.price || 0)}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
          {property.name || ""}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} />
          {property.address || ""}
        </p>
        <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1">
            <Bed size={12} /> {property.bedrooms || 0}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} /> {property.bathrooms || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} /> Add to
          </span>
        </div>
      </div>
    </Link>
  );
}

const propertyStats = [
  { label: "Bedrooms", key: "bedrooms" as const },
  { label: "Bathrooms", key: "bathrooms" as const },
  { label: "Area", key: "area" as const },
];

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { logout, user } = useAuth();
  const { id } = use(params);
  const pathname = usePathname();
  const [property, setProperty] = useState<ManagementListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Gallery and stats logic
  const galleryImages = useMemo(() => {
    if (!property) return [];

    // Use API gallery if available, otherwise use thumbnail
    const images =
      property.gallery && property.gallery.length > 0
        ? property.gallery
        : [property.thumbnail].filter(Boolean);

    return images.slice(0, 5);
  }, [property]);

  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    }
  }, [galleryImages]);

  const similarProperties = property?.related_properties || [];

  const stats = property
    ? [
        { icon: Bed, label: "Bedrooms", value: property.bedrooms || 0 },
        { icon: Bath, label: "Bathrooms", value: property.bathrooms || 0 },
        {
          icon: Maximize,
          label: "Area",
          value: property.area
            ? `${property.area.toLocaleString()} m²`
            : "0 m²",
        },
      ]
    : [];

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("auth_token") ||
          JSON.parse(localStorage.getItem("expovivienda_auth_session") || "{}")
            ?.token ||
          "";

        if (!token) {
          throw new Error("No authentication token found");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(`${baseUrl}/property/${id}/get`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch property details");
        }

        const data = await response.json();
        setProperty(data.data);
      } catch (fetchError: any) {
        setError(fetchError.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const agentInitials =
    property?.agent_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  return (
    <section className="bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto min-h-screen flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-40 flex h-full w-56 shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-6 shadow-sm transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between px-1">
            <Link
              href="/agent-dashboard"
              className="font-bold text-base tracking-wide text-[#1B2B5E]"
            >
              EXPOVIVIENDA
            </Link>
            <button
              className="text-gray-400 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-6 flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B2B5E]">
              <UserInitials user={user} />
            </div>
            <div>
              <UserInfo user={user} />
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              // Only show "My Listings" as active on property details pages
              const isActive =
                link.key === "listings" &&
                pathname.match(/^\/agent-dashboard\/[^\/]+$/);

              const handleNavigation = () => {
                setSidebarOpen(false);
                // Set the active tab in localStorage before navigating
                localStorage.setItem("agent-dashboard-active-tab", link.key);
                // Navigate to main dashboard
                window.location.href = "/agent-dashboard";
              };

              return (
                <button
                  key={link.key}
                  onClick={handleNavigation}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 font-semibold text-primary-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-2 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut size={15} />
            Logout
          </button>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="border-b border-gray-100 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500"
              >
                <Menu size={20} />
              </button>
              <p className="text-sm font-bold text-[#1B2B5E]">EXPOVIVIENDA</p>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B2B5E]">
                <UserInitials
                  user={user}
                  className="text-xs font-bold text-white"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Agent Dashboard
                </p>
                <h1 className="mt-1 text-lg font-bold text-gray-900">
                  Property Details
                </h1>
              </div>
              <Link
                href="/agent-dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft size={16} />
                Back to listings
              </Link>
            </div>
          </div>

          <div className="px-4 py-6 lg:px-8 lg:py-8">
            {loading ? (
              <div className="mx-auto flex max-w-7xl items-center justify-center rounded-3xl border border-gray-100 bg-white p-16 shadow-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
              </div>
            ) : error ? (
              <div className="mx-auto max-w-5xl rounded-3xl border border-red-100 bg-white p-6 text-red-500 shadow-sm">
                {error}
              </div>
            ) : !property ? (
              <div className="mx-auto max-w-5xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                No property found.
              </div>
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {property.name}
                    </h1>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} />
                      {property.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <button className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:text-red-500 hover:border-red-200">
                      <Heart size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>

                <div className="">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
                        <div className="relative h-[420px] sm:h-[520px]">
                          {activeImage ? (
                            <Image
                              src={activeImage}
                              alt={property.name}
                              fill
                              priority
                              className="object-fit"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <div className="text-gray-400">
                                No image available
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                          Featured Property
                        </div>
                        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                          {formatPrice(property.price)}
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-2">
                        {galleryImages.map((image, index) => (
                          <button
                            key={`${image}-${index}`}
                            onClick={() => setActiveImage(image)}
                            className={`relative h-24 overflow-hidden rounded-xl border transition-all ${
                              activeImage === image
                                ? "border-primary-600 ring-2 ring-primary-100"
                                : "border-gray-200 hover:border-primary-300"
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${property.name} preview ${index + 1}`}
                              fill
                              className={`object-fit transition-all duration-300 ${
                                activeImage === image
                                  ? "filter-none"
                                  : "filter blur-[2px] opacity-99"
                              }`}
                              unoptimized
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      {stats.map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.label}
                            className="rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-5 text-center"
                          >
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                              <Icon size={18} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                              {item.label}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                              {item.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        About This Property
                      </h2>
                      <div className="mt-4 space-y-4 text-sm leading-7 text-gray-600">
                        <p>{property.description}</p>
                      </div>
                    </section>

                    <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Location
                      </h2>
                      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                        {property?.latitude && property?.longitude ? (
                          <div className="relative">
                            <iframe
                              width="100%"
                              height="400"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=16&output=embed`}
                              allowFullScreen
                              className="w-full rounded-t-2xl"
                            />
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                              <div className="bg-white rounded-lg shadow-lg px-3 py-2">
                                <p className="text-xs font-semibold text-gray-700">
                                  📍 {property.address}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                                >
                                  🚗 Directions
                                </a>
                                <a
                                  href={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=18`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors shadow-lg"
                                >
                                  🗺️ View in Maps
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
                            <p className="text-gray-500">
                              Location information not available
                            </p>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center justify-between gap-4 mb-5">
                        <h2 className="text-xl font-bold text-gray-900">
                          Similar Properties
                        </h2>
                        <div className="flex items-center gap-2">
                          <button className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-primary-300 hover:text-primary-600">
                            <ChevronLeft size={16} className="mx-auto" />
                          </button>
                          <button className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-primary-300 hover:text-primary-600">
                            <ChevronRight size={16} className="mx-auto" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {similarProperties.map((item) => (
                          <SimilarPropertyCard key={item.id} property={item} />
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}
