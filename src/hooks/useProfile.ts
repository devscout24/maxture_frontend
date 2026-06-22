import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile, getAuthToken, type UserProfileResponse, type ProfileUpdatePayload, type ProfileUpdateResponse } from "@/lib/api";

export default function useProfile() {
  const token = getAuthToken();
  const queryClient = useQueryClient();

  const profileQuery = useQuery<UserProfileResponse>({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(),
    enabled: !!token,
    retry: (failureCount, error: any) => {
      if (error?.message === "Authentication failed") return false;
      return failureCount < 2;
    },
  });

  const updateProfileMutation = useMutation<ProfileUpdateResponse, unknown, ProfileUpdatePayload>({
    mutationFn: (payload) => updateUserProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], (oldData: UserProfileResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            user: {
              ...oldData.data.user,
              ...data.data,
            },
          },
        };
      });
      // Also update the auth session data in cache
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  return {
    profile: profileQuery.data?.data?.user ?? null,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    refetch: profileQuery.refetch,
  };
}
