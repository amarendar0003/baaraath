"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#55243f] text-lg font-black text-[#f7d88b]">
                B
              </span>
              <span className="text-xl font-extrabold tracking-tight text-[#382333]">
                Baaraath
              </span>
            </Link>
            <h1 className="mt-6 text-2xl font-black text-[#342433]">Welcome back</h1>
            <p className="mt-2 text-sm text-[#786d76]">
              Sign in to manage your bookings and preferences.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#3d303c]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#3d303c]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#55243f] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#6b2d50] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-xs text-[#786d76]">
              Demo accounts: <span className="font-semibold">customer.demo@baaraath.test</span> /{" "}
              <span className="font-semibold">Customer@123</span> or{" "}
              <span className="font-semibold">provider.demo@baaraath.test</span> /{" "}
              <span className="font-semibold">Provider@123</span>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-[#786d76]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#8b3b5e] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
