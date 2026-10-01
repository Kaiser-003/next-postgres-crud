"use client";

import { useEffect, useState } from "react";

type User = {
  userId: number;
  name: string;
  email: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/me");
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleUpdateAccount = async () => {
    setMessage("");

    if (!name.trim()) {
      setMessage("Name cannot be empty");
      return;
    }

    if (!email.trim()) {
      setMessage("Email cannot be empty");
      return;
    }

    if (password && password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setUser(data.user);

      setName(data.user.name);
      setEmail(data.user.email);

      setPassword("");
      setConfirmPassword("");

      setMessage("Account updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      setMessage("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Unable to load user information.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl text-black font-bold mb-2">
          Settings
        </h1>

        <p className="text-gray-600 mb-8">
          Manage your account information
        </p>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border text-slate-700 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border text-slate-700 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* New Password */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            New Password
          </label>

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border text-slate-700 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            Confirm New Password
          </label>

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border text-slate-700 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdateAccount}
          disabled={updating}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {updating ? "Updating..." : "Update Account"}
        </button>

        {/* Message */}
        {message && (
          <p className="text-center text-red-500 mt-4 font-medium">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}