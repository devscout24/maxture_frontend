"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import {
  Bath,
  Bed,
  Heart,
  MapPin,
  Maximize,
  Share2,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FEATURED_PROPERTIES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Property } from "@/types";

type PropertyDetailProps = {
  property: Property;
};

function SimilarPropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="text-primary-600 font-bold text-lg">
          {formatPrice(property.price)}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
          {property.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} />
          {property.location}
        </p>
        <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1">
            <Bed size={12} /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} /> Add to
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const payload = {
        name: data.name,
        email: data.email,
        message: data.message,
        phone: "",
        subject: `Property Inquiry: ${property.title}`,
      };
      
      const response = await fetch(`${baseUrl}/contact/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.data?.message || "Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        toast.error(data.message || "Failed to send message");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    sendMessageMutation.mutate(formData);
  };

  const galleryImages = useMemo(() => {
    const fallbackImages = FEATURED_PROPERTIES.filter(
      (item) => item.id !== property.id,
    )
      .flatMap((item) => item.images)
      .filter((image) => image !== property.images[0]);

    return [property.images[0], ...fallbackImages].slice(0, 5);
  }, [property]);

  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const similarProperties = FEATURED_PROPERTIES.filter(
    (item) => item.id !== property.id,
  ).slice(0, 3);

  const stats = [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    {
      icon: Maximize,
      label: "Area",
      value: `${property.area.toLocaleString()} m²`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {property.title}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            {property.location}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:text-primary-600 hover:border-primary-200">
            <Share2 size={16} className="mx-auto" />
          </button>
          <button className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:text-red-500 hover:border-red-200">
            <Heart size={16} className="mx-auto" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-8 items-start">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
              <div className="relative h-[420px] sm:h-[520px]">
                <Image
                  src={activeImage}
                  alt={property.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                Featured Property
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                {formatPrice(property.price)}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(image)}
                  className={`relative h-20 overflow-hidden rounded-xl border transition-all ${
                    activeImage === image
                      ? "border-primary-600 ring-2 ring-primary-100"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${property.title} preview ${index + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
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
            <h2 className="text-xl font-bold text-gray-900">Location</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              <Image
                src="/images/bgg.jpg"
                alt="Property location map"
                width={1200}
                height={720}
                className="h-[300px] w-full object-cover"
              />
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

        <aside className="lg:sticky lg:top-24 space-y-6">
          <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Agent
            </h2>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <Image
                src="/images/me1.jpg"
                alt="Agent"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">Maria Rodriguez</p>
                <p className="text-xs text-gray-500">Caribbean Realty Group</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-600"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-600"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-600"
              />
              <button 
                type="submit"
                disabled={sendMessageMutation.isPending}
                className="w-full rounded-full bg-primary-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-700 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sendMessageMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 text-primary-600 mb-3">
              <Sparkles size={16} />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Why It Stands Out
              </p>
            </div>
            <p className="text-sm leading-6 text-gray-600">
              Premium finishes, prime location, and a streamlined contact flow
              make this property feel aligned with the rest of the polished
              platform.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              Featured listing with high buyer interest
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
