"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Blog = {
  id: number;
  title: string;
  intro: string;
  content: string;
  image: string | null;
  category_id: number;
  category_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  sub_categories: {
    id: number;
    name: string;
  }[];
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to fetch blogs");
          return;
        }

        const publishedBlogs: Blog[] = data.blogs.filter(
          (blog: Blog) => blog.status === "published"
        );

        setBlogs(publishedBlogs);
      } catch (error) {
        console.error("Fetch blogs error:", error);
        setMessage("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Our Blog
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Latest Blogs
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Explore our latest articles, insights and stories.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading blogs...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && message && (
          <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
            {message}
          </div>
        )}

        {/* Empty */}
        {!loading && !message && blogs.length === 0 && (
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              📝
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-800">
              No blogs available
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Check back later for new articles.
            </p>
          </div>
        )}

        {/* Blog Grid */}
        {!loading && blogs.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <Link
                  href={`/blogs/${blog.id}`}
                  className="block overflow-hidden"
                >
                  <div className="aspect-[16/10] w-full bg-slate-100">
                    {blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">

                  {/* Category */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {blog.category_name}
                    </span>

                    {blog.sub_categories
                      ?.slice(0, 2)
                      .map((subCategory) => (
                        <span
                          key={subCategory.id}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {subCategory.name}
                        </span>
                      ))}
                  </div>

                  {/* Title */}
                  <Link href={`/blogs/${blog.id}`}>
                    <h2 className="line-clamp-2 text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
                      {blog.title}
                    </h2>
                  </Link>

                  {/* Intro */}
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {blog.intro}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                    <span className="text-xs text-slate-400">
                      {new Date(blog.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>

                    <Link
                      href={`/blogs/${blog.id}`}
                      className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}