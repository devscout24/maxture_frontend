import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { readStoredAuthSession } from "@/lib/store";
import { toast } from "sonner";
import { getRaffleById, getRaffles, authenticatedFetch, isMockToken, getAuthToken } from "@/lib/api";

export function useRaffles() {
  const rafflesQuery = useQuery({
    queryKey: ["raffles"],
    queryFn: getRaffles,
    staleTime: 2 * 60 * 1000,
  });

  return {
    raffles: rafflesQuery.data?.raffles ?? [],
    isLoading: rafflesQuery.isLoading,
    isError: rafflesQuery.isError,
    error: rafflesQuery.error,
  };
}



export function useRaffle(raffleId: string | number) {
  const raffleQuery = useQuery({
    queryKey: ["raffle", raffleId],
    queryFn: () => getRaffleById(raffleId),
    enabled: !!raffleId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    raffle: raffleQuery.data?.raffle ?? null,
    isLoading: raffleQuery.isLoading,
    isError: raffleQuery.isError,
    error: raffleQuery.error,
    refetch: raffleQuery.refetch,
  };
}

export type BuyTicketPayload = {
  ticket_count: number;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export function useRaffleTickets(raffleId: string | number) {
  const queryClient = useQueryClient();

  const buyTicketMutation = useMutation({
    mutationFn: async (payload: BuyTicketPayload) => {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Please log in to purchase tickets");
      }

      if (isMockToken(token)) {
        // Increment ticket count in local storage for demo purposes
        const stored = localStorage.getItem("expovivienda_auth_session");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.user) {
              const currentCount = parsed.user.tickets_count || 0;
              parsed.user.tickets_count = currentCount + payload.ticket_count;
              localStorage.setItem("expovivienda_auth_session", JSON.stringify(parsed));
            }
          } catch (e) {
            console.error("Failed to update ticket count:", e);
          }
        }

        // Return a mock success response with the specific Stripe URL provided by the user
        return {
          success: true,
          message: "Demo purchase successful! Redirecting to secure checkout...",
          data: {
            checkout_url: "https://checkout.stripe.com/c/pay/cs_test_a1DV2gJQQ4AsMAVnLhoC8qQulwKnZjmzqzK2l6cAeXyKHHAzxTLogztwpX#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdicGRmZGhqaWBTZHdsZGtxJz8nZmprcXdqaScpJ2R1bE5gfCc%2FJ3VuWnFgdnFaMDRRVF1WfDVsQW1WUEBpXXVsNndyXzVxb1BXZGNiX01Pf2MxbG5ENTw3Qm5jYU08YnY3YmF1X3RRUDQ9Sml2TVF2TF9DcGk9Mm1XXX8yUT1kZG1zZ3VqaFA1NUBBaldxbW5uJyknY3dqaFZgd3Ngdyc%2FcXdwYCknZ2RmbmJ3anBrYUZqaWp3Jz8nJmNjY2NjYycpJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl"
          }
        };
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await authenticatedFetch(`${baseUrl}/raffle/${raffleId}/buy-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          tickets: payload.ticket_count // Add alias for backend compatibility
        }),
      });

      if (!response) {
        throw new Error("Authentication failed");
      }

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || data.success === false) {
        throw new Error(data?.message || "Failed to purchase tickets");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Tickets purchased successfully");
      if (data.data) {
        localStorage.setItem("last_payment_data", JSON.stringify(data.data));
      }
      queryClient.invalidateQueries({ queryKey: ["raffle", raffleId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to purchase tickets");
    },
  });

  return {
    buyTickets: buyTicketMutation.mutateAsync,
    isSubmitting: buyTicketMutation.isPending,
  };
}
