

import { useQuery } from "@tanstack/react-query";
import { getAgents, getAgentById } from "@/lib/api";

export default function useAgents() {
  const agentsQuery = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    agents: agentsQuery.data?.data?.agents ?? [],
    stats: agentsQuery.data?.data?.stats ?? null,
    isLoading: agentsQuery.isLoading,
    isError: agentsQuery.isError,
    error: agentsQuery.error,
  };
}

export function useAgentDetail(agentId: string | number) {
  const agentQuery = useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => getAgentById(agentId),
    enabled: !!agentId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    agent: agentQuery.data?.data?.agent ?? null,
    isLoading: agentQuery.isLoading,
    isError: agentQuery.isError,
    error: agentQuery.error,
  };
}
