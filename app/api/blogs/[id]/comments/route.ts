import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "@/app/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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

// GET - Fetch comments
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

    const result = await pool.query(
      `
      SELECT
        bc.id,
        bc.comment,
        bc.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.profile_image
      FROM blog_comments bc
      JOIN users u
        ON bc.user_id = u.id
      WHERE bc.blog_id = $1
      ORDER BY bc.created_at DESC
      `,
      [blogId]
    );

    return NextResponse.json({
      comments: result.rows,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    return NextResponse.json(
      { message: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST - Add comment
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
        { message: "Please login to comment" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const comment = body.comment?.trim();

    if (!comment) {
      return NextResponse.json(
        { message: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const blog = await pool.query(
      `SELECT id FROM blogs WHERE id = $1`,
      [blogId]
    );

    if (blog.rows.length === 0) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO blog_comments
        (blog_id, user_id, comment)
      VALUES
        ($1, $2, $3)
      RETURNING id, comment, created_at
      `,
      [blogId, userId, comment]
    );

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add comment error:", error);

    return NextResponse.json(
      { message: "Failed to add comment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete own comment
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const blogId = Number(id);

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Please login" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const commentId = Number(body.commentId);

    if (!commentId) {
      return NextResponse.json(
        { message: "Comment id is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      DELETE FROM blog_comments
      WHERE id = $1
        AND blog_id = $2
        AND user_id = $3
      RETURNING id
      `,
      [commentId, blogId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return NextResponse.json(
      { message: "Failed to delete comment" },
      { status: 500 }
    );
  }
}