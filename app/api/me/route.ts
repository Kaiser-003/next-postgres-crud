import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret);

    return NextResponse.json({
      message: "You are authenticated",
      user: decoded,
    });
  } catch (error) {
    console.error("JWT verification error:", error);

    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

