"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

type Comment = {
  id: number;
  comment: string;
  created_at: string;
  user_id: number;
  user_name: string;
  profile_image: string | null;
};

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const blogResponse = await fetch("/api/blogs", {
          cache: "no-store",
        });

        const blogData = await blogResponse.json();

        if (!blogResponse.ok) {
          setMessage(blogData.message || "Failed to fetch blog");
          return;
        }

        const foundBlog = blogData.blogs.find(
          (item: Blog) => item.id === Number(id)
        );

        if (!foundBlog) {
          setMessage("Blog not found");
          return;
        }

        setBlog(foundBlog);

        const likeResponse = await fetch(`/api/blogs/${id}/like`);
        const likeData = await likeResponse.json();

        if (likeResponse.ok) {
          setLikes(likeData.likes);
          setLiked(likeData.liked);
        }

        const commentResponse = await fetch(
          `/api/blogs/${id}/comments`
        );

        const commentData = await commentResponse.json();

        if (commentResponse.ok) {
          setComments(commentData.comments);
        }
      } catch (error) {
        console.error("Fetch data error:", error);
        setMessage("Something went wrong");
      } finally {
        setLoading(false);
        setCommentsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleLike = async () => {
    if (likeLoading) return;

    try {
      setLikeLoading(true);

      const response = await fetch(`/api/blogs/${id}/like`, {
        method: liked ? "DELETE" : "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Please login to like this blog");
        return;
      }

      setLikes(data.likes);
      setLiked(data.liked);
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    const comment = commentText.trim();

    if (!comment) {
      alert("Please write a comment");
      return;
    }

    if (commentLoading) return;

    try {
      setCommentLoading(true);

      const response = await fetch(`/api/blogs/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add comment");
        return;
      }

      setCommentText("");

      const commentsResponse = await fetch(
        `/api/blogs/${id}/comments`
      );

      const commentsData = await commentsResponse.json();

      if (commentsResponse.ok) {
        setComments(commentsData.comments);
      }
    } catch (error) {
      console.error("Add comment error:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading blog...
          </p>
        </div>
      </main>
    );
  }

  if (message || !blog) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            {message || "Blog not found"}
          </h1>

          <Link
            href="/blogs"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            ← Back to Blogs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <Link
          href="/blogs"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600 sm:mb-7"
        >
          ← Back to Blogs
        </Link>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">

          {/* Hero Image */}
          <div className="aspect-[16/9] w-full bg-slate-100 sm:aspect-[16/8]">
            {blog.image ? (
              <img
                src={blog.image}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No Image
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="p-5 sm:p-8 lg:p-12">

            {/* Categories */}
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
                {blog.category_name}
              </span>

              {blog.sub_categories?.map((subCategory) => (
                <span
                  key={subCategory.id}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:text-sm"
                >
                  {subCategory.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {blog.title}
            </h1>

            {/* Date */}
            <p className="mt-4 text-xs text-slate-400 sm:text-sm">
              Published on{" "}
              {new Date(blog.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            {/* Intro */}
            {blog.intro && (
              <p className="mt-7 border-l-4 border-blue-500 pl-4 text-base font-medium leading-7 text-slate-600 sm:mt-8 sm:text-lg sm:leading-8">
                {blog.intro}
              </p>
            )}

            {/* Blog Content */}
            <div
              className="prose prose-slate mt-8 max-w-none overflow-hidden text-sm sm:mt-10 sm:text-base"
              dangerouslySetInnerHTML={{
                __html: blog.content,
              }}
            />

            {/* Actions */}
            <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6 sm:mt-12 sm:pt-7">

              {/* Like */}
              <button
                type="button"
                onClick={handleLike}
                disabled={likeLoading}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95 sm:px-5 sm:py-3 ${
                  liked
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                {liked ? "❤️ Liked" : "🤍 Like"} {likes}
              </button>

              {/* Comments */}
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("comments")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 sm:px-5 sm:py-3"
              >
                💬 Comments {comments.length}
              </button>
            </div>

            {/* Comments Section */}
            <section
              id="comments"
              className="mt-10 border-t border-slate-200 pt-8 sm:mt-12 sm:pt-10"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Comments
                </h2>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {comments.length}
                </span>
              </div>

              {/* Add Comment */}
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-5">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleComment}
                    disabled={commentLoading}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {commentLoading ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>

              {/* Comment List */}
              <div className="mt-7 space-y-4">
                {commentsLoading ? (
                  <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No comments yet.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Be the first to share your thoughts.
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm sm:p-5"
                    >
                      <div className="flex gap-3 sm:gap-4">

                        {/* Profile Image */}
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:h-11 sm:w-11">
                          {comment.profile_image ? (
                            <img
                              src={comment.profile_image}
                              alt={comment.user_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-500">
                              {comment.user_name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="truncate font-semibold text-slate-900">
                              {comment.user_name}
                            </h3>

                            <span className="text-xs text-slate-400">
                              {new Date(
                                comment.created_at
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Bottom Back Link */}
            <div className="mt-10 border-t border-slate-200 pt-6">
              <Link
                href="/blogs"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                ← Back to all blogs
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}