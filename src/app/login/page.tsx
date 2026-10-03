"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left panel */}
        <section className="hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-xl font-bold"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                B
              </span>
              Baaraath
            </Link>

            <div className="mt-28 max-w-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
                Welcome back
              </p>

              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                Everything you need for your next event.
              </h1>

              <p className="mt-6 text-lg leading-8 text-white/65">
                Sign in to manage your bookings, discover services,
                communicate with providers, and keep your event plans
                organized.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  "Manage your bookings",
                  "Save your preferred services",
                  "Track booking status",
                  "Connect with service providers",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/80"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Baaraath. All rights reserved.
          </p>
        </section>

        {/* Right panel */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-xl font-bold text-slate-950"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  B
                </span>
                Baaraath
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Lock className="h-6 w-6 text-slate-700" />
                </div>

                <h2 className="text-2xl font-bold text-slate-950">
                  Sign in to Baaraath
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your account details to continue.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-slate-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}

                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">OR</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                disabled
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-500"
              >
                <span className="text-base font-bold">G</span>
                Continue with Google
                <span className="text-xs">(coming soon)</span>
              </button>

              <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />

                <p className="text-xs leading-5 text-slate-500">
                  Your login session is protected using an HTTP-only
                  authentication cookie.
                </p>
              </div>

              <p className="mt-7 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-slate-950 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              By continuing, you agree to the Baaraath terms and privacy
              policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}