import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { localSignLanguageDetect } from "@/lib/localSignLanguage";

function shouldUseLocalFallback() {
  return process.env.USE_LOCAL_SIGN_FALLBACK === "true";
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (shouldUseLocalFallback()) {
      return NextResponse.json(localSignLanguageDetect(body));
    }

    const data = await backendRequest("/sign-language/detect", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      text: data?.text || "",
      token: data?.token || data?.text || null,
      confidence: data?.confidence ?? null,
      language: data?.language || body?.signLanguage || "ASL",
      candidates: data?.candidates || [],
      source: "backend",
      raw: data,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Sign language detection failed" },
      { status: error.status || 500 },
    );
  }
}
