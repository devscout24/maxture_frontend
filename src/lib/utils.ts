import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function getYouTubeEmbedUrl(url: string | null): string | null {
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
}
