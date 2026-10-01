import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { pool } from "@/app/lib/db";
import { sendResetCode } from "@/app/lib/mailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if the user exists
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    // Don't reveal whether an email exists in the database
    if (result.rows.length === 0) {
      return NextResponse.json({
        message: "If an account exists, a reset code has been sent.",
      });
    }

    // Generate a 4-digit code
    const code = randomInt(1000, 10000).toString();

    // Code expires after 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save code in database
    await pool.query(
      `UPDATE users
       SET reset_code = $1,
           reset_code_expires_at = $2
       WHERE email = $3`,
      [code, expiresAt, email]
    );

    // Send code through Gmail
    await sendResetCode(email, code);

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}