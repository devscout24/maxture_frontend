import PublicPageFrame from "@/components/layout/PublicPageFrame";
import PropertyDetailView from "@/components/properties/PropertyDetailView";
import { Property } from "@/types";

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

// API response type
interface PropertyDetailResponse {
  status: string;
  data: {
    id: string;
    name: string;
    description: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    address: string;
    price: number;
    type: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    latitude: string;
    longitude: string;
    thumbnail: string;
    gallery: Array<string | { id?: number | string; url?: string | null }>;
    agent_name: string;
    agent_avatar: string;
    live_stream_url: string | null;
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
  };
}

async function fetchProperty(id: string): Promise<PropertyDetailResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}/property/${id}/get?dashboard=0`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch property: ${response.status}`);
  }

  return response.json();
}

type SimilarProperty = {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
};

const isImageUrl = (url?: string | null): url is string =>
  typeof url === "string" &&
  /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url);

const isVideoUrl = (url?: string | null): url is string =>
  typeof url === "string" && /\.(mp4|mov|webm)(\?.*)?$/i.test(url);

function transformApiPropertyToProperty(apiData: PropertyDetailResponse['data']): Property {
  const galleryUrls = (apiData.gallery || [])
    .map((item) => (typeof item === "string" ? item : item.url || ""))
    .filter((url) => typeof url === "string" && url.length > 0);

  const galleryImages = galleryUrls.filter(isImageUrl);
  const galleryVideos = galleryUrls.filter(isVideoUrl);
  const firstVideoUrl = galleryVideos[0] || null;

  const images =
    galleryImages.length > 0
      ? galleryImages
      : isImageUrl(apiData.thumbnail)
        ? [apiData.thumbnail]
        : ["/images/a1.jpg"];

  return {
    id: apiData.id,
    title: apiData.name,
    price: apiData.price,
    location: apiData.address,
    city: apiData.city,
    images,
    bedrooms: apiData.bedrooms,
    bathrooms: apiData.bathrooms,
    area: apiData.area,
    type: apiData.type as any, // Cast to Property type
    status: "for-sale" as const, // Default status
    featured: false, // Default featured status
    agentId: "1", // Default agent ID
    description: apiData.description,
    amenities: [], // Default empty amenities
    createdAt: new Date().toISOString(), // Default current time
    videos: galleryVideos,
    live_stream_url: apiData.live_stream_url || firstVideoUrl || null,
  };
}

// Transform related properties from API format to SimilarProperty format
function transformRelatedProperties(
  relatedProperties: PropertyDetailResponse["data"]["related_properties"],
): SimilarProperty[] {
  return relatedProperties.map((item) => {
    const thumbnail: string = isImageUrl(item.thumbnail)
      ? item.thumbnail
      : "/images/a1.jpg";

    return {
      id: String(item.id),
      title: item.name,
      price: item.price,
      location: item.address,
      images: [thumbnail],
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
    };
  });
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;

  try {
    const propertyResponse = await fetchProperty(id);

    if (propertyResponse.status !== "success") {
      return (
        <PublicPageFrame className="bg-gray-50">
          <div>No data found for this</div>
        </PublicPageFrame>
      );
    }

    // Transform API data to match Property interface
    const transformedProperty = transformApiPropertyToProperty(propertyResponse.data);
    const similarProperties = transformRelatedProperties(
      propertyResponse.data.related_properties || [],
    );

    return (
      <PublicPageFrame className="bg-gray-50">
        <PropertyDetailView
          property={transformedProperty}
          similarProperties={similarProperties}
        />
      </PublicPageFrame>
    );
  } catch (error) {
    console.error("Error fetching property:", error);
    return (
      <PublicPageFrame className="bg-gray-50">
        <div>No data found for this</div>
      </PublicPageFrame>
    );
  }
}
