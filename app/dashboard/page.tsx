"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  userId?: number;
  id?: number;
  name?: string;
  email?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch("/api/me");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "You are not authenticated");
          return;
        }

        setUser(data.user || data);
      } catch (error) {
        console.error("Get user error:", error);
        setMessage("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Logout failed");
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Something went wrong during logout");
    } finally {
      setLogoutLoading(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // Access denied
  if (message && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Access Denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {message}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome, {user?.name || "User"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account and access your dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-red-300 sm:w-auto"
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </button>
        </div>

        {/* Dashboard Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Card Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                  {user?.name || "User"}
                </h2>

                <p className="truncate text-sm text-slate-500">
                  {user?.email || "Email not available"}
                </p>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="p-5 sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">
              Account Details
            </h2>

            <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {/* User ID */}
              <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-sm font-medium text-slate-500">
                  User ID
                </span>

                <span className="break-all text-sm font-semibold text-slate-800">
                  {user?.userId || user?.id || "Not available"}
                </span>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-sm font-medium text-slate-500">
                  Name
                </span>

                <span className="break-words text-sm font-semibold text-slate-800 sm:text-right">
                  {user?.name || "Not available"}
                </span>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-sm font-medium text-slate-500">
                  Email
                </span>

                <span className="break-all text-sm font-semibold text-slate-800 sm:text-right">
                  {user?.email || "Not available"}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="mt-5 rounded-xl bg-green-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                <span className="text-sm font-semibold text-green-700">
                  Authentication active
                </span>
              </div>

              <p className="mt-1 pl-[18px] text-xs text-green-600">
                Your session is authenticated using JWT.
              </p>
            </div>

            {/* Error Message */}
            {message && (
              <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}