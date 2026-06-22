"use client";

import { useState, useEffect } from "react";
import { Radio } from "lucide-react";
import Image from "next/image";
import { useRaffle, useRaffles } from "@/hooks/useRaffles";
import DashboardLayout from "@/components/dashboard/userDashboard/DashboardLayout";
import { useDashboard } from "@/contexts/DashboardContext";



export default function GoLive() {

    const [selectedProperty, setSelectedProperty] = useState("");

    const { raffles: rawRaffles, isLoading: isLoadingItems } = useRaffles();
    const items = rawRaffles.map((r) => ({
        id: r.id.toString(),
        title: r.title,
        location: r.location || "Online Raffle",
        price:
            typeof r.price === "number"
                ? `$${(r.price / 1000).toFixed(0)}K`
                : String(r.price),
        image: r.thumbnail || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200",
    }));
    const [isLive, setIsLive] = useState(false);


    const getYouTubeEmbedUrl = (url: string | null) => {
        if (!url) return null;
        let videoId: string | null = null;

        const liveMatch = url.match(/youtube\.com\/live\/([^#&?]{11})/);
        if (liveMatch) videoId = liveMatch[1];

        if (!videoId) {
            const shortMatch = url.match(/youtu\.be\/([^#&?]{11})/);
            if (shortMatch) videoId = shortMatch[1];
        }

        if (!videoId) {
            const watchMatch = url.match(/[?&]v=([^#&?]{11})/);
            if (watchMatch) videoId = watchMatch[1];
        }

        if (!videoId) {
            const embedMatch = url.match(/youtube\.com\/embed\/([^#&?]{11})/);
            if (embedMatch) videoId = embedMatch[1];
        }

        return videoId
            ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
            : null;
    };

    useEffect(() => {
        if (items.length > 0 && !selectedProperty) {
            setSelectedProperty(items[0].id);
        }
    }, [items, selectedProperty]);

    const { raffle: raffleDetail, isLoading: isLoadingUrl } = useRaffle(selectedProperty);
    const liveStreamUrl = raffleDetail?.live_stream_url ?? null;

    const toggleLive = () => {
        if (!liveStreamUrl && !isLive) {
            alert("No live stream link found. Please add a YouTube live link in the Admin Dashboard.");
            return;
        }
        setIsLive(!isLive);
    };

    const { profile, initials } = useDashboard();
    const embedUrl = getYouTubeEmbedUrl(liveStreamUrl);
    const selectedItem = items.find(i => i.id === selectedProperty);

    return (
        <DashboardLayout
            initials={initials}
            ticketsCount={profile?.tickets_count || 0}
            savedCount={profile?.saved_properties_count || 0}
        >
            <div className="space-y-6">
                <div className="px-1">
                    <h1 className="text-xl font-bold text-gray-900">Go Live</h1>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Stream to Virtual Expo or Raffle audiences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* Main Content Area */}
                    <div className="flex-1 w-full">
                        <div className="relative aspect-video bg-black rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100">
                            {isLive && embedUrl ? (
                                <>
                                    <iframe
                                        src={embedUrl}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                    <div className="absolute top-4 left-4">
                                        <div className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                                            <span className="w-1 h-1 bg-white rounded-full" />
                                            Live
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
                                    {selectedItem && (
                                        <Image
                                            src={selectedItem.image}
                                            alt="Preview"
                                            fill
                                            className="object-cover opacity-50"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center p-6">
                                        {isLoadingUrl ? (
                                            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4">
                                                    <Radio size={32} className="text-white/60" />
                                                </div>
                                                <p className="text-white text-sm font-bold">
                                                    {liveStreamUrl ? "Live Stream Ready" : "No Stream Link Found"}
                                                </p>
                                                <p className="text-white/60 text-xs mt-1">
                                                    {liveStreamUrl ? "Click Go Live to join the session" : "No active stream found for this selection"}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Button Below Video */}
                        <div className="flex justify-center lg:justify-end mt-6 pr-4">
                            <button
                                onClick={toggleLive}
                                disabled={isLoadingUrl}
                                className={`flex items-center gap-2 font-bold text-sm px-8 py-3 rounded-full transition-all shadow-md ${isLive
                                    ? "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                    : "bg-red-500 hover:bg-red-600 text-white scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                    }`}
                            >
                                {isLive ? (
                                    <>
                                        <div className="w-2 h-2 bg-gray-400 rounded-sm mr-1" />
                                        Stop Live
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        Go Live
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="w-full lg:w-52 space-y-4 shrink-0">

                        {/* Destination Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                Stream Destination
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 border-primary-600 bg-blue-50 text-primary-600 text-[10px] font-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                                    </svg>
                                    Raffle
                                </div>
                            </div>
                        </div>

                        {/* Selection Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                Select Raffle
                            </p>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {isLoadingItems ? (
                                    <div className="space-y-2 animate-pulse">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-14 bg-gray-50 rounded-xl" />
                                        ))}
                                    </div>
                                ) : items.length > 0 ? (
                                    items.map((listing) => (
                                        <button
                                            key={listing.id}
                                            onClick={() => setSelectedProperty(listing.id)}
                                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${selectedProperty === listing.id
                                                ? "bg-blue-50 border border-primary-200"
                                                : "hover:bg-gray-50 border border-transparent"
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                <Image
                                                    src={listing.image}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover"
                                                    width={40}
                                                    height={40}
                                                />
                                            </div>
                                            <div className="text-left min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 truncate">{listing.title}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{listing.location}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-4">No items found</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}