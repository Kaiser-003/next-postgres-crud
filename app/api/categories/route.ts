import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

// GET - Fetch all categories
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, created_at
       FROM categories
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      categories: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Create a category
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO categories (name)
       VALUES ($1)
       RETURNING id, name, created_at`,
      [name.trim()]
    );

    return NextResponse.json(
      {
        message: "Category created successfully",
        category: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Duplicate category
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    console.error("Create category error:", error);

    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PATCH - Update a category
export async function PATCH(request: Request) {
  try {
    const { id, name } = await request.json();

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { message: "Category id and name are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE categories
       SET name = $1
       WHERE id = $2
       RETURNING id, name, created_at`,
      [name.trim(), id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    console.error("Update category error:", error);

    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Category id is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM categories
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}