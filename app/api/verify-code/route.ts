import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, reset_code, reset_code_expires_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    const user = result.rows[0];

    if (user.reset_code !== code) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (
      !user.reset_code_expires_at ||
      new Date(user.reset_code_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Verification successful",
    });
  } catch (error) {
    console.error("Verify code error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}