import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/app/lib/db";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const profileImage = formData.get("profileImage");

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    let profileImagePath: string | null = null;

    // Handle profile image
    if (profileImage instanceof File) {
      if (!profileImage.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Profile image must be an image" },
          { status: 400 }
        );
      }

      const imageBuffer = Buffer.from(
        await profileImage.arrayBuffer()
      );

      const uploadDirectory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "profile-images"
      );

      await fs.mkdir(uploadDirectory, {
        recursive: true,
      });

      const fileName = `${uuidv4()}.jpg`;

      const filePath = path.join(
        uploadDirectory,
        fileName
      );

      await fs.writeFile(filePath, imageBuffer);

      profileImagePath = `/uploads/profile-images/${fileName}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users
        (name, email, password_hash, profile_image)
      VALUES
        ($1, $2, $3, $4)
      `,
      [
        name,
        email,
        passwordHash,
        profileImagePath,
      ]
    );

    return NextResponse.json(
      {
        message: "Registration successful",
        profileImage: profileImagePath,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}