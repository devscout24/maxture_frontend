"use client";

import { useEffect, useState } from "react";
import {
  usePropertyTypeOptions,
  type PropertyFiltersPayload,
} from "@/hooks/useProperties";

type PropertyFiltersProps = {
  filters: PropertyFiltersPayload;
  onApplyFilters: (filters: PropertyFiltersPayload) => void;
  onResetFilters: () => void;
};

const priceRanges = [
  { label: "Any Price", value: "" },
  { label: "0 - 200000", value: "0-200000" },
  { label: "200001 - 500000", value: "200001-500000" },
  { label: "500001 - 1000000", value: "500001-1000000" },
  { label: "1000001+", value: "1000001-999999999" },
];

export default function PropertyFilters({
  filters,
  onApplyFilters,
  onResetFilters,
}: PropertyFiltersProps) {
  const {
    propertyTypeOptions,
    isLoading: isLoadingPropertyTypes,
    isError: isPropertyTypesError,
  } = usePropertyTypeOptions();
  const [localFilters, setLocalFilters] =
    useState<PropertyFiltersPayload>(filters);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);

    if (filters.price_range) {
      const [min, max] = filters.price_range.split("-");
      setMinPrice(min ?? "");
      setMaxPrice(max ?? "");
    } else {
      setMinPrice("");
      setMaxPrice("");
    }
  }, [filters]);

  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      return;
    }

    const timer = window.setTimeout(() => {
      const min = minPrice ? String(Number(minPrice)) : "";
      const max = maxPrice ? String(Number(maxPrice)) : "";
      const price_range = min && max ? `${min}-${max}` : "";

      const nextFilters: PropertyFiltersPayload = {
        ...localFilters,
        price_range,
      };

      const isDefaultFilters =
        nextFilters.property_type_id.length === 0 &&
        nextFilters.price_range === "" &&
        nextFilters.bedrooms == null &&
        nextFilters.bathrooms == null;

      if (isDefaultFilters) {
        onResetFilters();
      } else {
        onApplyFilters(nextFilters);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [localFilters, minPrice, maxPrice, hasMounted, onApplyFilters, onResetFilters]);

  const togglePropertyType = (typeId: number) => {
    setLocalFilters((prev) => {
      const isSelected = prev.property_type_id.includes(typeId);
      return {
        ...prev,
        property_type_id: isSelected
          ? prev.property_type_id.filter((id) => id !== typeId)
          : [...prev.property_type_id, typeId],
      };
    });
  };

  return (
    <aside className="hidden lg:block w-52 shrink-0">
      <div className="bg-white rounded-xl p-5 shadow-sm sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-gray-900 text-sm">Filters</p>
        </div>

        {/* Price Range Inputs (min / max) */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Price Range
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={1}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none"
            />
            <input
              type="number"
              min={0}
              step={1}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Property Type
          </p>
          {isLoadingPropertyTypes ? (
            <p className="text-xs text-gray-400">Loading property types...</p>
          ) : isPropertyTypesError ? (
            <p className="text-xs text-red-500">
              Failed to load property types.
            </p>
          ) : propertyTypeOptions.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {propertyTypeOptions.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="accent-primary-600"
                    checked={localFilters.property_type_id.includes(type.id)}
                    onChange={() => togglePropertyType(type.id)}
                  />
                  {type.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              No property types available.
            </p>
          )}
        </div>

        {/* Bedrooms (single numeric input) */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-700 mb-2">Bedrooms</p>
          <div>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="Bedrooms"
              value={localFilters.bedrooms ?? ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  bedrooms: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none"
            />
          </div>
        </div>

        {/* Bathrooms (single numeric input) */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-700 mb-2">Bathrooms</p>
          <div>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="Bathrooms"
              value={localFilters.bathrooms ?? ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  bathrooms: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
