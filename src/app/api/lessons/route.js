import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { isMockMode, mockGetLessons } from "@/lib/mockBackend";

export async function GET(request) {
  const type = request.nextUrl.searchParams.get("type");

  try {
    if (isMockMode()) {
      const data = await mockGetLessons(type || undefined);
      return NextResponse.json(data);
    }

    const qs = type ? `?type=${encodeURIComponent(type)}` : "";
    const data = await backendRequest(`/lessons${qs}`, { method: "GET" });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to load lessons" },
      { status: error.status || 500 },
    );
  }
}
