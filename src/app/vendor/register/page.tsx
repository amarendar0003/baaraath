"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

export default function VendorRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] =
    useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordValid =
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordValid) {
      setError(
        "Password must contain at least 8 characters, including a letter and a number."
      );
      return;
    }

    if (!agree) {
      setError("Please accept the terms and privacy policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/vendor/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          businessName,
          description,
          city,
          address,
          registrationNumber,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to create provider account."
        );
        return;
      }

      router.push("/vendor/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[420px_1fr]">
        {/* Sidebar */}
        <section className="hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
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

            <div className="mt-24">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">
                For providers
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Grow your service business with Baaraath.
              </h1>

              <p className="mt-6 text-base leading-7 text-white/60">
                Create your provider account and start managing your
                services and customer bookings.
              </p>

              <div className="mt-10 space-y-5">
                <Benefit text="Create your business profile" />
                <Benefit text="Add and manage services" />
                <Benefit text="Receive customer bookings" />
                <Benefit text="Track your booking activity" />
              </div>
            </div>
          </div>

          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Baaraath
          </p>
        </section>

        {/* Form */}
        <section className="px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <div className="lg:hidden">
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

              <div className="mt-8">
                <p className="text-sm font-medium text-slate-500">
                  Provider registration
                </p>

                <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  Register your business
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your account and business details to create
                  your provider profile.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <SectionTitle
                  icon={<User className="h-5 w-5" />}
                  title="Account details"
                  description="These details are used to sign in to your provider account."
                />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Input
                    id="fullName"
                    label="Your full name"
                    icon={<User className="h-5 w-5" />}
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Your full name"
                    required
                  />

                  <Input
                    id="phone"
                    label="Phone number"
                    icon={<Phone className="h-5 w-5" />}
                    value={phone}
                    onChange={setPhone}
                    placeholder="+91 98765 43210"
                    required
                  />

                  <div className="sm:col-span-2">
                    <Input
                      id="email"
                      label="Email address"
                      type="email"
                      icon={<Mail className="h-5 w-5" />}
                      value={email}
                      onChange={setEmail}
                      placeholder="business@example.com"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Business */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <SectionTitle
                  icon={<Building2 className="h-5 w-5" />}
                  title="Business details"
                  description="Information customers will see on your provider profile."
                />

                <div className="mt-6 space-y-5">
                  <Input
                    id="businessName"
                    label="Business name"
                    icon={<Building2 className="h-5 w-5" />}
                    value={businessName}
                    onChange={setBusinessName}
                    placeholder="Your business name"
                    required
                  />

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Business description
                    </label>

                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      rows={4}
                      placeholder="Tell customers about your business and services..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="city"
                      label="City"
                      icon={<MapPin className="h-5 w-5" />}
                      value={city}
                      onChange={setCity}
                      placeholder="Hyderabad"
                      required
                    />

                    <Input
                      id="registrationNumber"
                      label="Registration number"
                      value={registrationNumber}
                      onChange={setRegistrationNumber}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Business address
                    </label>

                    <textarea
                      id="address"
                      value={address}
                      onChange={(event) =>
                        setAddress(event.target.value)
                      }
                      rows={3}
                      required
                      placeholder="Complete business address"
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </section>

              {/* Password */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <SectionTitle
                  icon={<Lock className="h-5 w-5" />}
                  title="Account password"
                  description="Use a strong password to protect your provider account."
                />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <PasswordInput
                    id="password"
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    setShow={setShowPassword}
                  />

                  <PasswordInput
                    id="confirmPassword"
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                  />
                </div>

                <div className="mt-4 space-y-1.5">
                  <Rule
                    valid={password.length >= 8}
                    text="At least 8 characters"
                  />
                  <Rule
                    valid={/[A-Za-z]/.test(password)}
                    text="Contains a letter"
                  />
                  <Rule
                    valid={/\d/.test(password)}
                    text="Contains a number"
                  />
                </div>
              </section>

              {/* Terms */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) =>
                      setAgree(event.target.checked)
                    }
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

                <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <p className="text-xs leading-5 text-slate-500">
                    Your password is securely hashed before it is
                    stored. Your provider account will use the
                    provider role.
                  </p>
                </div>
              </section>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating provider account..."
                  : "Create provider account"}

                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-slate-950 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Input({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={`h-12 w-full rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100 ${
            icon ? "pl-11" : "px-4"
          } pr-4`}
        />
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: (value: boolean) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-12 text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
        >
          {show ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function Rule({
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
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100">
        {valid && <Check className="h-3 w-3" />}
      </span>

      {text}
    </div>
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