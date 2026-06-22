"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, DollarSign, Home, MapPin } from "lucide-react";
import { toast } from "sonner";
import { readStoredAuthSession } from "@/lib/store";
import { replacePropertyVideoWithChunks } from "./VideoUpload";
import Image from "next/image";

type EditPropertyFormProps = {
  propertyId?: number | string;
};

type PropertyDetailData = {
  id: number | string;
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
  latitude: string | number;
  longitude: string | number;
  gallery?: Array<{ id?: number | string; url?: string | null } | string>;
  thumbnail?: string | null;
  video_url?: string | null;
  video?: string | null;
};

type PropertyDetailResponse = {
  success?: boolean;
  status?: string;
  message?: string;
  data?: PropertyDetailData;
  property?: PropertyDetailData;
};

type FormDataState = {
  title: string;
  sales_type: "raffle" | "sales" | "fair";
  bedrooms: number;
  bathrooms: number;
  property_type_id: number;
  area: number;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
  images: File[];
  videoFile: File | null;
  existingImages: Array<{ id: number; url: string }>;
  existingVideo: { id: number; url: string } | null;
  price: number;
};

const createEmptyFormData = (): FormDataState => ({
  title: "",
  sales_type: "raffle",
  bedrooms: 3,
  bathrooms: 2,
  property_type_id: 1,
  area: 1200,
  description: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "",
  latitude: 1.00000001,
  longitude: 1.00000001,
  images: [],
  videoFile: null,
  existingImages: [],
  existingVideo: null,
  price: 0,
});

const normalizeListingType = (type?: string): "raffle" | "sales" | "fair" => {
  switch ((type || "").toLowerCase()) {
    case "sale":
    case "sales":
      return "sales";
    case "fair":
      return "fair";
    default:
      return "raffle";
  }
};

const parseLatitudeLongitude = (value: string | number | undefined) => {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
};

const isVideoUrl = (url: string) => /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(url);
const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(url);

const getGalleryMedia = (gallery?: PropertyDetailData["gallery"]) => {
  const imageItems: Array<{ id: number; url: string }> = [];
  let videoItem: { id: number; url: string } | null = null;

  for (const item of gallery || []) {
    const url = typeof item === "string" ? item : item.url || "";
    const id = typeof item === "string" ? null : Number(item.id || 0);
    if (!url) continue;
    if (!videoItem && isVideoUrl(url)) {
      videoItem = { id: id || 0, url };
      continue;
    }
    if (isImageUrl(url) || !isVideoUrl(url)) {
      imageItems.push({ id: id || 0, url });
    }
  }

  return { imageItems, videoItem };
};

// Shared token helper — one place to get auth token
const getAuthToken = (): string => {
  const session = readStoredAuthSession();
  if (session?.token) return session.token;
  try {
    const authData = localStorage.getItem("expovivienda_auth_session");
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed?.token) return parsed.token;
    }
  } catch { }
  return localStorage.getItem("auth_token") || "";
};

// Check if error is a backend permission/status error
const isPermissionError = (message: string): boolean => {
  return (
    message.includes("draft and pending") ||
    message.includes("403") ||
    message.includes("Forbidden") ||
    message.includes("not permitted") ||
    message.includes("Authentication failed") ||
    message.includes("session expired")
  );
};

export default function EditPropertyForm({
  propertyId: initialPropertyId,
}: EditPropertyFormProps = {}) {
  const editPropertyId =
    initialPropertyId !== undefined && initialPropertyId !== null
      ? Number(initialPropertyId)
      : null;

  const formStateStorageKey = editPropertyId
    ? `editPropertyFormState:${editPropertyId}`
    : "addPropertyFormState";

  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState<number | null>(editPropertyId);
  const [formData, setFormData] = useState<FormDataState>(createEmptyFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProperty, setIsFetchingProperty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoWarning, setVideoWarning] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);

  const saveFormState = (
    currentStep: number,
    currentFormData: FormDataState,
    currentPropertyId: number | null,
  ) => {
    try {
      const formDataToSave: Record<string, unknown> = { ...currentFormData };
      if (currentFormData.images.length > 0) {
        formDataToSave.imagesInfo = currentFormData.images.map((file) => ({
          name: file.name, size: file.size, type: file.type, lastModified: file.lastModified,
        }));
        delete formDataToSave.images;
      }
      if (currentFormData.videoFile) {
        formDataToSave.videoFileInfo = {
          name: currentFormData.videoFile.name,
          size: currentFormData.videoFile.size,
          type: currentFormData.videoFile.type,
          lastModified: currentFormData.videoFile.lastModified,
        };
        delete formDataToSave.videoFile;
      }
      localStorage.setItem(
        formStateStorageKey,
        JSON.stringify({ step: currentStep, formData: formDataToSave, propertyId: currentPropertyId, timestamp: Date.now() }),
      );
    } catch (saveError) {
      console.error("Failed to save form state:", saveError);
    }
  };

  const loadFormState = () => {
    try {
      const savedState = localStorage.getItem(formStateStorageKey);
      if (!savedState) return null;
      const parsed = JSON.parse(savedState);
      if (Date.now() - parsed.timestamp >= 24 * 60 * 60 * 1000) {
        localStorage.removeItem(formStateStorageKey);
        return null;
      }
      const restoredFormData = { ...createEmptyFormData(), ...parsed.formData } as FormDataState;
      restoredFormData.images = [];
      restoredFormData.videoFile = null;
      restoredFormData.existingImages = [];
      restoredFormData.existingVideo = null;
      return { ...parsed, formData: restoredFormData };
    } catch {
      localStorage.removeItem(formStateStorageKey);
      return null;
    }
  };

  const clearFormState = () => {
    try { localStorage.removeItem(formStateStorageKey); } catch { }
  };

  useEffect(() => {
    if (editPropertyId !== null) return;
    const savedState = loadFormState();
    if (savedState) {
      setStep(savedState.step);
      setFormData(savedState.formData);
      setPropertyId(savedState.propertyId);
    }
  }, [editPropertyId]);

  useEffect(() => {
    if (editPropertyId === null) return;
    let isActive = true;

    const fetchProperty = async () => {
      setIsFetchingProperty(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Authentication token not found");

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/property/${editPropertyId}/get`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data: PropertyDetailResponse | null = await response.json().catch(() => null);
        if (!response.ok || !data || data.success === false || data.status === "error") {
          throw new Error(data?.message || "Failed to load property details");
        }

        const property = data.data || data.property;
        if (!property || !isActive) return;

        const { imageItems, videoItem } = getGalleryMedia(property.gallery);
        setPropertyId(editPropertyId);
        setFormData({
          ...createEmptyFormData(),
          title: property.name || "",
          sales_type: normalizeListingType(property.type),
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          description: property.description || "",
          address: property.address || "",
          city: property.city || "",
          state: property.state || "",
          zip_code: property.zip_code || "",
          country: property.country || "",
          latitude: parseLatitudeLongitude(property.latitude),
          longitude: parseLatitudeLongitude(property.longitude),
          price: property.price || 0,
          images: [],
          videoFile: null,
          existingImages: imageItems,
          existingVideo:
            videoItem ||
            (property.video_url || property.video
              ? { id: 0, url: property.video_url || property.video || "" }
              : null),
        });
        setDeletedMediaIds([]);
      } catch (fetchError) {
        if (!isActive) return;
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load property details";
        setError(message);
        toast.error(message);
      } finally {
        if (isActive) setIsFetchingProperty(false);
      }
    };

    fetchProperty();
    return () => { isActive = false; };
  }, [editPropertyId]);

  useEffect(() => {
    if (step > 0 && !isFetchingProperty) {
      saveFormState(step, formData, propertyId);
    }
  }, [step, formData, propertyId, isFetchingProperty]);

  const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Location" },
    { id: 3, label: "Media" },
    { id: 4, label: "Pricing" },
    { id: 5, label: "Preview" },
  ];

  const handleInputChange = (
    field: keyof FormDataState,
    value: string | number | File[] | File | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.description && formData.bedrooms && formData.bathrooms && formData.area);
      case 2:
        return !!(formData.address && formData.city && formData.state && formData.zip_code && formData.country);
      case 3:
        return true;
      case 4:
        return formData.price > 0;
      default:
        return true;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== indexToRemove) }));
  };

  const handleRemoveExistingImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const removedImage = prev.existingImages[indexToRemove];
      if (removedImage?.id) {
        setDeletedMediaIds((current) =>
          current.includes(removedImage.id) ? current : [...current, removedImage.id],
        );
      }
      return { ...prev, existingImages: prev.existingImages.filter((_, i) => i !== indexToRemove) };
    });
  };

  const handleRemoveExistingVideo = () => {
    setFormData((prev) => {
      if (prev.existingVideo?.id) {
        setDeletedMediaIds((current) =>
          current.includes(prev.existingVideo!.id) ? current : [...current, prev.existingVideo!.id],
        );
      }
      return { ...prev, existingVideo: null };
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, videoFile: file }));
      setVideoWarning(null);
    }
  };

  const replaceVideoHandler = async (videoFile: File): Promise<boolean> => {
    if (!propertyId) {
      setError("Property ID is missing. Cannot replace video.");
      return false;
    }

    setIsLoading(true);
    setError(null);
    setVideoWarning(null);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication token not found");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const result = await replacePropertyVideoWithChunks(
        { baseUrl: baseUrl!, token },
        {
          propertyId,
          videoFile,
          onProgress: (progress) => setUploadProgress(progress.percent),
        },
      );

      if (!result.success) {
        setUploadProgress(100);
        // 403 or permission error — video update blocked by backend
        // but we allow the rest of the form to continue
        if (isPermissionError(result.message)) {
          setVideoWarning(
            `Video could not be updated: ${result.message}. Your other changes (images, details, price) will still be saved.`,
          );
          setUploadStatus("idle");
          setFormData((prev) => ({ ...prev, videoFile: null }));
          return true; // Continue to next step
        }
        throw new Error(result.message || "Failed to replace video");
      }

      setUploadStatus("success");
      toast.success("Video replaced successfully!", {
        style: { background: "black", color: "white", border: "1px solid #10b981" },
      });

      if (result.data?.video_url) {
        setFormData((prev) => ({
          ...prev,
          existingVideo: { id: prev.existingVideo?.id || 0, url: result.data!.video_url! },
          videoFile: null,
        }));
      } else {
        setFormData((prev) => ({ ...prev, videoFile: null }));
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to replace video";

      // If it's a permission/status error, show warning but continue
      if (isPermissionError(message)) {
        setVideoWarning(
          `Video could not be updated: ${message}. Your other changes will still be saved.`,
        );
        setUploadStatus("idle");
        setFormData((prev) => ({ ...prev, videoFile: null }));
        return true; // Continue to next step
      }

      setError(message);
      setUploadStatus("error");
      toast.error(message, {
        style: { background: "black", color: "white", border: "1px solid #ef4444" },
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadMedia = async (): Promise<boolean> => {
    if (!propertyId) {
      setError("Property ID is missing. Please complete previous steps first.");
      return false;
    }
    if (formData.images.length === 0) return true;

    setIsLoading(true);
    setError(null);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication token not found");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const payload = new FormData();
      for (const image of formData.images) {
        payload.append("uploaded_images[]", image);
      }
      setUploadProgress(50);

      const response = await fetch(`${baseUrl}/property/${propertyId}/update-images`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: payload,
      });

      const data: { success?: boolean; message?: string } | null = await response.json().catch(() => null);
      if (!response.ok || !data || data.success === false) {
        throw new Error(data?.message || "Failed to update property images");
      }

      setUploadProgress(100);
      setUploadStatus("success");
      toast.success(data.message || "Property images updated successfully", {
        style: { background: "black", color: "white", border: "1px solid #10b981" },
      });
      return true;
    } catch {
      const message = "Failed to update property images";
      setError(message);
      setUploadStatus("error");
      toast.error(message, {
        style: { background: "black", color: "white", border: "1px solid #ef4444" },
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRemovedMedia = async (): Promise<boolean> => {
    if (!propertyId || deletedMediaIds.length === 0) return true;

    const token = getAuthToken();
    if (!token) throw new Error("Authentication token not found");

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/property/${propertyId}/delete-media`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ deleted_image_ids: deletedMediaIds }),
    });

    const data: { success?: boolean; message?: string } | null = await response.json().catch(() => null);
    if (!response.ok || !data || data.success === false) {
      throw new Error(data?.message || "Failed to delete property media");
    }
    setDeletedMediaIds([]);
    return true;
  };

  const updatePropertyPrice = async (): Promise<boolean> => {
    if (!propertyId) {
      setError("Property ID is missing. Please complete previous steps first.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication token not found");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const requestBody = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        sales_type: formData.sales_type,
        property_type_id: formData.property_type_id,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const response = await fetch(`${baseUrl}/property/${propertyId}/edit`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data: { success?: boolean; message?: string } | null = await response.json().catch(() => null);
      if (!response.ok || !data || data.success === false) {
        throw new Error(data?.message || "Failed to update property");
      }

      toast.success("Property updated successfully! 🎉", {
        style: { background: "black", color: "white", border: "1px solid #10b981" },
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update property";

      if (errorMessage.includes("draft and pending")) {
        toast.error(
          "This property has already been published. Only draft or pending properties can be edited.",
          {
            duration: 6000,
            style: { background: "black", color: "white", border: "1px solid #ef4444" },
          }
        );
        setError(
          "This property cannot be edited because it has been published or approved. Contact support if you need to make changes."
        );
      } else {
        toast.error(errorMessage, {
          style: { background: "black", color: "white", border: "1px solid #ef4444" },
        });
        setError(errorMessage);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (!validateStep(step)) {
      setError("Please complete all required fields before proceeding");
      return;
    }

    setError(null);

    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(3); return; }

    if (step === 3) {
      if (deletedMediaIds.length > 0) {
        try {
          const success = await deleteRemovedMedia();
          if (!success) return;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to delete media";
          setError(message);
          toast.error(message, { style: { background: "black", color: "white", border: "1px solid #ef4444" } });
          return;
        }
      }

      if (formData.videoFile) {
        const replaced = await replaceVideoHandler(formData.videoFile);
        if (!replaced) return;
        // If videoWarning is set, it means video was skipped but we continue
      }

      const uploaded = await uploadMedia();
      if (uploaded) setStep(4);
      return;
    }

    if (step === 4) { setStep(5); return; }

    if (step === 5) {
      const success = await updatePropertyPrice();
      if (success) {
        clearFormState();
        window.location.href = "/agent-dashboard";
      }
    }
  };

  const handleStepIndicatorClick = (targetStep: number) => {
    if (targetStep <= step) {
      setError(null);
      setStep(targetStep);
      return;
    }
    setError("Please complete the current step before proceeding");
  };

  return (
    <div>
      <div className="mb-6" />

      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleStepIndicatorClick(s.id)}
              className={`flex items-center gap-2 ${s.id > step ? "cursor-not-allowed" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > s.id ? "bg-green-500 text-white" : step === s.id ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}
              >
                {step > s.id ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : s.id}
              </div>
              <span className={`text-sm font-medium ${step === s.id ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                {s.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div className={`w-6 h-px mx-1 ${step > s.id ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {isFetchingProperty ? (
          <div className="space-y-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-4 w-36 rounded-full bg-gray-100" />
              <div className="space-y-3">
                <div className="h-11 rounded-xl bg-gray-100" />
                <div className="h-11 rounded-xl bg-gray-100" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-11 rounded-xl bg-gray-100" />
                  <div className="h-11 rounded-xl bg-gray-100" />
                  <div className="h-11 rounded-xl bg-gray-100" />
                </div>
                <div className="h-32 rounded-2xl bg-gray-100" />
              </div>
            </div>
          </div>
        ) : error && step !== 3 ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <>
            {step === 1 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Home size={14} className="text-primary-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-base">Basic Information</h2>
                </div>
                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                )}
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Property Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Modern Waterfront Villa"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Listing Type</label>
                    <select
                      value={formData.sales_type}
                      onChange={(e) => handleInputChange("sales_type", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors text-gray-700 appearance-auto"
                    >
                      <option value="sales">For Sale</option>
                      <option value="fair">For Fair</option>
                      <option value="raffle">Raffle</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Bedrooms</label>
                      <input type="number" value={formData.bedrooms || ""} onChange={(e) => handleInputChange("bedrooms", parseInt(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Bathrooms</label>
                      <input type="number" value={formData.bathrooms || ""} onChange={(e) => handleInputChange("bathrooms", parseInt(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">m²</label>
                      <input type="number" value={formData.area || ""} onChange={(e) => handleInputChange("area", parseInt(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Description</label>
                    <textarea
                      rows={5}
                      placeholder="Describe your property..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors placeholder:text-gray-300 resize-y"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MapPin size={14} className="text-primary-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-base">Location</h2>
                </div>
                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                )}
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Address</label>
                    <input type="text" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">City</label>
                      <input type="text" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">State</label>
                      <input type="text" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">ZIP Code</label>
                      <input type="text" value={formData.zip_code} onChange={(e) => handleInputChange("zip_code", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Country</label>
                      <input type="text" value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Latitude</label>
                      <input type="text" placeholder="40.7128" value={formData.latitude} onChange={(e) => handleInputChange("latitude", parseLatitudeLongitude(e.target.value))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Longitude</label>
                      <input type="text" placeholder="-74.0060" value={formData.longitude} onChange={(e) => handleInputChange("longitude", parseLatitudeLongitude(e.target.value))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-primary-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-gray-900 text-base">Media Upload</h2>
                </div>

                {/* Video warning — non-blocking, shown when video replace is skipped */}
                {videoWarning && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-amber-500 shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm text-amber-700">{videoWarning}</p>
                  </div>
                )}

                {/* General error for step 3 */}
                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Property Images</label>
                    <label className="block border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-primary-400 transition-colors">
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      <div className="flex flex-col items-center justify-center py-12 bg-white">
                        <div className="mb-3 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                      </div>
                    </label>
                    {(formData.existingImages.length > 0 || formData.images.length > 0) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Images</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {formData.existingImages.map((image, index) => (
                            <div key={`existing-${image.id}-${index}`} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <Image src={image.url} alt={`Existing property image ${index + 1}`} className="w-full h-full object-cover" width={200} height={200} />
                              </div>
                              <button type="button" onClick={() => handleRemoveExistingImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove existing image ${index + 1}`}>×</button>
                            </div>
                          ))}
                          {formData.images.map((file, index) => (
                            <div key={`selected-${file.name}-${index}`} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <Image src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" width={200} height={200} />
                              </div>
                              <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Video Walkthrough</label>
                    <label className="block border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-primary-400 transition-colors">
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                      <div className="flex flex-col items-center justify-center py-12 bg-white">
                        <div className="mb-3 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Click to upload video</p>
                        <p className="text-xs text-gray-400 mt-1">MP4, MOV up to 500MB</p>
                      </div>
                    </label>
                    {formData.existingVideo && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Current Video</p>
                        <div className="relative group overflow-hidden rounded-xl border border-gray-200 bg-black">
                          <video src={formData.existingVideo.url} controls className="w-full max-h-72 object-contain" />
                          <button type="button" onClick={handleRemoveExistingVideo} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove existing video">×</button>
                        </div>
                      </div>
                    )}
                    {formData.videoFile && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Selected: {formData.videoFile.name}</p>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, videoFile: null }))}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {uploadStatus === "uploading" && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Uploading media...</span>
                        <span className="text-sm text-blue-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                  {uploadStatus === "success" && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700">✓ Media uploaded successfully</p>
                    </div>
                  )}
                  {uploadStatus === "error" && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-700">✗ Upload failed. Please try again.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <DollarSign size={14} className="text-primary-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-base">Pricing</h2>
                </div>
                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Property Price ($)</label>
                    <input
                      type="number"
                      placeholder="2500000"
                      value={formData.price || ""}
                      onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                  <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-primary-600 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    <p className="text-sm text-gray-600">Platform commission: <span className="font-bold text-gray-900">5%</span> of sale price</p>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <h2 className="font-bold text-gray-900 text-base">Preview & Publish</h2>
                </div>
                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                )}
                {videoWarning && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-amber-500 shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm text-amber-700">{videoWarning}</p>
                  </div>
                )}
                <div className="border border-gray-100 rounded-2xl py-16 flex flex-col items-center justify-center bg-gray-50/50">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-green-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Ready to Update</h3>
                  <p className="text-gray-400 text-sm">Review your listing details before saving.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between mt-5">
        <button
          onClick={() => { setError(null); setStep(step - 1); }}
          disabled={isLoading || isFetchingProperty}
          className={`flex items-center gap-2 border border-gray-200 text-gray-500 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors ${step === 1 ? "invisible" : ""} ${isLoading || isFetchingProperty ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          ← Previous
        </button>

        {step < 5 ? (
          <button
            onClick={handleNextStep}
            disabled={isLoading || isFetchingProperty}
            className={`flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors ${isLoading || isFetchingProperty ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {step === 3 ? "Uploading..." : "Processing..."}
              </>
            ) : (
              <>Next <ArrowUpRight size={15} /></>
            )}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => { setError(null); setStep(step - 1); }}
              disabled={isLoading || isFetchingProperty}
              className={`flex items-center gap-2 border border-gray-200 text-gray-500 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors ${isLoading || isFetchingProperty ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ← Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={isLoading || isFetchingProperty}
              className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors ${isLoading || isFetchingProperty ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>Update Property <ArrowUpRight size={15} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}