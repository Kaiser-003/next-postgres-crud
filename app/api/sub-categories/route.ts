import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

// GET - Fetch all subcategories
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        sc.id,
        sc.name,
        sc.category_id,
        sc.created_at,
        c.name AS category_name
       FROM sub_categories sc
       JOIN categories c
         ON sc.category_id = c.id
       ORDER BY sc.created_at DESC`
    );

    return NextResponse.json({
      subCategories: result.rows,
    });
  } catch (error) {
    console.error("Get subcategories error:", error);

    return NextResponse.json(
      { message: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

// POST - Create a subcategory
export async function POST(request: Request) {
  try {
    const { name, categoryId } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Subcategory name is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "Parent category is required" },
        { status: 400 }
      );
    }

    // Check parent category exists
    const category = await pool.query(
      `SELECT id FROM categories WHERE id = $1`,
      [categoryId]
    );

    if (category.rows.length === 0) {
      return NextResponse.json(
        { message: "Parent category not found" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO sub_categories (name, category_id)
       VALUES ($1, $2)
       RETURNING id, name, category_id, created_at`,
      [name.trim(), categoryId]
    );

    return NextResponse.json(
      {
        message: "Subcategory created successfully",
        subCategory: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          message:
            "This subcategory already exists under this category",
        },
        { status: 409 }
      );
    }

    console.error("Create subcategory error:", error);

    return NextResponse.json(
      { message: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}

// PATCH - Update a subcategory
export async function PATCH(request: Request) {
  try {
    const { id, name, categoryId } = await request.json();

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { message: "Subcategory id and name are required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "Parent category is required" },
        { status: 400 }
      );
    }

    // Check parent category exists
    const category = await pool.query(
      `SELECT id FROM categories WHERE id = $1`,
      [categoryId]
    );

    if (category.rows.length === 0) {
      return NextResponse.json(
        { message: "Parent category not found" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `UPDATE sub_categories
       SET name = $1,
           category_id = $2
       WHERE id = $3
       RETURNING id, name, category_id, created_at`,
      [name.trim(), categoryId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Subcategory updated successfully",
      subCategory: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          message:
            "This subcategory already exists under this category",
        },
        { status: 409 }
      );
    }

    console.error("Update subcategory error:", error);

    return NextResponse.json(
      { message: "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subcategory
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Subcategory id is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM sub_categories
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Delete subcategory error:", error);

    return NextResponse.json(
      { message: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}