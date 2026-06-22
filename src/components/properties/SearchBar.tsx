"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { type PropertyFiltersPayload } from "@/hooks/useProperties";

const locations = [
  "All Locations",
  "Punta Cana",
  "Santo Domingo",
  "Cabarete",
  "Santiago",
];

type SearchBarProps = {
  filters: PropertyFiltersPayload;
  onApplyFilters: (filters: PropertyFiltersPayload) => void;
};

export default function SearchBar({ filters, onApplyFilters }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm(filters.search ?? "");
  }, [filters.search]);

  const handleSearch = () => {
    onApplyFilters({
      ...filters,
      search: searchTerm.trim(),
    });
  };

  return (
    <div className="bg-white rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center mb-6 shadow-sm">
      <div className="flex items-center gap-2 flex-1 min-w-[160px]">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search by name or location"
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="text-sm text-gray-700 outline-none w-full placeholder:text-gray-400"
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Search size={15} /> Search
      </button>
    </div>
  );
}
