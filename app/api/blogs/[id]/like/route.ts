import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "@/app/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// Get logged-in user
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const decoded = jwt.verify(token, jwtSecret) as {
    userId: number;
  };

  return decoded.userId;
}

// GET - Get like count and user's like status
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const blogId = Number(id);

    if (!blogId) {
      return NextResponse.json(
        { message: "Invalid blog id" },
        { status: 400 }
      );
    }

    const userId = await getUserId();

    const countResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM blog_likes
      WHERE blog_id = $1
      `,
      [blogId]
    );

    let liked = false;

    if (userId) {
      const likeResult = await pool.query(
        `
        SELECT id
        FROM blog_likes
        WHERE blog_id = $1
        AND user_id = $2
        `,
        [blogId, userId]
      );

      liked = likeResult.rows.length > 0;
    }

    return NextResponse.json({
      likes: countResult.rows[0].count,
      liked,
    });
  } catch (error) {
    console.error("Get likes error:", error);

    return NextResponse.json(
      { message: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

// POST - Like blog
export async function POST(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const blogId = Number(id);

    if (!blogId) {
      return NextResponse.json(
        { message: "Invalid blog id" },
        { status: 400 }
      );
    }

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Please login to like this blog" },
        { status: 401 }
      );
    }

    await pool.query(
      `
      INSERT INTO blog_likes (blog_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (blog_id, user_id)
      DO NOTHING
      `,
      [blogId, userId]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM blog_likes
      WHERE blog_id = $1
      `,
      [blogId]
    );

    return NextResponse.json({
      message: "Blog liked",
      likes: countResult.rows[0].count,
      liked: true,
    });
  } catch (error) {
    console.error("Like blog error:", error);

    return NextResponse.json(
      { message: "Failed to like blog" },
      { status: 500 }
    );
  }
}

// DELETE - Unlike blog
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const blogId = Number(id);

    if (!blogId) {
      return NextResponse.json(
        { message: "Invalid blog id" },
        { status: 400 }
      );
    }

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Please login to unlike this blog" },
        { status: 401 }
      );
    }

    await pool.query(
      `
      DELETE FROM blog_likes
      WHERE blog_id = $1
      AND user_id = $2
      `,
      [blogId, userId]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM blog_likes
      WHERE blog_id = $1
      `,
      [blogId]
    );

    return NextResponse.json({
      message: "Blog unliked",
      likes: countResult.rows[0].count,
      liked: false,
    });
  } catch (error) {
    console.error("Unlike blog error:", error);

    return NextResponse.json(
      { message: "Failed to unlike blog" },
      { status: 500 }
    );
  }
}