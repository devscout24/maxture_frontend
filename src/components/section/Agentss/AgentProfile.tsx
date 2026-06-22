import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

// API agent type
interface AgentData {
  id: number;
  name: string;
  avatar: string;
  bio: string | null;
  properties: Array<{
    id: number;
    title: string;
    price: number;
    address: string;
    bedrooms: number;
    bathrooms: number;
    area: number | null;
    thumbnail: string;
  }>;
}

export default function AgentProfile({ agent }: { agent: AgentData }) {
  const listings = agent.properties || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Agent Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10">
        <Image
          src={agent.avatar}
          alt={agent.name}
          width={80}
          height={80}
          className="w-20 h-20 rounded-full object-cover shrink-0"
        />
        <div>
          <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5 mb-3">Real Estate Agent</p>
        </div>
      </div>

      {/* About */}
      <div className="mb-10">
        <h2 className="font-bold text-gray-900 text-base mb-3">
          About {agent.name}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-3xl">
          {agent.bio || "No bio available"}
        </p>
      </div>

      {/* Listings */}
      <div>
        <h2 className="font-bold text-gray-900 text-base mb-5">
          Listings ({listings.length})
        </h2>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  {property.thumbnail && property.thumbnail.trim() !== "" ? (
                    <Image
                      src={property.thumbnail}
                      alt={property.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-primary-600 font-bold text-base mb-1">
                    {formatPrice(property.price)}
                  </p>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                    <MapPin size={11} />
                    <span>{property.address}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between gap-3 text-gray-400 text-xs border-t border-gray-100 pt-3 mb-4">
                    <span className="flex items-center gap-1">
                      <Bed size={12} /> {property.bedrooms || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={12} /> {property.bathrooms || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize size={12} /> {property.area || 0} m²
                    </span>
                  </div>

                  <Link
                    href={`/properties/${property.id}`}
                    className="flex items-center gap-1 text-primary-600 text-xs font-semibold hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No properties listed</p>
          </div>
        )}
      </div>
    </div>
  );
}
