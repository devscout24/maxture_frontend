import { ReactNode } from "react";

// Property Types
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  images: string[];
  videos?: string[];
  bedrooms: number;
  bathrooms: number;
  area: number; // sq ft
  type: "villa" | "apartment" | "penthouse" | "estate" | "condo";
  status: "for-sale" | "for-rent" | "sold";
  featured: boolean;
  agentId: string;
  description: string;
  amenities: string[];
  createdAt: string;
  live_stream_url?: string | null;
}

// Agent Types
export interface Agent {
  [x: string]: ReactNode;
  id: string;
  name: string;
  title: string;
  designation?: string;
  
  avatar: string;
  listings: number;
  sales: number;
  rating: number;
  phone: string;
  email: string;
  bio: string;
}

// Raffle Types
export interface Raffle {
  id: string;
  propertyId: string;
  property: Property;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  endDate: string;
  status: "active" | "ended" | "upcoming";
}

export interface RaffleTicket {
  id: string;
  raffleId: string;
  userId: string;
  ticketNumber: string;
  purchasedAt: string;
}

// Virtual Expo Types
export interface VirtualExpo {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  thumbnail: string;
  features: string[];
  status: "live" | "upcoming" | "past";
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  role: "buyer" | "agent" | "admin";
  memberSince: string;
  savedProperties: string[];
  raffleTickets: RaffleTicket[];
  totalOrders: number;
  totalSpent: number;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  userName: string;
  userAvatar: string;
  userLocation: string;
  rating: number;
  content: string;
}

// Search Filter Types
export interface SearchFilters {
  location: string;
  priceRange: { min: number; max: number };
  propertyType: string;
  bedrooms: number | null;
}
