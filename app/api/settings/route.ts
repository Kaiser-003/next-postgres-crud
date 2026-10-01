import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "@/app/lib/db";

export async function PATCH(request: Request) {
  try {
    // Get JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
    };

    const userId = decoded.userId;

    // Get updated data
    const { name, email, password } = await request.json();

    if (!name && !email && !password) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 }
      );
    }

    // Check if email is already used by another user
    if (email) {
      const existingUser = await pool.query(
        `SELECT id FROM users
         WHERE email = $1 AND id != $2`,
        [email, userId]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { message: "Email is already in use" },
          { status: 400 }
        );
      }
    }

    // Build update fields
    const updates: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    if (name) {
      updates.push(`name = $${valueIndex}`);
      values.push(name);
      valueIndex++;
    }

    if (email) {
      updates.push(`email = $${valueIndex}`);
      values.push(email);
      valueIndex++;
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);

      updates.push(`password_hash = $${valueIndex}`);
      values.push(passwordHash);
      valueIndex++;
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE users
       SET ${updates.join(", ")}
       WHERE id = $${valueIndex}
       RETURNING id, name, email`,
      values
    );

    return NextResponse.json({
      message: "Account updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Settings update error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}