"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validatePassword(value: string) {
    return {
      length: value.length >= 8,
      number: /\d/.test(value),
      letter: /[A-Za-z]/.test(value),
    };
  }

  const passwordRules = validatePassword(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordRules.length) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!agree) {
      setError("Please accept the terms and privacy policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          role: "CUSTOMER",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create your account.");
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
        {/* Left side */}
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

            <div className="mt-24 max-w-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
                Join Baaraath
              </p>

              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                Plan your event with the right services.
              </h1>

              <p className="mt-6 text-lg leading-8 text-white/65">
                Create your account and discover event services,
                manage bookings, and keep everything organized in one
                place.
              </p>

              <div className="mt-10 space-y-5">
                <Benefit text="Discover services near you" />
                <Benefit text="Book services online" />
                <Benefit text="Manage your bookings" />
                <Benefit text="Track your event arrangements" />
              </div>
            </div>
          </div>

          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Baaraath. All rights reserved.
          </p>
        </section>

        {/* Right side */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-lg">
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
              <div className="mb-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <User className="h-6 w-6 text-slate-700" />
                </div>

                <h2 className="text-2xl font-bold text-slate-950">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create a customer account to start discovering and
                  booking services.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your full name"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Phone number
                    <span className="ml-1 text-slate-400">(optional)</span>
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create a password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <PasswordRule
                      valid={passwordRules.length}
                      text="At least 8 characters"
                    />

                    <PasswordRule
                      valid={passwordRules.letter}
                      text="Contains a letter"
                    />

                    <PasswordRule
                      valid={passwordRules.number}
                      text="Contains a number"
                    />
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Repeat your password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) => setAgree(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />

                  <span className="text-sm leading-6 text-slate-500">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-slate-800 hover:underline"
                    >
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-slate-800 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create account"}

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
                  Your password is securely hashed before it is stored.
                  Baaraath does not store your plain-text password.
                </p>
              </div>

              <p className="mt-7 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-slate-950 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/80">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
        <Check className="h-4 w-4" />
      </span>
      {text}
    </div>
  );
}

function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valid ? "text-emerald-600" : "text-slate-400"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          valid ? "bg-emerald-100" : "bg-slate-100"
        }`}
      >
        {valid && <Check className="h-3 w-3" />}
      </span>

      {text}
    </div>
  );
}