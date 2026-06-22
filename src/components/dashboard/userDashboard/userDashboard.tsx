"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/userDashboard/DashboardLayout";

import { toast } from "sonner";
import {
  changePassword,
  getAuthToken,
  type ChangePasswordPayload,
} from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  DollarSign,
  Heart,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Upload,
  TicketIcon,
  X,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";

const profileFields = [
  {
    icon: <Mail size={14} className="text-gray-400" />,
    label: "Email",
    key: "email",
    readOnly: true,
  },
  {
    icon: <Phone size={14} className="text-gray-400" />,
    label: "Phone",
    key: "phone",
    readOnly: false,
  },
  {
    icon: <MapPin size={14} className="text-gray-400" />,
    label: "Location",
    key: "address",
    readOnly: false,
  },
  {
    icon: <Calendar size={14} className="text-gray-400" />,
    label: "Member Since",
    key: "memberSince",
    readOnly: true,
    isText: true,
  },
];

export default function DashboardPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, initials, refreshProfile } = useDashboard();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [editData, setEditData] = useState<{
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    memberSince: string;
    avatar: File | null;
  }>({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || null,
    address: profile?.address || null,
    memberSince: profile?.memberSince || "",
    avatar: null,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  type ProfileSavePayload = {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    avatar: File | null;
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileSavePayload) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone || "");
      formData.append("address", data.address || "");
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }

      const response = await fetch(`${baseUrl}/user/profile-update`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok || !responseData?.success) {
        throw new Error(responseData?.message || "Failed to update profile");
      }

      return responseData;
    },
    onSuccess: async () => {
      toast.success("Profile updated successfully!", {
        style: { backgroundColor: "black", color: "white" },
      });
      setIsEditing(false);
      setEditData((current) => ({ ...current, avatar: null }));
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: ["dashboard-profile"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
        {
          style: { backgroundColor: "black", color: "white" },
        },
      );
    },
  });

  useEffect(() => {
    if (!profile) return;

    setEditData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || null,
      address: profile.address || null,
      memberSince: profile.memberSince || "",
      avatar: null,
    });
    setAvatarPreview(profile.avatar || null);
  }, [profile]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file", {
        style: { backgroundColor: "black", color: "white" },
      });
      return;
    }
    setEditData({ ...editData, avatar: file });
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    updateProfileMutation.mutate(
      {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        address: editData.address,
        avatar: editData.avatar,
      },
      {
        onSettled: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const handleCancel = () => {
    if (profile) {
      setEditData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        memberSince: profile.memberSince,
        avatar: null,
      });
    }
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPasswordError("All fields are required.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwords.newPass.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      setPasswordError("");


      const payload: ChangePasswordPayload = {
        old_password: passwords.current,
        password: passwords.newPass,
        password_confirmation: passwords.confirm,
      };

      const response = await changePassword(payload);
      if (response.success) {
        setPasswordSuccess(true);
        toast.success("Password changed successfully! Logging out...", {
          style: { backgroundColor: "black", color: "white" },
        });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(false);
          setPasswords({ current: "", newPass: "", confirm: "" });
          logout();
        }, 1000);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to change password";
      setPasswordError(msg);
      toast.error(msg, { style: { backgroundColor: "black", color: "white" } });
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError("");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  const stats = [
    {
      icon: (
        <div className="w-8 h-8 rounded-full bg-[#EFF3FF] flex items-center justify-center">
          <TicketIcon size={16} className="text-[#2664EB]" />
        </div>
      ),
      value: profile?.tickets_count?.toString() || "0",
      label: "Raffle Tickets",
    },
    {
      icon: (
        <div className="w-8 h-8 rounded-full bg-[#EFF3FF] flex items-center justify-center">
          <Heart size={16} className="text-[#2664EB]" />
        </div>
      ),
      value: profile?.saved_properties_count?.toString() || "0",
      label: "Saved Properties",
    },
    {
      icon: (
        <div className="w-8 h-8 rounded-full bg-[#EFF3FF] flex items-center justify-center">
          <DollarSign size={16} className="text-[#2664EB]" />
        </div>
      ),
      value: profile?.total_spent ? `$${profile.total_spent}` : "$0",
      label: "Total Spent",
    },
  ];

  return (
    <DashboardLayout
      initials={initials}
      ticketsCount={profile?.tickets_count || 0}
      savedCount={profile?.saved_properties_count || 0}
    >
      <div className="space-y-4">
        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-[#1B2B5E] flex items-center justify-center shrink-0 overflow-hidden relative">
                  {avatarPreview || profile?.avatar ? (
                    <Image
                      src={avatarPreview || profile?.avatar || ""}
                      alt="Profile"
                      className="w-full h-full object-fit"
                      width={56}
                      height={56}
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {initials}
                    </span>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 hover:opacity-100 transition-opacity"
                      aria-label="Upload profile image"
                    >
                      <Upload size={16} />
                    </button>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors shadow"
                    aria-label="Upload profile image"
                  >
                    <Upload size={10} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="font-bold text-gray-900 text-lg border-b border-primary-600 outline-none w-full bg-transparent"
                  />
                ) : (
                  <h2 className="font-bold text-gray-900 text-lg">
                    {profile?.name}
                  </h2>
                )}
                <p className="text-gray-400 text-xs mt-0.5">
                  Member since {profile?.memberSince}
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading || updateProfileMutation.isPending}
                  className="flex items-center gap-1 bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <Check size={13} />
                  {isLoading || updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 border border-gray-200 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-primary-600 text-xs font-semibold hover:underline"
              >
                <Pencil size={13} /> Edit Profile
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {profileFields.map((field) => (
              <div key={field.key} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  {field.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs mb-0.5">{field.label}</p>
                  {field.isText ? (
                    <p className="text-gray-900 text-sm font-medium truncate">
                      {profile?.[field.key as keyof typeof profile] as string}
                    </p>
                  ) : (
                    <input
                      value={
                        (editData[
                          field.key as keyof typeof editData
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          [field.key]: e.target.value,
                        })
                      }
                      readOnly={!isEditing || field.readOnly}
                      className={`text-gray-900 text-sm font-medium w-full bg-transparent outline-none rounded-lg px-0 py-0.5 ${!isEditing || field.readOnly
                          ? "border-transparent cursor-default"
                          : "border-b border-primary-600"
                        }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats Grid ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1 min-w-[200px]"
            >
              <div className="mb-3">{s.icon}</div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Security ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">
            Security & Preferences
          </h3>
          <div className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Lock size={14} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Change Password
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Last changed 3 months ago
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-primary-600 text-xs font-semibold hover:underline"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* ── Password Modal ─────────────────────────────────────────────────── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-base">
                Change Password
              </h3>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Current Password",
                  key: "current",
                  placeholder: "Enter current password",
                },
                {
                  label: "New Password",
                  key: "newPass",
                  placeholder: "Enter new password",
                },
                {
                  label: "Confirm New Password",
                  key: "confirm",
                  placeholder: "Confirm new password",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder={field.placeholder}
                    value={passwords[field.key as keyof typeof passwords]}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        [field.key]: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors placeholder:text-gray-300"
                  />
                </div>
              ))}

              {passwordError && (
                <p className="text-red-500 text-xs">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-green-500 text-xs font-semibold">
                  ✓ Password updated successfully!
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closePasswordModal}
                className="flex-1 border border-gray-200 text-gray-500 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordUpdate}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
