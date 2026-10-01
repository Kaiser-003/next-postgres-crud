"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () =>
    import("@tinymce/tinymce-react").then(
      (module) => module.Editor
    ),
  {
    ssr: false,
  }
);

type Category = {
  id: number;
  name: string;
};

type SubCategory = {
  id: number;
  name: string;
  category_id: number;
};

export default function BlogPage() {
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [selectedSubCategories, setSelectedSubCategories] = useState<
    number[]
  >([]);

  const [message, setMessage] = useState("");

  // -----------------------------
  // Fetch Categories
  // -----------------------------
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // -----------------------------
  // Fetch Sub Categories
  // -----------------------------
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!categoryId) {
        setSubCategories([]);
        setSelectedSubCategories([]);
        return;
      }

      try {
        const response = await fetch("/api/sub-categories");
        const data = await response.json();

        if (response.ok) {
          const filtered = data.subCategories.filter(
            (subCategory: SubCategory) =>
              subCategory.category_id === Number(categoryId)
          );

          setSubCategories(filtered);
          setSelectedSubCategories([]);
        }
      } catch (error) {
        console.error(
          "Failed to fetch subcategories:",
          error
        );
      }
    };

    fetchSubCategories();
  }, [categoryId]);

  // -----------------------------
  // Select / Unselect Subcategory
  // -----------------------------
  const toggleSubCategory = (id: number) => {
    setSelectedSubCategories((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  // -----------------------------
  // Save Blog
  // -----------------------------
  const handleSave = async () => {
    setMessage("");

    if (!title.trim()) {
      setMessage("Blog title is required");
      return;
    }

    if (!categoryId) {
      setMessage("Please select a category");
      return;
    }

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          intro,
          content,
          categoryId: Number(categoryId),
          subCategoryIds: selectedSubCategories,
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Blog saved successfully");
    } catch (error) {
      console.error("Save blog error:", error);
      setMessage("Something went wrong");
    }
  };

  // -----------------------------
  // Publish Blog
  // -----------------------------
  const handlePublish = async () => {
    setMessage("");

    if (!title.trim()) {
      setMessage("Blog title is required");
      return;
    }

    if (!categoryId) {
      setMessage("Please select a category");
      return;
    }

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          intro,
          content,
          categoryId: Number(categoryId),
          subCategoryIds: selectedSubCategories,
          status: "published",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Blog published successfully");
    } catch (error) {
      console.error("Publish blog error:", error);
      setMessage("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* Heading */}
        <h1 className="text-3xl text-black font-bold mb-2">
          Create Blog
        </h1>

        <p className="text-gray-600 mb-8">
          Create and publish your blog
        </p>

        {/* ================= TITLE ================= */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            Title
          </label>

          <input
            type="text"
            placeholder="Enter blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border text-slate-700 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ================= INTRO ================= */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            Intro
          </label>

          <textarea
            placeholder="Enter blog introduction"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={4}
            className="w-full border text-slate-700 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            Content
          </label>

          <Editor
            tinymceScriptSrc={[
              "/tinymce/tinymce.min.js",
            ]}
            licenseKey="gpl"
            value={content}
            onEditorChange={(newContent) =>
              setContent(newContent)
            }
            init={{
              height: 400,
              menubar: true,

              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "charmap",
                "preview",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "table",
                "help",
                "wordcount",
              ],

              toolbar:
                "undo redo | blocks | " +
                "bold italic underline | " +
                "alignleft aligncenter alignright | " +
                "bullist numlist | link | " +
                "code | fullscreen",
            }}
          />
        </div>

        {/* ================= CATEGORY ================= */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            Category
          </label>

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
            className="w-full border text-slate-700 border-gray-300 rounded-lg px-4 py-3"
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* ================= SUB CATEGORIES ================= */}
        {categoryId && (
          <div className="mb-6">
            <label className="block text-black font-medium mb-3">
              Sub Categories
            </label>

            {subCategories.length === 0 ? (
              <p className="text-slate-800">
                No subcategories available.
              </p>
            ) : (
              <div className="space-y-2">
                {subCategories.map(
                  (subCategory) => (
                    <label
                      key={subCategory.id}
                      className="flex text-black items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubCategories.includes(
                          subCategory.id
                        )}
                        onChange={() =>
                          toggleSubCategory(
                            subCategory.id
                          )
                        }
                        className="w-4 h-4"
                      />

                      <span>
                        {subCategory.name}
                      </span>
                    </label>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= BUTTONS ================= */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Save
          </button>

          <button
            onClick={handlePublish}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Publish
          </button>
        </div>

        {/* ================= MESSAGE ================= */}
        {message && (
          <p className="mt-6 text-center font-medium text-red-600">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}