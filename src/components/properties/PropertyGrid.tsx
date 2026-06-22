"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "./PropertyCard";
import {
  useFilteredProperties,
  type PropertyFiltersPayload,
} from "@/hooks/useProperties";
import { useEffect, useState } from "react";

type PropertyGridProps = {
  filters: PropertyFiltersPayload;
};

export default function PropertyGrid({ filters }: PropertyGridProps) {
  const {
    properties,
    isLoading: loading,
    error,
  } = useFilteredProperties(filters);

  const [page, setPage] = useState<number>(1);
  const pageSize = 9; // items per page

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((properties?.length ?? 0) / pageSize),
    );
    if (page > totalPages) setPage(totalPages);
  }, [properties, page]);

  if (loading) {
    return (
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load properties</p>
          <p className="text-gray-500 text-sm">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(
    0,
    Math.ceil((properties?.length ?? 0) / pageSize),
  );
  const paginated = properties.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {paginated.map((property) => (
          <PropertyCard
            key={property.id}
            property={{
              id: property.id.toString(),
              title: property.title || property.name || "",
              price:
                typeof property.price === "string"
                  ? parseFloat(property.price)
                  : property.price || 0,
              location: property.address || "",
              city: "",
              images: property.thumbnail ? [property.thumbnail] : [],
              type:
                property.type === "villa" ||
                property.type === "apartment" ||
                property.type === "penthouse" ||
                property.type === "estate" ||
                property.type === "condo"
                  ? property.type
                  : "apartment",
              featured: property.feautured_tag || false,
              bedrooms: property.bedrooms || 0,
              bathrooms: property.bathrooms || 0,
              area: property.area || 0,
              status: "for-sale",
              agentId: "",
              description: "",
              amenities: [],
              createdAt: new Date().toISOString(),
              live_stream_url: property.live_stream_url || null,
            }}
          />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No properties found with these filters.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-gray-400 transition-colors ${
              page === 1
                ? "opacity-50 pointer-events-none"
                : "border-gray-200 hover:border-primary-600 hover:text-primary-600"
            }`}
          >
            <ChevronLeft size={15} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                n === page
                  ? "bg-primary-600 text-white"
                  : "border border-gray-200 text-gray-500 hover:border-primary-600 hover:text-primary-600"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-gray-400 transition-colors ${
              page === totalPages
                ? "opacity-50 pointer-events-none"
                : "border-gray-200 hover:border-primary-600 hover:text-primary-600"
            }`}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
