"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { X, User, Stethoscope } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  const handleSignIn = async () => {
    if (role === "doctor") {
      // Use default /api/auth
      signIn("google", { callbackUrl: "/doctor/dashboard" });
    } else {
      // Use /api/patient/auth
      // We need to perform a POST with CSRF token to isolate correctly
      try {
        const res = await fetch("/api/patient/auth/csrf");
        const { csrfToken } = await res.json();

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/patient/auth/signin/google";

        const csrfInput = document.createElement("input");
        csrfInput.type = "hidden";
        csrfInput.name = "csrfToken";
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        const callbackInput = document.createElement("input");
        callbackInput.type = "hidden";
        callbackInput.name = "callbackUrl";
        callbackInput.value = "/";
        form.appendChild(callbackInput);

        document.body.appendChild(form);
        form.submit();
      } catch (error) {
        console.error("Patient sign-in error:", error);
      }
    }
  };

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black/50 backdrop-blur-xl p-4">
      {/* Backdrop Blur Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-2xl" />

      {/* Popup Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Close Button - Top Right */}
        <Link href="/">
          <button className="absolute -top-3 -right-3 z-20 h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors shadow-lg">
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </Link>

        {/* Modal Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top Wave Background with Logo */}
          <div className="relative h-32 bg-gradient-to-br from-blue-100 via-blue-50 to-white overflow-hidden">
            {/* Wave SVG Background */}
            <svg
              className="absolute bottom-0 w-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
            >
              <path
                fill="#ffffff"
                fillOpacity="1"
                d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              ></path>
            </svg>

            {/* Logo Circle */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center">
                <div className="relative h-12 w-12">
                  <Image
                    src="/logo.png"
                    alt="CarePlus Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-4">
            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Sign In
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Select your role to continue
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
              <button
                onClick={() => setRole("patient")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === "patient"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <User className="h-4 w-4" />
                Patient
              </button>
              <button
                onClick={() => setRole("doctor")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === "doctor"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Stethoscope className="h-4 w-4" />
                Doctor
              </button>
            </div>

            {/* Google Sign In Button */}
            <motion.button
              onClick={handleSignIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full h-12 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-5 w-5"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.7 1.23 9.2 3.26l6.9-6.9C35.7 1.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l8.1 6.3C12.6 13 17.9 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.1 24.5c0-1.6-.14-2.8-.44-4.1H24v7.8h12.7c-.5 3-2.1 5.5-4.6 7.3l7.1 5.5c4.1-3.8 6.9-9.4 6.9-16.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.7 28.6c-1-3-1-6.2 0-9.2l-8.1-6.3C-.4 17.1-.4 30.9 2.6 34.9l8.1-6.3z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.1-5.5c-2 1.4-4.5 2.2-8.1 2.2-6.1 0-11.4-3.9-13.3-9.4l-8.1 6.3C6.5 42.6 14.6 48 24 48z"
                />
              </svg>
              Sign in as {role === "patient" ? "Patient" : "Doctor"}
            </motion.button>

            <p className="text-center text-xs text-gray-400 mt-4">
              We will sign you up if you&apos;re new.
            </p>

            {/* Terms and Privacy */}
            <div className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-400 mt-4">
              One-click login with <span className="font-semibold">Google</span> – Fast, secure & hassle-free!
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
