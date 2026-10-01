"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  created_at: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category
  const handleAdd = async () => {
    if (!name.trim()) {
      setMessage("Category name is required");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setName("");
      setMessage("Category added successfully");

      fetchCategories();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  // Start editing
  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setMessage("");
  };

  // Update category
  const handleUpdate = async () => {
    if (!editingName.trim() || editingId === null) {
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          name: editingName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setEditingId(null);
      setEditingName("");
      setMessage("Category updated successfully");

      fetchCategories();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  // Delete category
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/categories", {
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

      setMessage("Category deleted successfully");

      fetchCategories();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl text-black font-bold mb-2">
          Categories
        </h1>

        <p className="text-gray-600 mb-8">
          Manage your blog categories
        </p>

        {/* Add Category */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border text-black border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="mb-6 text-red-700 text-center font-medium">
            {message}
          </p>
        )}

        {/* Categories */}
        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">
            No categories found.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 border border-gray-200 rounded-lg p-4"
              >
                {editingId === category.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) =>
                        setEditingName(e.target.value)
                      }
                      className="flex-1 border text-black border-gray-300 rounded-lg px-3 py-2"
                    />

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
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-black font-medium">
                      {category.name}
                    </span>

                    <button
                      onClick={() => startEdit(category)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(category.id)}
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