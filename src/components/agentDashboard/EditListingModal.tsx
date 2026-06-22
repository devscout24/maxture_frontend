"use client";

import { X } from "lucide-react";
import EditPropertyForm from "./EditPropertyForm";

export type ListingModalData = {
  id: string;
  title: string;
  location: string;
  price: string;
  status: string;
  image: string;
  images?: string[];
};

type EditListingModalProps = {
  listing: ListingModalData;
  onClose: () => void;
};

export default function EditListingModal({
  listing,
  onClose,
}: EditListingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Edit Listing
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              {listing.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{listing.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <EditPropertyForm propertyId={listing.id} />
        </div>
      </div>
    </div>
  );
}
