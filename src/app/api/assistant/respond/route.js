import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { isMockMode } from "@/lib/mockBackend";
import { localAssistantReply } from "@/lib/localAssistant";

function shouldUseLocalFallback() {
  return process.env.USE_LOCAL_AI_FALLBACK === "true";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = body?.message || "";

    if (isMockMode() || shouldUseLocalFallback()) {
      return NextResponse.json({
        reply: localAssistantReply(message),
        source: "local",
      });
    }

    const data = await backendRequest("/assistant/respond", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      reply: data?.reply || "",
      source: "backend",
      raw: data,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Assistant request failed" },
      { status: error.status || 500 },
    );
  }
}
