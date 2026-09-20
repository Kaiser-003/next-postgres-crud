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
        setMessage("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);

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
      setMessage("Something went wrong during logout");
    } finally {
      setLogoutLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-medium text-slate-700">
          Loading dashboard...
        </p>
      </main>
    );
  }

  if (message && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="mb-3 text-2xl font-bold text-red-600">
            Access Denied
          </h1>

          <p className="mb-5 text-slate-600">{message}</p>

          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome to Dashboard
              </h1>

              <p className="mt-2 text-slate-500">
                You are successfully authenticated using JWT.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>

          <div className="rounded-xl bg-slate-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              User Details
            </h2>

            <div className="space-y-3 text-slate-700">
              <p>
                <span className="font-semibold">User ID:</span>{" "}
                {user?.userId || user?.id || "Not available"}
              </p>

              <p>
                <span className="font-semibold">Name:</span>{" "}
                {user?.name || "Not available"}
              </p>

              <p>
                <span className="font-semibold">Email:</span>{" "}
                {user?.email || "Not available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}