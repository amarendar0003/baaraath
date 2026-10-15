"use client";

import Link from "next/link";
import { appPath } from "@/lib/app-path";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(appPath("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Login server returned ${response.status}.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Invalid email or password."
        );
      }

      const redirectTo =
        data.redirectTo ||
        (data.user?.role === "ADMIN"
          ? "/admin/dashboard"
          : data.user?.role === "PROVIDER"
            ? "/vendor/dashboard"
            : "/");

      window.location.replace(appPath(redirectTo));
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">

        {/* LEFT BRANDING PANEL */}
        <div className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-slate-950">
                B
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
                  Baaraath
                </p>

                <p className="text-sm font-semibold text-white">
                  Event Services Marketplace
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-300">
              Welcome back
            </p>

            <h1 className="mt-4 text-5xl font-bold leading-tight">
              Manage your Baaraath experience from one place.
            </h1>

            <p className="mt-6 text-base leading-7 text-slate-400">
              Customers, providers and administrators are
              automatically taken to their own dashboard after
              login.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">

              {/* CUSTOMER */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <UserRound className="h-5 w-5 text-indigo-300" />

                <p className="mt-3 text-sm font-semibold">
                  Customers
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Book and manage services
                </p>
              </div>

              {/* PROVIDER */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />

                <p className="mt-3 text-sm font-semibold">
                  Providers
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Manage services and bookings
                </p>
              </div>

              {/* ADMIN */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <LockKeyhole className="h-5 w-5 text-amber-300" />

                <p className="mt-3 text-sm font-semibold">
                  Admin
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Manage the platform
                </p>
              </div>

            </div>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Baaraath
          </p>
        </div>

        {/* RIGHT LOGIN PANEL */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* MOBILE BRANDING */}
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white">
                  B
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                    Baaraath
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    Event Services Marketplace
                  </p>
                </div>
              </div>
            </div>

            {/* LOGIN CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              {/* CARD HEADER + HOME */}
              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-sm font-semibold text-indigo-600">
                    Welcome back
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    Sign in
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to continue to your Baaraath dashboard.
                  </p>
                </div>

                {/* HOME BUTTON */}
                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                >
                  Home
                </Link>

              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />

                    {/* PASSWORD VIEW ICON */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>

                  </div>
                </div>

                {/* SIGN IN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

              </form>

              {/* REGISTER */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Create account
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}