

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWishlist, toggleWishlist, getAuthToken, type WishlistResponse, type WishlistToggleResponse } from "@/lib/api";

import { toast } from "sonner";

export default function useWishlist() {
  const token = getAuthToken();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getWishlist(),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: (propertyId: string | number) => toggleWishlist(propertyId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });

      toast.success(data.message, {
        style: { background: "black", color: "white" },
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update wishlist");
    },
  });

  return {
    wishlist: wishlistQuery.data?.wishlist ?? [],
    isLoading: wishlistQuery.isLoading,
    isError: wishlistQuery.isError,
    toggleWishlist: toggleWishlistMutation.mutateAsync,
    isToggling: toggleWishlistMutation.isPending,
    refetch: wishlistQuery.refetch,
  };
}
