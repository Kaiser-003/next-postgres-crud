import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// GET - Fetch all blogs
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        b.id,
        b.title,
        b.intro,
        b.content,
        b.image,
        b.category_id,
        c.name AS category_name,
        b.status,
        b.created_at,
        b.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sc.id,
              'name', sc.name
            )
          ) FILTER (WHERE sc.id IS NOT NULL),
          '[]'
        ) AS sub_categories
      FROM blogs b
      JOIN categories c
        ON b.category_id = c.id
      LEFT JOIN blog_sub_categories bsc
        ON b.id = bsc.blog_id
      LEFT JOIN sub_categories sc
        ON bsc.sub_category_id = sc.id
      GROUP BY b.id, c.name
      ORDER BY b.created_at DESC
    `);

    return NextResponse.json({
      blogs: result.rows,
    });
  } catch (error) {
    console.error("Get blogs error:", error);

    return NextResponse.json(
      { message: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}


// POST - Create a blog
export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const formData = await request.formData();

    const title = formData.get("title")?.toString().trim();
    const intro = formData.get("intro")?.toString() || "";
    const content = formData.get("content")?.toString() || "";
    const categoryId = Number(
      formData.get("categoryId")
    );

    const status =
      formData.get("status")?.toString() || "draft";

    const subCategoryIdsRaw =
      formData.get("subCategoryIds")?.toString() || "[]";

    const image = formData.get("image");

    let subCategoryIds: number[] = [];

    try {
      subCategoryIds = JSON.parse(subCategoryIdsRaw);
    } catch {
      subCategoryIds = [];
    }

    if (!title) {
      return NextResponse.json(
        { message: "Blog title is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "Category is required" },
        { status: 400 }
      );
    }

    if (!["draft", "published"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid blog status" },
        { status: 400 }
      );
    }

    // Check category
    const category = await client.query(
      `SELECT id FROM categories WHERE id = $1`,
      [categoryId]
    );

    if (category.rows.length === 0) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Save image
    let imagePath: string | null = null;

    if (image instanceof File) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Blog image must be an image" },
          { status: 400 }
        );
      }

      const imageBuffer = Buffer.from(
        await image.arrayBuffer()
      );

      const uploadDirectory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "blog-images"
      );

      await fs.mkdir(uploadDirectory, {
        recursive: true,
      });

      const fileName = `${uuidv4()}.jpg`;

      const filePath = path.join(
        uploadDirectory,
        fileName
      );

      await fs.writeFile(
        filePath,
        imageBuffer
      );

      imagePath = `/uploads/blog-images/${fileName}`;
    }

    // Start transaction
    await client.query("BEGIN");

    // Create blog
    const blogResult = await client.query(
      `
      INSERT INTO blogs
        (
          title,
          intro,
          content,
          image,
          category_id,
          status
        )
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        title,
        intro,
        content,
        imagePath,
        categoryId,
        status,
      ]
    );

    const blog = blogResult.rows[0];

    // Add subcategories
    if (
      Array.isArray(subCategoryIds) &&
      subCategoryIds.length > 0
    ) {
      for (const subCategoryId of subCategoryIds) {
        await client.query(
          `
          INSERT INTO blog_sub_categories
            (blog_id, sub_category_id)
          VALUES
            ($1, $2)
          `,
          [blog.id, subCategoryId]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Blog created successfully",
        blog,
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Create blog error:",
      error
    );

    return NextResponse.json(
      { message: "Failed to create blog" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}


// PATCH - Update a blog
export async function PATCH(request: Request) {
  const client = await pool.connect();

  try {
    const {
      id,
      title,
      intro,
      content,
      categoryId,
      subCategoryIds = [],
      status,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Blog id is required" },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: "Blog title is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "Category is required" },
        { status: 400 }
      );
    }

    if (
      !["draft", "published"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Invalid blog status" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const blogResult = await client.query(
      `
      UPDATE blogs
      SET
        title = $1,
        intro = $2,
        content = $3,
        category_id = $4,
        status = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [
        title.trim(),
        intro || "",
        content || "",
        categoryId,
        status,
        id,
      ]
    );

    if (blogResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      );
    }

    await client.query(
      `
      DELETE FROM blog_sub_categories
      WHERE blog_id = $1
      `,
      [id]
    );

    if (
      Array.isArray(subCategoryIds) &&
      subCategoryIds.length > 0
    ) {
      for (const subCategoryId of subCategoryIds) {
        await client.query(
          `
          INSERT INTO blog_sub_categories
            (blog_id, sub_category_id)
          VALUES
            ($1, $2)
          `,
          [id, subCategoryId]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Blog updated successfully",
      blog: blogResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Update blog error:",
      error
    );

    return NextResponse.json(
      { message: "Failed to update blog" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}


// DELETE - Delete a blog
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Blog id is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      DELETE FROM blogs
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete blog error:",
      error
    );

    return NextResponse.json(
      { message: "Failed to delete blog" },
      { status: 500 }
    );
  }
}