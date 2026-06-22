import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { raffleId, ticket_count, name, email, phone, address } = await req.json();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Get auth token from request headers
  const authHeader = req.headers.get("Authorization");

  const response = await fetch(`${baseUrl}/raffle/${raffleId}/buy-ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify({ ticket_count, name, email, phone, address }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}