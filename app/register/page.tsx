"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import getCroppedImg from "@/app/lib/cropImage";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");
  const [isLoading, setIsLoading] = useState(false);

  // Select image
  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file");
      setMessageType("error");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };

    reader.readAsDataURL(file);
  };

  // Crop area completed
  const handleCropComplete = (
    _croppedArea: Area,
    croppedAreaPixels: Area
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Confirm crop
  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const blob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );

      setCroppedImage(blob);
      setImageSrc(null);
    } catch (error) {
      console.error("Crop error:", error);

      setMessage("Failed to crop image");
      setMessageType("error");
    }
  };

  // Register
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      if (croppedImage) {
        formData.append(
          "profileImage",
          croppedImage,
          "profile-image.jpg"
        );
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        setMessageType("error");
        return;
      }

      setMessage("Registration successful");
      setMessageType("success");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCroppedImage(null);
    } catch (error) {
      console.error(
        "Registration request failed:",
        error
      );

      setMessage("Unable to connect to the server");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Register to get started
          </p>
        </div>

        {message && (
          <div
            role="status"
            className={`mb-5 rounded-lg px-4 py-3 text-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Profile Image */}
          <div>
            <label
              htmlFor="profileImage"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Profile Image
            </label>

            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            />

            {croppedImage && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Image cropped to 400 × 400
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-black text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-black text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Create a password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-black text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm your password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-black text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Register */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Registering..."
              : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>
        </p>
      </div>

      {/* Crop Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Crop Profile Image
            </h2>

            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Zoom
              </label>

              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) =>
                  setZoom(Number(event.target.value))
                }
                className="w-full"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
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