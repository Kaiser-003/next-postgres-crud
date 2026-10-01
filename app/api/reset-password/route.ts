import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
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
        { message: "Unable to reset password" },
        { status: 400 }
      );
    }

    const user = result.rows[0];

    // Make sure the verification code was already verified
    if (!user.reset_code || !user.reset_code_expires_at) {
      return NextResponse.json(
        { message: "Please verify your code first" },
        { status: 400 }
      );
    }

    // Make sure the reset window has not expired
    if (new Date(user.reset_code_expires_at) < new Date()) {
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and clear reset code
    await pool.query(
      `UPDATE users
       SET password_hash = $1,
           reset_code = NULL,
           reset_code_expires_at = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}