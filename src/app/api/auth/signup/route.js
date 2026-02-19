import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { isMockMode, mockSignup } from "@/lib/mockBackend";

export async function POST(request) {
  try {
    const body = await request.json();

    if (isMockMode()) {
      const data = await mockSignup(body);
      return NextResponse.json(data);
    }

    const data = await backendRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Signup failed" },
      { status: error.status || 500 },
    );
  }
}
