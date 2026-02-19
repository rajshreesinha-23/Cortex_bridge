import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import {
  isMockMode,
  mockGetPreferences,
  mockUpdatePreferences,
} from "@/lib/mockBackend";

export async function GET(request) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "email is required" }, { status: 400 });
  }

  try {
    if (isMockMode()) {
      const data = await mockGetPreferences(email);
      return NextResponse.json(data);
    }

    const data = await backendRequest(`/preferences?email=${encodeURIComponent(email)}`, {
      method: "GET",
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to load preferences" },
      { status: error.status || 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (isMockMode()) {
      const data = await mockUpdatePreferences(body);
      return NextResponse.json(data);
    }

    const data = await backendRequest("/preferences", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update preferences" },
      { status: error.status || 500 },
    );
  }
}
