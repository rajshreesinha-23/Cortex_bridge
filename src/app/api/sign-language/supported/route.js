import { NextResponse } from "next/server";
import { getSupportedSignLanguages } from "@/lib/localSignLanguage";

export async function GET() {
  return NextResponse.json({
    languages: getSupportedSignLanguages(),
  });
}
