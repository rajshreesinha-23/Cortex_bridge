import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { isMockMode, mockGetProgress, mockUpdateProgress } from "@/lib/mockBackend";

export async function GET(request) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "email is required" }, { status: 400 });
  }

  try {
    if (isMockMode()) {
      const data = await mockGetProgress(email);
      return NextResponse.json(data);
    }

    const data = await backendRequest(`/progress?email=${encodeURIComponent(email)}`, {
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to load progress" },
      { status: error.status || 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (isMockMode()) {
      const data = await mockUpdateProgress(body);
      return NextResponse.json(data);
    }

    const data = await backendRequest("/progress", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update progress" },
      { status: error.status || 500 },
    );
  }
}
