"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Lock,
  Pencil,
  Eye,
  EyeOff,
  Upload,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import UserInitials from "./UserInitials";
import { getUserProfile, getAuthToken, authenticatedFetch, isMockToken, getAssetBaseUrl } from "@/lib/api";

// Types
interface ProfileUser {
  name?: string;
  role?: string;
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
}

interface StripeAccountResponse {
  is_ready: boolean;
  status_message: string;
  requirements: string[];
}

interface ConnectStripeResponse {
  success: boolean;
  url: string;
}

interface UpdateProfileResponse {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: null;
  exception_path: null;
  data: {
    bio?: string | null;
    name: string;
    email: string;
    avatar: string | null;
    address: string | null;
    phone: string;
    birth_date: null;
  };
}

interface ChangePasswordResponse {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: null;
  exception_path: null;
  data: {
    name: string;
    email: string;
    avatar: null;
  };
}

interface ProfileSettingsProps {
  user: ProfileUser | null;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const [settingsTab, setSettingsTab] = useState<"personal" | "security">("personal");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    password: "",
    password_confirmation: "",
  });

  const resolveAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return "";
    if (avatar.startsWith("http")) return avatar;
    const base = getAssetBaseUrl();
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanPath = avatar.startsWith("/") ? avatar.slice(1) : avatar;
    return cleanBase ? `${cleanBase}/${cleanPath}` : cleanPath;
  };

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(),
  });

  const { data: stripeData, isLoading: isStripeLoading } = useQuery<StripeAccountResponse>({
    queryKey: ["stripe-account"],
    queryFn: async () => {
      const token = getAuthToken();
      if (isMockToken(token)) {
        return { is_ready: false, status_message: "Stripe connection not available in demo mode", requirements: [] };
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await authenticatedFetch(`${baseUrl}/agent/stripe-connect/get-account`);
      if (!response || response.status === 400) {
        return { is_ready: false, status_message: "Stripe account not connected", requirements: [] };
      }
      if (!response.ok) {
        throw new Error("Failed to fetch Stripe account data");
      }
      return response.json();
    },
    retry: false,
  });

  const connectStripeMutation = useMutation<ConnectStripeResponse, Error, void>({
    mutationFn: async () => {
      const token = getAuthToken();
      if (isMockToken(token)) {
        toast.info("Stripe connection is not available for Google demo accounts yet.");
        return { success: false, url: "" };
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await authenticatedFetch(`${baseUrl}/agent/stripe-connect/create-account`, { method: "POST" });
      if (!response || !response.ok) {
        throw new Error("Failed to create Stripe connection");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid response from server");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to connect Stripe");
    },
  });

  const updateProfileMutation = useMutation<UpdateProfileResponse, Error, typeof formData>({
    mutationFn: async (data) => {
      const token = getAuthToken();
      if (isMockToken(token)) {
        const stored = localStorage.getItem("expovivienda_auth_session");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.user) {
              parsed.user = { ...parsed.user, ...data };
              localStorage.setItem("expovivienda_auth_session", JSON.stringify(parsed));
            }
          } catch (e) {
            console.error("Failed to update local session:", e);
          }
        }
        return {
          success: true,
          message: "Profile updated successfully",
          data: { ...data, avatar: null, birth_date: null },
        } as any;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const payload = new FormData();
      payload.append("name", data.name);
      payload.append("email", data.email);
      payload.append("phone", data.phone);
      payload.append("address", data.address);
      if (data.bio) payload.append("bio", data.bio);
      if (avatarFile) payload.append("avatar", avatarFile);

      const response = await authenticatedFetch(`${baseUrl}/user/profile-update`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: payload,
      });

      if (!response) {
        throw new Error("Failed to update profile");
      }

      const result = (await response.json().catch(() => null)) as UpdateProfileResponse | null;

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to update profile");
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Profile updated successfully");
      const updatedAvatar = resolveAvatarUrl(data.data.avatar);

      const persistUpdatedSessionUser = () => {
        try {
          const stored = localStorage.getItem("expovivienda_auth_session");
          if (!stored) return;
          const parsed = JSON.parse(stored);
          if (!parsed?.user) return;

          parsed.user = {
            ...parsed.user,
            name: data.data.name ?? parsed.user.name,
            address: data.data.address ?? parsed.user.address,
            phone: data.data.phone ?? parsed.user.phone,
            avatar: updatedAvatar || parsed.user.avatar,
            bio: data.data.bio !== undefined ? data.data.bio : parsed.user.bio,
          };

          localStorage.setItem("expovivienda_auth_session", JSON.stringify(parsed));
        } catch (sessionError) {
          console.error("Failed to persist updated profile in session:", sessionError);
        }
      };

      persistUpdatedSessionUser();

      queryClient.setQueryData(["profile"], (previous: any) => {
        const prevUser = previous?.data?.user;
        return {
          ...(previous ?? {}),
          success: previous?.success ?? true,
          data: {
            ...(previous?.data ?? {}),
            user: {
              ...(prevUser ?? {}),
              name: data.data.name ?? prevUser?.name ?? formData.name,
              email: prevUser?.email ?? formData.email,
              address: data.data.address ?? prevUser?.address ?? formData.address,
              phone: data.data.phone ?? prevUser?.phone ?? formData.phone,
              avatar: updatedAvatar || prevUser?.avatar || "",
              bio: data.data.bio !== undefined ? data.data.bio : (prevUser?.bio ?? formData.bio),
            },
          },
        };
      });

      setFormData((prev) => ({
        ...prev,
        name: data.data.name ?? prev.name,
        phone: data.data.phone ?? prev.phone,
        address: data.data.address ?? prev.address,
        bio: data.data.bio !== undefined && data.data.bio !== null ? data.data.bio : prev.bio,
      }));

      if (updatedAvatar) {
        setAvatarPreview(updatedAvatar);
      }

      setAvatarFile(null);
      setIsEditingProfile(false);

      // Force profile data refresh
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation<ChangePasswordResponse, Error, typeof passwordData>({
    mutationFn: async (data) => {
      const token = getAuthToken();
      if (isMockToken(token)) {
        throw new Error("Password cannot be changed for Google accounts here.");
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await authenticatedFetch(`${baseUrl}/user/change-password`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response || !response.ok) {
        throw new Error("Failed to change password");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password changed successfully");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("expovivienda_auth_session");
      setTimeout(() => router.push("/login"), 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const profile = profileData?.data?.user;

  React.useEffect(() => {
    if (profile && !isEditingProfile) {
      const avatarUrl = resolveAvatarUrl(profile.avatar);
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        bio: profile.bio || "",
      });
      setAvatarPreview(avatarUrl);
    }
  }, [profile, isEditingProfile]);

  React.useEffect(() => {
    if (!avatarFile) return;
    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingProfile) return;
    updateProfileMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordData);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(e.target.files?.[0] || null);
  };

  const toggleProfileEditMode = () => {
    setIsEditingProfile((current) => {
      const next = !current;
      if (!next) {
        setAvatarFile(null);
        const avatarUrl = resolveAvatarUrl(profile?.avatar);
        setAvatarPreview(avatarUrl);
      }
      return next;
    });
  };

  return (
    <div>
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {isLoading ? (
            <>
              <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse"></div>
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-xl bg-[#1B2B5E] flex items-center justify-center shrink-0 overflow-hidden">
                {avatarPreview || profile?.avatar ? (
                  <Image
                    src={avatarPreview || profile?.avatar || ""}
                    alt={profile?.name || user?.name || "Profile avatar"}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserInitials user={profile || user} className="text-white font-bold text-lg" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  {profile?.name || user?.name || "Agent"}
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {profile?.created_at
                    ? `Member since ${new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                    : "Member since March 2025"}
                </p>
              </div>
            </>
          )}
        </div>
        {isLoading || isStripeLoading ? (
          <div className="h-9 w-44 bg-gray-200 rounded-full animate-pulse"></div>
        ) : stripeData?.is_ready ? (
          <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm">
            <CheckCircle size={15} strokeWidth={2.5} />
            Stripe Connected
          </button>
        ) : (
          <button
            type="button"
            onClick={() => connectStripeMutation.mutate()}
            disabled={connectStripeMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFF2E0] text-[#FF9500] text-xs font-bold rounded-full hover:bg-[#FFE8CC] transition-colors disabled:opacity-50"
          >
            {connectStripeMutation.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-[#FF9500] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <AlertTriangle size={15} strokeWidth={2.5} />
            )}
            {connectStripeMutation.isPending ? "Connecting..." : "Connect Stripe Account"}
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">Failed to load profile data. Please try again.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-2 bg-gray-100 rounded-full p-1 mb-6">
        <button
          onClick={() => setSettingsTab("personal")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-colors ${settingsTab === "personal" ? "bg-primary-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <User size={14} />
          Personal
        </button>
        <button
          onClick={() => setSettingsTab("security")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-colors ${settingsTab === "security" ? "bg-primary-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <Lock size={14} />
          Security
        </button>
      </div>

      {/* Personal Tab */}
      {settingsTab === "personal" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-base">Personal Information</h3>
            {isLoading ? (
              <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            ) : (
              <button
                type="button"
                onClick={toggleProfileEditMode}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full hover:bg-blue-200 transition-colors"
              >
                <Pencil size={12} />
                {isEditingProfile ? "Cancel Edit" : "Edit Profile"}
              </button>
            )}
          </div>
          <p className="text-gray-400 text-xs mb-6">Update your personal details and contact info</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            <div className="flex justify-center sm:justify-start">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-[#1B2B5E] overflow-hidden border border-gray-200 shadow-sm">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={formData.name || "Profile avatar"}
                      width={80}
                      height={80}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserInitials user={profile || user} className="text-white font-bold text-xl" />
                    </div>
                  )}
                </div>
                {isEditingProfile && (
                  <>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
                      aria-label="Upload avatar"
                    >
                      <Upload size={14} />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </>
                )}
              </div>
            </div>

            {/* Full Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
                {isLoading ? (
                  <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                ) : (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly={!isEditingProfile}
                    placeholder="John Agent"
                    className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-300 ${isEditingProfile ? "bg-white focus:border-primary-600" : "bg-gray-50 text-gray-500 cursor-not-allowed"
                      }`}
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
                {isLoading ? (
                  <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                ) : (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    placeholder="john@expovivienda.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            {/* Phone + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone</label>
                {isLoading ? (
                  <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                ) : (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    readOnly={!isEditingProfile}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${isEditingProfile ? "bg-white focus:border-primary-600" : "bg-gray-50 text-gray-500 cursor-not-allowed"
                      }`}
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Location</label>
                {isLoading ? (
                  <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                ) : (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    readOnly={!isEditingProfile}
                    placeholder="City, State"
                    className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-300 ${isEditingProfile ? "bg-white focus:border-primary-600" : "bg-gray-50 text-gray-500 cursor-not-allowed"
                      }`}
                  />
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Bio</label>
              {isLoading ? (
                <div className="h-24 w-full bg-gray-200 rounded-xl animate-pulse"></div>
              ) : (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  readOnly={!isEditingProfile}
                  placeholder="Tell clients about yourself, your experience, and areas of expertise..."
                  className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-300 resize-none ${isEditingProfile ? "bg-white focus:border-primary-600" : "bg-gray-50 text-gray-500 cursor-not-allowed"
                    }`}
                />
              )}
            </div>

            {/* Save */}
            {isEditingProfile && (
              <div className="flex justify-end">
                {isLoading ? (
                  <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                ) : (
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Security Tab */}
      {settingsTab === "security" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-base mb-1">Security</h3>
          <p className="text-gray-400 text-xs mb-6">Manage your password and account security</p>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors bg-gray-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password + Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors bg-gray-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={passwordData.password_confirmation}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors bg-gray-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                    </svg>
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}