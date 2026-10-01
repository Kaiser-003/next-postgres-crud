"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
};

type SubCategory = {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  created_at: string;
};

export default function SubCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch subcategories
  const fetchSubCategories = async () => {
    try {
      const response = await fetch("/api/sub-categories");
      const data = await response.json();

      if (response.ok) {
        setSubCategories(data.subCategories);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  // Add subcategory
  const handleAdd = async () => {
    if (!name.trim()) {
      setMessage("Subcategory name is required");
      return;
    }

    if (!categoryId) {
      setMessage("Please select a parent category");
      return;
    }

    try {
      const response = await fetch("/api/sub-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          categoryId: Number(categoryId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setName("");
      setCategoryId("");
      setMessage("Subcategory added successfully");

      fetchSubCategories();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  // Start editing
  const startEdit = (subCategory: SubCategory) => {
    setEditingId(subCategory.id);
    setEditingName(subCategory.name);
    setEditingCategoryId(String(subCategory.category_id));
    setMessage("");
  };

  // Update subcategory
  const handleUpdate = async () => {
    if (!editingId || !editingName.trim() || !editingCategoryId) {
      return;
    }

    try {
      const response = await fetch("/api/sub-categories", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          name: editingName,
          categoryId: Number(editingCategoryId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setEditingId(null);
      setEditingName("");
      setEditingCategoryId("");
      setMessage("Subcategory updated successfully");

      fetchSubCategories();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  // Delete subcategory
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/sub-categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Subcategory deleted successfully");

      fetchSubCategories();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl text-black font-bold mb-2">
          Sub Categories
        </h1>

        <p className="text-gray-600 mb-8">
          Manage your blog subcategories
        </p>

        {/* Add Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <input
            type="text"
            placeholder="Enter subcategory name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border text-slate-700 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border text-slate-700 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Select parent category
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add Subcategory
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="mb-6 text-red-700 text-center font-medium">
            {message}
          </p>
        )}

        {/* Subcategories */}
        {loading ? (
          <p>Loading subcategories...</p>
        ) : subCategories.length === 0 ? (
          <p className="text-gray-500">
            No subcategories found.
          </p>
        ) : (
          <div className="space-y-3">
            {subCategories.map((subCategory) => (
              <div
                key={subCategory.id}
                className="flex text-black items-center gap-3 border border-gray-200 rounded-lg p-4"
              >
                {editingId === subCategory.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) =>
                        setEditingName(e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    />

                    <select
                      value={editingCategoryId}
                      onChange={(e) =>
                        setEditingCategoryId(e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                        setEditingCategoryId("");
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium">
                      {subCategory.name}
                    </span>

                    <span className="text-sm text-gray-500">
                      Parent: {subCategory.category_name}
                    </span>

                    <button
                      onClick={() => startEdit(subCategory)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(subCategory.id)
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}