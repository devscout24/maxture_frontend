"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/userDashboard/DashboardLayout";
import PropertyCard from "@/components/properties/PropertyCard";
import useWishlist from "@/hooks/useWishlist";
import { useDashboard } from "@/contexts/DashboardContext";

export default function SavedPage() {
  const { profile } = useDashboard();
  const { wishlist, refetch, isLoading } = useWishlist();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (hasMounted && isLoading) {
    return (
      <DashboardLayout
        ticketsCount={profile?.tickets_count || 0}
        savedCount={profile?.saved_properties_count || 0}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Saved Properties
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-44 bg-gray-100 rounded-xl" />
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-100 rounded-full" />
                    <div className="h-8 w-20 bg-gray-100 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      ticketsCount={profile?.tickets_count || 0}
      savedCount={profile?.saved_properties_count || 0}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Saved Properties
      </h2>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          No Saved Properties yet. Save a property.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <PropertyCard
                property={{
                  id: item.id.toString(),
                  title: item.title || item.name || "",
                  price:
                    typeof item.price === "string"
                      ? parseFloat(item.price)
                      : item.price || 0,
                  location: item.address,
                  city: "",
                  images: [item.thumbnail],
                  bedrooms: item.bedrooms,
                  bathrooms: item.bathrooms,
                  area: item.area || 0,
                  type: "apartment", // Fallback type
                  status: "for-sale",
                  featured: item.feautured_tag || false,
                  agentId: "",
                  description: "",
                  amenities: [],
                  createdAt: new Date().toISOString(),
                }}
                onWishlistChange={refetch}
              />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
