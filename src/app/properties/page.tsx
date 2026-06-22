"use client";

import { useState } from "react";
import SearchBar from "@/components/properties/SearchBar";
import PropertyFilters from "@/components/properties/PropertyFilters";
import PropertyGrid from "@/components/properties/PropertyGrid";
import PublicPageFrame from "@/components/layout/PublicPageFrame";
import { type PropertyFiltersPayload } from "@/hooks/useProperties";

const defaultFilters: PropertyFiltersPayload = {
  search: "",
  property_type_id: [],
  price_range: "",
  bedrooms: null,
  bathrooms: null,
};

export default function PropertiesPage() {
  const [filters, setFilters] =
    useState<PropertyFiltersPayload>(defaultFilters);

  return (
    <PublicPageFrame className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Property Listings
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Browse 9 premium properties across the Dominican Republic
          </p>
        </div>

        <SearchBar filters={filters} onApplyFilters={setFilters} />

        <div className="flex gap-6">
          <PropertyFilters
            filters={filters}
            onApplyFilters={setFilters}
            onResetFilters={() => setFilters(defaultFilters)}
          />
          <PropertyGrid filters={filters} />
        </div>
      </div>
    </PublicPageFrame>
  );
}
