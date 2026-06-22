import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AgentProfile from "@/components/section/Agentss/AgentProfile";

type Props = {
  params: Promise<{ id: string }>;
};

// API response type
interface AgentDetailResponse {
  success: boolean;
  message: string;
  data: {
    agent: {
      id: number;
      name: string;
      avatar: string;
      bio: string | null;
      properties: Array<{
        id: number;
        title: string;
        price: number;
        address: string;
        bedrooms: number;
        bathrooms: number;
        area: number | null;
        thumbnail: string;
      }>;
    };
  };
}

async function fetchAgent(id: string): Promise<AgentDetailResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}/agent/${id}/get-by-id`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch agent: ${response.status}`);
  }

  return response.json();
}

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const agentResponse = await fetchAgent(id);

    if (!agentResponse.success || !agentResponse.data?.agent) {
      notFound();
    }

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-24">
          <AgentProfile agent={agentResponse.data.agent} />
        </div>
        <Footer />
      </>
    );
  } catch (error) {
    console.error("Error fetching agent:", error);
    notFound();
  }
}