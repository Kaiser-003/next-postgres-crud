"use client";

import { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Cropper, { Area } from "react-easy-crop";
import getCroppedImg from "@/app/lib/cropImage";

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
  const [selectedSubCategories, setSelectedSubCategories] =
    useState<number[]>([]);

  const [message, setMessage] = useState("");

  const [blogId, setBlogId] = useState<number | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  // Fetch categories
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

  // Fetch subcategories
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
        console.error("Failed to fetch subcategories:", error);
      }
    };

    fetchSubCategories();
  }, [categoryId]);

  const toggleSubCategory = (id: number) => {
    setSelectedSubCategories((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  // Select image
  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setMessage("");
    };

    reader.readAsDataURL(file);
  };

  const handleCropComplete = (
    _croppedArea: Area,
    croppedAreaPixels: Area
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const blob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );

      setCroppedImage(blob);
      setImageSrc(null);
      setMessage("Blog image cropped to 400 × 400");
    } catch (error) {
      console.error("Image crop error:", error);
      setMessage("Failed to crop image");
    }
  };

  // Save blog
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
      if (!blogId) {
        const formData = new FormData();

        formData.append("title", title);
        formData.append("intro", intro);
        formData.append("content", content);
        formData.append("categoryId", categoryId);

        formData.append(
          "subCategoryIds",
          JSON.stringify(selectedSubCategories)
        );

        formData.append("status", "draft");

        if (croppedImage) {
          formData.append(
            "image",
            croppedImage,
            "blog-image.jpg"
          );
        }

        const response = await fetch("/api/blogs", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to save blog");
          return;
        }

        setBlogId(data.blog.id);
        setMessage("Blog saved successfully");
        return;
      }

      const response = await fetch("/api/blogs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: blogId,
          title,
          intro,
          content,
          categoryId,
          subCategoryIds: selectedSubCategories,
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update blog");
        return;
      }

      setMessage("Blog updated successfully");
    } catch (error) {
      console.error("Save blog error:", error);
      setMessage("Something went wrong");
    }
  };

  // Publish blog
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
      let currentBlogId = blogId;

      if (!currentBlogId) {
        const formData = new FormData();

        formData.append("title", title);
        formData.append("intro", intro);
        formData.append("content", content);
        formData.append("categoryId", categoryId);

        formData.append(
          "subCategoryIds",
          JSON.stringify(selectedSubCategories)
        );

        formData.append("status", "draft");

        if (croppedImage) {
          formData.append(
            "image",
            croppedImage,
            "blog-image.jpg"
          );
        }

        const createResponse = await fetch("/api/blogs", {
          method: "POST",
          body: formData,
        });

        const createData = await createResponse.json();

        if (!createResponse.ok) {
          setMessage(
            createData.message || "Failed to save blog"
          );
          return;
        }

        currentBlogId = createData.blog.id;
        setBlogId(currentBlogId);
      }

      const publishResponse = await fetch("/api/blogs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentBlogId,
          title,
          intro,
          content,
          categoryId,
          subCategoryIds: selectedSubCategories,
          status: "published",
        }),
      });

      const publishData = await publishResponse.json();

      if (!publishResponse.ok) {
        setMessage(
          publishData.message || "Failed to publish blog"
        );
        return;
      }

      setMessage("Blog published successfully");
    } catch (error) {
      console.error("Publish blog error:", error);
      setMessage("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Content Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create Blog
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Create, save and publish your blog article.
          </p>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="p-5 sm:p-7 lg:p-9">

            {/* Title */}
            <div className="mb-7">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Blog Title
              </label>

              <input
                type="text"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-base"
              />
            </div>

            {/* Intro */}
            <div className="mb-7">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Introduction
              </label>

              <textarea
                placeholder="Enter a short introduction for your blog..."
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-base"
              />
            </div>

            {/* Image */}
            <div className="mb-7">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Blog Image
              </label>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-5">

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Upload an image and crop it to 400 × 400.
                </p>

                {croppedImage && (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <img
                      src={URL.createObjectURL(croppedImage)}
                      alt="Blog preview"
                      className="h-32 w-32 rounded-xl border border-slate-200 object-cover shadow-sm sm:h-36 sm:w-36"
                    />

                    <div>
                      <p className="text-sm font-semibold text-green-600">
                        ✓ Image ready
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Cropped to 400 × 400 pixels.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mb-7">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Blog Content
              </label>

              <div className="overflow-hidden rounded-xl border border-slate-300">
                <Editor
  tinymceScriptSrc="/tinymce/tinymce.min.js"
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
                      "undo redo | blocks | bold italic underline | " +
                      "alignleft aligncenter alignright | " +
                      "bullist numlist | link | code | fullscreen",
                  }}
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-7">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Category
              </label>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-base"
              >
                <option value="">Select category</option>

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

            {/* Subcategories */}
            {categoryId && (
              <div className="mb-7">
                <label className="mb-3 block text-sm font-semibold text-slate-800">
                  Sub Categories
                </label>

                {subCategories.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No subcategories available for this category.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {subCategories.map((subCategory) => (
                      <label
                        key={subCategory.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                          selectedSubCategories.includes(
                            subCategory.id
                          )
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubCategories.includes(
                            subCategory.id
                          )}
                          onChange={() =>
                            toggleSubCategory(subCategory.id)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {subCategory.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
                  message.toLowerCase().includes("success")
                    ? "bg-green-50 text-green-700"
                    : message.toLowerCase().includes("cropped")
                    ? "bg-blue-50 text-blue-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99] sm:w-auto"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] sm:w-auto"
              >
                Publish Blog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6">

            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Crop Blog Image
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Adjust the image and create a 400 × 400 crop.
              </p>
            </div>

            {/* Crop Area */}
            <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black sm:h-80">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            {/* Zoom */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Zoom
                </label>

                <span className="text-xs text-slate-400">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) =>
                  setZoom(Number(e.target.value))
                }
                className="w-full accent-blue-600"
              />
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Crop Image
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}