"use client";

import { useState, useEffect } from "react";
import { Radio } from "lucide-react";
import Image from "next/image";
import { authenticatedFetch, getAuthToken } from "@/lib/api";

// Types
interface TopListing {
    id: string;
    title: string;
    location: string;
    price: string;
    image: string;
}

interface GoLiveProps {
    topListings: TopListing[];
}

export default function GoLive({ topListings }: GoLiveProps) {
    const [destination, setDestination] = useState<"virtual" | "raffle">("virtual");
    const [items, setItems] = useState<TopListing[]>(topListings);
    const [selectedProperty, setSelectedProperty] = useState(topListings[0]?.id || "");
    const [isLive, setIsLive] = useState(false);
    const [liveStreamUrl, setLiveStreamUrl] = useState<string | null>(null);
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>("");

    // YouTube URL Parser
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

    // Fetch items based on destination
    useEffect(() => {
        const fetchItems = async () => {
            if (destination === "virtual") {
                setItems(topListings);
                if (topListings.length > 0 && !topListings.find(i => i.id === selectedProperty)) {
                    setSelectedProperty(topListings[0].id);
                }
                return;
            }

            setIsLoadingItems(true);
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const token = getAuthToken();
                const response = await authenticatedFetch(`${baseUrl}/raffle/index`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!response) { setIsLoadingItems(false); return; }

                const data = await response.json();

                if ((data.success || data.status === "success") && data.raffles) {
                    const raffleItems: TopListing[] = data.raffles.map((r: any) => ({
                        id: r.id.toString(),
                        title: r.title,
                        location: r.location || "Online Raffle",
                        price: typeof r.price === "number" ? `$${(r.price / 1000).toFixed(0)}K` : r.price,
                        image: r.thumbnail || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200",
                    }));
                    setItems(raffleItems);
                    if (raffleItems.length > 0) setSelectedProperty(raffleItems[0].id);
                }
            } catch (err) {
                console.error("Error fetching raffles:", err);
            } finally {
                setIsLoadingItems(false);
            }
        };

        fetchItems();
    }, [destination, topListings]);

    // Fetch live stream URL when property/destination changes
    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedProperty) { setLiveStreamUrl(null); return; }

            setIsLoadingUrl(true);
            setDebugInfo("");

            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const token = getAuthToken();
                const endpoint = destination === "raffle"
                    ? `${baseUrl}/raffle/${selectedProperty}/get-page`
                    : `${baseUrl}/property/${selectedProperty}/get`;

                console.log("[GoLive] Fetching:", endpoint);

                const response = await authenticatedFetch(endpoint, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!response) {
                    console.warn("[GoLive] No response — auth failed");
                    setLiveStreamUrl(null);
                    setDebugInfo("Auth failed or no response");
                    return;
                }

                const data = await response.json();
                console.log("[GoLive] Full API response:", JSON.stringify(data, null, 2));

                // Exhaustive search — covers all known response shapes from api.ts
                const url =
                    data?.raffle?.live_stream_url ||        // { raffle: { live_stream_url } }
                    data?.property?.live_stream_url ||      // { property: { live_stream_url } }
                    data?.data?.property?.live_stream_url ||
                    data?.data?.raffle?.live_stream_url ||
                    data?.data?.live_stream_url ||
                    data?.live_stream_url ||
                    null;

                console.log("[GoLive] live_stream_url:", url);
                setDebugInfo(`Keys: [${Object.keys(data).join(", ")}] | URL: ${url ?? "NOT FOUND"}`);
                setLiveStreamUrl(url);

            } catch (err) {
                console.error("[GoLive] Error:", err);
                setLiveStreamUrl(null);
                setDebugInfo(`Error: ${err}`);
            } finally {
                setIsLoadingUrl(false);
            }
        };

        fetchDetails();
        setIsLive(false);
    }, [selectedProperty, destination]);

    const toggleLive = () => {
        if (!liveStreamUrl && !isLive) {
            alert("No live stream link found for this property. Please add one in the Admin Dashboard.");
            return;
        }
        setIsLive(!isLive);
    };

    const embedUrl = getYouTubeEmbedUrl(liveStreamUrl);

    return (
        <div>
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">Go Live</h1>
            <p className="text-gray-400 text-sm mb-6">Stream to Virtual Expo or Raffle audiences</p>

            <div className="flex flex-col lg:flex-row gap-5">

                {/* Video Area */}
                <div className="flex-1">
                    <div className="relative bg-black rounded-2xl overflow-hidden w-full aspect-video flex items-center justify-center shadow-inner">
                        {isLive && embedUrl ? (
                            <>
                                <iframe
                                    src={embedUrl}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5 shadow-lg pointer-events-none">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                    LIVE
                                </span>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                {isLoadingUrl ? (
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                                            <Radio size={32} className="text-gray-600" />
                                        </div>
                                        <p className="text-gray-400 text-sm font-semibold">
                                            {liveStreamUrl ? "Live Stream Ready" : "No Stream Link Found"}
                                        </p>
                                        <p className="text-gray-600 text-xs mt-1 max-w-[240px] mx-auto">
                                            {liveStreamUrl
                                                ? "The YouTube live link is connected. Click Go Live to start the broadcast."
                                                : "Please ensure a YouTube live link is added to this property in the Admin Dashboard."}
                                        </p>
                                        {/* Debug — only in development */}
                                        {process.env.NODE_ENV === "development" && debugInfo && (
                                            <p className="text-yellow-400 text-[10px] mt-2 max-w-[280px] mx-auto break-all opacity-70">
                                                🔍 {debugInfo}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end mt-4 px-1">
                        <button
                            onClick={toggleLive}
                            disabled={isLoadingUrl}
                            className={`flex items-center gap-2 font-bold text-sm px-8 py-3 rounded-full transition-all shadow-md ${
                                isLive
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

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                            Stream Destination
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setDestination("raffle")}
                                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-colors text-xs font-semibold ${
                                    destination === "raffle"
                                        ? "border-primary-600 bg-blue-50 text-primary-600"
                                        : "border-gray-100 text-gray-400 hover:border-gray-200"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                                </svg>
                                Raffle
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                            Select {destination === "raffle" ? "Raffle" : "Property"}
                        </p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
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
                                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                                            selectedProperty === listing.id
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
    );
}