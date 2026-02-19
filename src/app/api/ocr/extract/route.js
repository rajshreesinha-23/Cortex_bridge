import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { localOcrFallback } from "@/lib/localOcr";

function useLocalFallback() {
  return process.env.USE_LOCAL_OCR_FALLBACK === "true";
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (useLocalFallback()) {
      return NextResponse.json(localOcrFallback());
    }

    const data = await backendRequest("/ocr/extract", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      text: data?.text || "",
      source: "backend",
      raw: data,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "OCR extraction failed" },
      { status: error.status || 500 },
    );
  }
}
