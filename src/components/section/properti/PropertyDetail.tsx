"use client";

import { useState } from "react";
import { MapPin, Bed, Bath, Maximize, Heart, Share2, Send, Users } from "lucide-react";
import { Property } from "@/types";
import { formatPrice } from "@/lib/utils";
import { FEATURED_PROPERTIES, AGENTS } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import CTASection from "@/components/home/CTASection";

// Live Tour Modal
function LiveTourModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to Property Fair Live!", system: true },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: message, system: false }]);
    setMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden h-[500px]">

        {/* Video Side */}
        <div className="flex-1 bg-black relative flex flex-col justify-between p-4">
          {/* Live Badge */}
          <div className="flex items-center justify-between">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">LIVE</span>
            <div className="flex items-center gap-1 text-white/60 text-xs">
              <Users size={12} />
              <span>1</span>
            </div>
          </div>

          {/* Bottom info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Property Fair</p>
              <p className="text-white/50 text-xs">Hosted by Emily Chen</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              🔇
            </button>
          </div>
        </div>

        {/* Chat Side */}
        <div className="w-full md:w-72 bg-[#12122a] flex flex-col">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-semibold text-sm">Live Chat</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`text-xs rounded-lg px-3 py-2 ${msg.system ? "bg-white/5 text-white/50 text-center" : "bg-primary-600/20 text-white"}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/10 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 bg-white/10 text-white text-xs rounded-full px-3 py-2 outline-none placeholder:text-white/30"
            />
            <button
              onClick={sendMessage}
              className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shrink-0"
            >
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl font-bold"
      >
        ✕
      </button>
    </div>
  );
}

export default function PropertyDetails({ property }: { property: Property }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const isLive = false;
  const [showLive, setShowLive] = useState(false);

  const agent = AGENTS.find((a) => a.id === property.agentId) || AGENTS[0];
  const similar = FEATURED_PROPERTIES.filter((p) => p.id !== property.id).slice(0, 3);

  const images = [
    property.images[0],
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
  ];
  return (
    <>
      <section>
             {/* Hero Image with Live Banner */}
        {isLive && (
          <div className="relative w-full h-48 sm:h-64 md:h-[802px] rounded-2xl overflow-hidden mb-8">
            <Image
              src={'/images/ppd.jpg'}
              width={1920}
              height={802}
              alt="live"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                🔴 LIVE
              </span>
              <p className="text-white font-bold text-lg">Live Property Tour</p>
              <button
                onClick={() => setShowLive(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                Join Live Tour
              </button>
            </div>
          </div>
        )}
        {!isLive && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5">
            <p className="text-sm font-semibold text-amber-800">No live session is running right now.</p>
            <p className="mt-1 text-sm text-amber-700">
              Live property tour is currently unavailable. Please check back later for the next session.
            </p>
          </div>
        )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
 
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left */}
          <div className="flex-1">
            {/* Title */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                  <MapPin size={13} />
                  <span>{property.location}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSaved(!saved)}
                  className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center hover:border-red-400 transition-colors"
                >
                  <Heart size={15} className={saved ? "fill-red-500 text-red-500" : "text-gray-400"} />
                </button>
                <button className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center hover:border-primary-600 transition-colors">
                  <Share2 size={15} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-3">
              <Image
                src={images[selectedImage]}
                alt={property.title}
                className="w-full h-full object-cover"
                width={800}
                height={400}
              />
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2 mb-6">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary-600" : "border-transparent"}`}
                >
                  <Image
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    width={80}
                    height={56}
                  />
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-8 border-y border-gray-100 py-5">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Bed size={18} className="text-primary-600" />
                <div>
                  <p className="font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-xs text-gray-400">Bedrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Bath size={18} className="text-primary-600" />
                <div>
                  <p className="font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-xs text-gray-400">Bathrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Maximize size={18} className="text-primary-600" />
                <div>
                  <p className="font-bold text-gray-900">{property.area}</p>
                  <p className="text-xs text-gray-400">m²</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mb-8">
              <h2 className="font-bold text-gray-900 text-lg mb-3">About This Property</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {property.description} This stunning property offers breathtaking views and world-class amenities.
                Located in one of the most sought-after neighborhoods, it provides the perfect blend of luxury and comfort.
                The property features high-end finishes throughout, an open-concept living area, and seamless indoor-outdoor
                living spaces perfect for entertaining.
              </p>
            </div>

            {/* Location Map */}
            <div className="mb-8">
              <h2 className="font-bold text-gray-900 text-lg mb-3">Location</h2>
              <div className="w-full h-52 rounded-2xl overflow-hidden bg-gray-100">
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                  className="border-0"
                />
              </div>
            </div>

            {/* Similar Properties */}
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-5">Similar Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similar.map((p) => (
                  <Link href={`/properties/${p.id}`} key={p.id} className="group">
                    <div className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="h-32 overflow-hidden">
                        <Image
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          width={800}
                          height={400}
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-primary-600 font-bold text-sm">{formatPrice(p.price)}</p>
                        <p className="text-gray-900 text-xs font-semibold mt-0.5 line-clamp-1">{p.title}</p>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                          <MapPin size={10} /><span>{p.city}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Price */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-2xl font-bold text-primary-600">{formatPrice(property.price)}</p>
                <p className="text-gray-400 text-xs mt-1">{property.type} · {property.status}</p>
              </div>

              {/* Agent */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Contact Agent</p>
                <div className="flex items-center gap-3 mb-4">
                  <Image src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full object-cover" width={40} height={40} />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{agent.name}</p>
                    <p className="text-xs text-primary-600">{agent.title}</p>
                  </div>
                </div>
                <input
                  placeholder="Full Name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none mb-2 placeholder:text-gray-400"
                />
                <input
                  placeholder="Message"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none mb-3 placeholder:text-gray-400"
                />
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Modal */}
        {showLive && <LiveTourModal onClose={() => setShowLive(false)} />}
      </div>
    </section>
    <CTASection />
    </>
  );
}
