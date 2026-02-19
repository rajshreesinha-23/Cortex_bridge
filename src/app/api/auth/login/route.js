import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { isMockMode, mockLogin } from "@/lib/mockBackend";

export async function POST(request) {
  try {
    const body = await request.json();

    if (isMockMode()) {
      const data = await mockLogin(body);
      return NextResponse.json(data);
    }

    const data = await backendRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Login failed" },
      { status: error.status || 500 },
    );
  }
}
