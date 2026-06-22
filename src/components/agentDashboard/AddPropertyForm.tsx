"use client";

import { useState, useEffect } from "react";
import { Home, MapPin, DollarSign, ArrowUpRight } from "lucide-react";
import { readStoredAuthSession } from "@/lib/store";
import { uploadPropertyStep2VideoWithChunks } from "./VideoUpload";
import { toast } from "sonner";
import Image from "next/image";
import { usePropertyTypeOptions } from "@/hooks/useProperties";

export default function AddPropertyForm() {
  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Save form state to localStorage
  const saveFormState = (
    currentStep: number,
    currentFormData: any,
    currentPropertyId: number | null,
  ) => {
    try {
      // Create a copy of formData without File objects
      const formDataToSave = { ...currentFormData };

      // Handle File objects (images and video) - store file info instead of actual files
      if (formDataToSave.images && formDataToSave.images.length > 0) {
        formDataToSave.imagesInfo = formDataToSave.images.map((file: File) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        }));
        delete formDataToSave.images; // Remove actual File objects
      }

      if (formDataToSave.videoFile) {
        formDataToSave.videoFileInfo = {
          name: formDataToSave.videoFile.name,
          size: formDataToSave.videoFile.size,
          type: formDataToSave.videoFile.type,
          lastModified: formDataToSave.videoFile.lastModified,
        };
        delete formDataToSave.videoFile; // Remove actual File object
      }

      const stateToSave = {
        step: currentStep,
        formData: formDataToSave,
        propertyId: currentPropertyId,
        timestamp: Date.now(),
      };
      localStorage.setItem("addPropertyFormState", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save form state:", error);
    }
  };

  // Load form state from localStorage
  const loadFormState = () => {
    try {
      const savedState = localStorage.getItem("addPropertyFormState");
      if (savedState) {
        const parsed = JSON.parse(savedState);

        // Check if state is not older than 24 hours
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;

        if (isRecent) {
          // Restore form data structure
          const restoredFormData = { ...parsed.formData };

          // Note: File objects (images and video) cannot be restored from localStorage
          // Users will need to re-select files after page refresh
          // This is a browser limitation for security reasons
          restoredFormData.images = []; // Reset to empty array
          restoredFormData.videoFile = null; // Reset to null

          // Show user notification about files if they had any
          if (
            parsed.formData.imagesInfo &&
            parsed.formData.imagesInfo.length > 0
          ) {
            console.log(
              "Previously selected images will need to be re-selected",
            );
          }
          if (parsed.formData.videoFileInfo) {
            console.log(
              "Previously selected video will need to be re-selected",
            );
          }

          return {
            ...parsed,
            formData: restoredFormData,
          };
        } else {
          // Clear old state
          localStorage.removeItem("addPropertyFormState");
        }
      }
    } catch (error) {
      console.error("Failed to load form state:", error);
      localStorage.removeItem("addPropertyFormState");
    }
    return null;
  };

  // Clear form state from localStorage
  const clearFormState = () => {
    try {
      localStorage.removeItem("addPropertyFormState");
    } catch (error) {
      console.error("Failed to clear form state:", error);
    }
  };

  // Form state for all steps
  const [formData, setFormData] = useState({
    // Step 1 - Basic Info
    title: "",
    sales_type: "raffle" as "raffle" | "sales" | "fair",
    bedrooms: 3,
    bathrooms: 2,
    property_type_id: 1,
    area: 1200,
    description: "",

    // Step 2 - Location
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    latitude: 1.00000001,
    longitude: 1.00000001,

    // Step 3 - Media
    images: [] as File[],
    videoFile: null as File | null,

    // Step 4 - Price
    price: 0,
  });

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const { propertyTypeOptions: propertyTypes } = usePropertyTypeOptions();

  // Load saved form state on component mount
  useEffect(() => {
    const savedState = loadFormState();
    if (savedState) {
      // Restore saved state
      setStep(savedState.step);
      setFormData(savedState.formData);
      setPropertyId(savedState.propertyId);
      console.log("Form state restored from localStorage");
    }
  }, []);



  // Auto-save form state whenever step or formData changes
  useEffect(() => {
    if (step > 0) {
      saveFormState(step, formData, propertyId);
    }
  }, [step, formData, propertyId]);

  const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Location" },
    { id: 3, label: "Media" },
    { id: 4, label: "Pricing" },
    { id: 5, label: "Preview" },
  ];

  // API function for Step 1 & 2
  const storeProperty = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try multiple ways to get the token
      const session = readStoredAuthSession();
      let token = session?.token || "";

      // Fallback: try to get token directly from localStorage
      if (!token) {
        const authData = localStorage.getItem("expovivienda_auth_session");
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            token = parsed.token || "";
          } catch (e) {
            console.error("Failed to parse auth data:", e);
          }
        }
      }

      // Final fallback: try legacy token
      if (!token) {
        token = localStorage.getItem("auth_token") || "";
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return false;
      }

      if (token === "legacy-demo-session") {
        setError(
          "Demo session detected. Please log out and log in with a real account.",
        );
        return false;
      }

      // Ensure numeric fields are properly typed before sending
      const payload = {
        ...formData,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        price: Number(formData.price),
      };

      const response = await fetch(`${baseUrl}/property/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log("API Response:", result);
      console.log("Response status:", response.status);

      if (result.success) {
        setPropertyId(result.data.property_id);
        return true;
      } else {
        throw new Error(
          result.message || `Failed to store property (${response.status})`,
        );
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to store property",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next step with API calls
  const handleNextStep = async () => {
    // Validate current step before proceeding
    if (!validateStep(step)) {
      setError("Please complete all required fields before proceeding");
      return;
    }

    if (step === 1) {
      // Just save data and proceed to next step (no API call)
      setStep(step + 1);
    } else if (step === 2) {
      // Call API for Step 1 & 2 combined
      const success = await storeProperty();
      if (success) {
        setStep(step + 1);
      }
    } else if (step === 3) {
      // Upload media for Step 3
      const success = await uploadMedia();
      if (success) {
        setStep(step + 1);
      }
    } else if (step === 4) {
      // Just save price and proceed to next step (no API call)
      setStep(step + 1);
    } else if (step === 5) {
      // Call API for Step 5 - Update price and publish
      const success = await updatePropertyPrice();
      if (success) {
        // Clear form state since property is successfully published
        clearFormState();

        // Navigate to agent dashboard
        window.location.href = "/agent-dashboard";
      }
    } else {
      // For other steps, just navigate
      setStep(step + 1);
    }
  };

  // Handle form data changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Form validation
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return (
          !!formData.title &&
          !!formData.description &&
          formData.bedrooms !== undefined &&
          formData.bedrooms !== null &&
          formData.bathrooms !== undefined &&
          formData.bathrooms !== null &&
          // Allow area to be 0 — backend accepts 0 as valid
          formData.area !== undefined &&
          formData.area !== null &&
          Number(formData.area) >= 0
        );
      case 2:
        return !!(
          formData.address &&
          formData.city &&
          formData.state &&
          formData.zip_code &&
          formData.country
        );
      case 3:
        return !!(formData.images.length > 0 || formData.videoFile); // At least one media file
      case 4:
        return !!(formData.price > 0);
      default:
        return true;
    }
  };

  // Handle file uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  // Handle image removal
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        videoFile: file,
      }));
    }
  };

  // Upload function for Step 3
  const uploadMedia = async () => {
    if (!propertyId) {
      setError("Property ID is missing. Please complete previous steps first.");
      return false;
    }

    // Check if there's anything to upload
    if (
      (!formData.images || formData.images.length === 0) &&
      !formData.videoFile
    ) {
      setError("Please select at least one image or video to upload.");
      return false;
    }

    // Try multiple ways to get the token
    const session = readStoredAuthSession();
    let token = session?.token || "";

    // Fallback: try to get token directly from localStorage
    if (!token) {
      const authData = localStorage.getItem("expovivienda_auth_session");
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          token = parsed.token || "";
        } catch (e) {
          console.error("Failed to parse auth data:", e);
        }
      }
    }

    // Final fallback: try legacy token
    if (!token) {
      token = localStorage.getItem("auth_token") || "";
    }

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return false;
    }

    if (token === "legacy-demo-session") {
      setError(
        "Demo session detected. Please log out and log in with a real account.",
      );
      return false;
    }

    setIsLoading(true);
    setError(null);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

      // Use the proper VideoUpload utilities
      const options = {
        baseUrl,
        token,
        // Don't add /api here, VideoUpload.tsx already adds it
        endpointBuilder: (propertyId: string | number) =>
          `/property/${propertyId}/step2`,
      };

      console.debug("Starting upload with options:", { baseUrl, hasToken: !!token });

      // Validate video file before upload
      if (formData.videoFile) {
        // Check file type (no size limit)
        const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
        if (!allowedTypes.includes(formData.videoFile.type)) {
          throw new Error(
            "Invalid video format. Please use MP4, WebM, or MOV.",
          );
        }
      }

      // Prepare input for video upload
      const uploadInput: any = {
        propertyId,
        images: formData.images || [],
        chunkSizeBytes: 1 * 1024 * 1024,
        onProgress: ({ percent }: any) => {
          setUploadProgress(percent);
        },
      };

      // Only add videoFile if it exists
      if (formData.videoFile) {
        uploadInput.videoFile = formData.videoFile;
      }

      const result = await uploadPropertyStep2VideoWithChunks(
        options,
        uploadInput,
      );
      console.log("Media upload result:", result);

      if (formData.videoFile) {
        console.debug("Video file info:", { name: formData.videoFile.name, size: formData.videoFile.size, type: formData.videoFile.type, chunkSize: uploadInput.chunkSizeBytes });
      }

      if (result.success) {
        setUploadProgress(100);
        setUploadStatus("success");
        return true;
      }

      // Chunked upload failed — attempt single-file fallback to the /video endpoint
      console.warn("Chunked upload failed, attempting single-file fallback", result);
      setUploadProgress((current) => Math.max(current, 95));
      try {
        const singleResult = await uploadVideo(baseUrl, token, propertyId);
        console.log("Single-file video upload result:", singleResult);
        if (singleResult && (singleResult as any).success) {
          setUploadProgress(100);
          setUploadStatus("success");
          return true;
        }

        throw new Error((singleResult as any)?.message || "Single-file upload failed");
      } catch (fallbackError) {
        console.error("Single-file upload fallback failed:", fallbackError);
        throw fallbackError;
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Handle specific stream resource error
      let errorMessage = "Upload failed";
      if (error instanceof Error) {
        if (
          error.message.includes("stream resource") ||
          error.message.includes("fclose")
        ) {
          errorMessage =
            "Video upload failed due to file processing error. Please try a smaller video file or different format.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setUploadStatus("error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload images function
  const uploadImages = async (
    baseUrl: string,
    token: string,
    propertyId: number,
  ) => {
    const imageFormData = new FormData();

    // Add all images to FormData
    formData.images.forEach((image: File, index: number) => {
      imageFormData.append(`images[${index}]`, image);
    });
    imageFormData.append("property_id", propertyId.toString());

    const response = await fetch(`${baseUrl}/property/${propertyId}/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: imageFormData,
    });

    const result = await response.json();
    console.log("Image upload response:", result);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Image upload failed");
    }

    return result;
  };

  // Upload video function
  const uploadVideo = async (
    baseUrl: string,
    token: string,
    propertyId: number,
  ) => {
    if (!formData.videoFile) {
      throw new Error("Video file is missing");
    }

    const videoFormData = new FormData();
    videoFormData.append("video", formData.videoFile);
    videoFormData.append("property_id", propertyId.toString());

    const response = await fetch(`${baseUrl}/property/${propertyId}/video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: videoFormData,
    });

    const result = await response.json();
    console.log("Video upload response:", result);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Video upload failed");
    }

    return result;
  };

  // API function for Step 5 - Update price and publish
  const updatePropertyPrice = async () => {
    if (!propertyId) {
      setError("Property ID is missing. Please complete previous steps first.");
      return false;
    }

    // Try multiple ways to get the token
    const session = readStoredAuthSession();
    let token = session?.token || "";

    // Fallback: try to get token directly from localStorage
    if (!token) {
      const authData = localStorage.getItem("expovivienda_auth_session");
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          token = parsed.token || "";
        } catch (e) {
          console.error("Failed to parse auth data:", e);
        }
      }
    }

    // Final fallback: try legacy token
    if (!token) {
      token = localStorage.getItem("auth_token") || "";
    }

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return false;
    }

    if (token === "legacy-demo-session") {
      setError(
        "Demo session detected. Please log out and log in with a real account.",
      );
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

      const response = await fetch(
        `${baseUrl}/property/${propertyId}/update-price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            price: formData.price,
          }),
        },
      );

      const result = await response.json();
      console.log("Price update response:", result);

      if (result.success) {
        toast.success("Property published successfully! 🎉", {
          style: {
            background: "black",
            color: "white",
            border: "1px solid #10b981",
          },
        });
        return true;
      } else {
        toast.error(
          result.message || `Failed to publish property (${response.status})`,
          {
            style: {
              background: "black",
              color: "white",
              border: "1px solid #ef4444",
            },
          },
        );
        throw new Error(
          result.message || `Failed to update price (${response.status})`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to publish property";
      toast.error(errorMessage, {
        style: {
          background: "black",
          color: "white",
          border: "1px solid #ef4444",
        },
      });
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Fill in the details to list your property
        </p>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleStepIndicatorClick(s.id)}
              className={`flex items-center gap-2 ${s.id > step ? "cursor-not-allowed" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > s.id
                  ? "bg-green-500 text-white"
                  : step === s.id
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-400"
                  }`}
              >
                {step > s.id ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span
                className={`text-sm font-medium ${step === s.id
                  ? "text-gray-900 font-semibold"
                  : "text-gray-400"
                  }`}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`w-6 h-px mx-1 ${step > s.id ? "bg-green-300" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Step 1 - Basic Info */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Home size={14} className="text-primary-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-base">
                Basic Information
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Property Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Modern Waterfront Villa"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors placeholder:text-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Listing Type
                  </label>
                  <select
                    value={formData.sales_type}
                    onChange={(e) =>
                      handleInputChange("sales_type", e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors text-gray-700 appearance-auto"
                  >
                    {/* <option value="sales">For Sale</option>
                    <option value="fair">For Fair</option> */}
                    <option value="raffle">Raffle</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Property Type
                  </label>
                  <select
                    value={
                      propertyTypes.length > 0 ? formData.property_type_id : ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "property_type_id",
                        Number(e.target.value),
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors text-gray-700 appearance-auto"
                  >
                    <option value="" disabled>
                      Select Property Type
                    </option>
                    {propertyTypes.length > 0
                      ? propertyTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))
                      : null}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "bedrooms",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "bathrooms",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    m²
                  </label>
                  <input
                    type="number"
                    value={formData.area || ""}
                    onChange={(e) =>
                      handleInputChange("area", parseInt(e.target.value) || 0)
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your property..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors placeholder:text-gray-300 resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Location */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <MapPin size={14} className="text-primary-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-base">Location</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) =>
                      handleInputChange("zip_code", e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="40.7128"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleInputChange(
                        "latitude",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="-74.0060"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleInputChange(
                        "longitude",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Media */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-primary-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <h2 className="font-bold text-gray-900 text-base">
                Media Upload
              </h2>
            </div>

            <div className="space-y-6">
              {/* Property Images */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Property Images
                </label>
                <label className="block border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <div className="flex flex-col items-center justify-center py-12 bg-white">
                    <div className="mb-3 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG up to 10MB each
                    </p>
                  </div>
                </label>
                {formData.images.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Images ({formData.images.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              width={200}
                              height={200}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Walkthrough */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Video Walkthrough
                </label>
                <label className="block border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoUpload}
                  />
                  <div className="flex flex-col items-center justify-center py-12 bg-white">
                    <div className="mb-3 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      Click to upload video
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      MP4, MOV up to 500MB
                    </p>
                  </div>
                </label>
                {formData.videoFile && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      Selected Video: {formData.videoFile.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploadStatus === "uploading" && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      Uploading media...
                    </span>
                    <span className="text-sm text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-700">
                    ✓ Media uploaded successfully
                  </p>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700">
                    ✗ Upload failed. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4 - Pricing */}
        {step === 4 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign size={14} className="text-primary-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-base">Pricing</h2>
            </div>

            <div className="space-y-4">
              {/* Property Price */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Property Price ($)
                </label>
                <input
                  type="number"
                  placeholder="2500000"
                  value={formData.price || ""}
                  onChange={(e) =>
                    handleInputChange("price", parseFloat(e.target.value) || 0)
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors placeholder:text-gray-300"
                />
              </div>

              {/* Commission Notice */}
              <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-primary-600 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                <p className="text-sm text-gray-600">
                  Platform commission:{" "}
                  <span className="font-bold text-gray-900">5%</span> of sale
                  price
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 - Preview */}
        {step === 5 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                className="text-green-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <h2 className="font-bold text-gray-900 text-base">
                Preview & Publish
              </h2>
            </div>

            <div className="border border-gray-100 rounded-2xl py-16 flex flex-col items-center justify-center bg-gray-50/50">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="text-green-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">
                Ready to Publish
              </h3>
              <p className="text-gray-400 text-sm">
                Review your listing details before publishing. You can edit
                anytime.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next / Back / Submit Buttons */}
      <div className="flex justify-between mt-5">
        <button
          onClick={() => setStep(step - 1)}
          disabled={isLoading}
          className={`flex items-center gap-2 border border-gray-200 text-gray-500 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors ${step === 1 ? "invisible" : ""
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          ← Previous
        </button>

        {step < 5 ? (
          <button
            onClick={handleNextStep}
            disabled={isLoading}
            className={`flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {step === 3 ? "Uploading..." : "Processing..."}
              </>
            ) : (
              <>
                Next <ArrowUpRight size={15} />
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
              className={`flex items-center gap-2 border border-gray-200 text-gray-500 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ← Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={isLoading}
              className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  Publish Listing <ArrowUpRight size={15} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
