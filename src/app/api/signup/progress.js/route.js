import { NextResponse } from "next/server";

/**
 * Temporary in-memory storage
 * (Replace with DB later)
 */
let progressData = {
    lessonsCompleted: 12,
    weeklyConsistency: 85,
    skillMastery: 40,
};

// GET → fetch progress
export async function GET() {
    return NextResponse.json(progressData);
}

// POST → update progress
export async function POST(req) {
    const body = await req.json();

    progressData = {
        ...progressData,
        ...body,
    };

    return NextResponse.json({
        message: "Progress updated successfully",
        progress: progressData,
    });
}