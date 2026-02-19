import { NextResponse } from "next/server";

export async function POST(req) {

  try {
    const body = await req.json();

    const { name, email, password } = body;

    // simple validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      );
    }

    // 🔥 For now just console log (later DB connect karenge)
    console.log("New User:");
    console.log(name, email, password);

    return NextResponse.json({
      message: "Signup successful 🎉"
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
