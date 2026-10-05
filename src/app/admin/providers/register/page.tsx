"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  UserRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function RegisterProviderPage() {
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    city: "",
    address: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.businessName.trim()) {
      setError("Business name is required.");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Provider owner name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!form.password) {
      setError("Password is required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/providers/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName: form.businessName,
            description: form.description,
            city: form.city,
            address: form.address,
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to register provider."
        );
      }

      setSuccess(
        `Provider "${data.provider.name}" registered successfully.`
      );

      setForm({
        businessName: "",
        description: "",
        city: "",
        address: "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register provider."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/providers"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} />
          Back to Providers
        </Link>

        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Administration
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Register Provider
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Create a provider business and its owner account.
            The provider can use these credentials to access the
            provider dashboard.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Registration failed</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              Provider registered successfully
            </p>
            <p className="mt-1">{success}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Business Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter the provider's business details.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field
              label="Business Name"
              required
              icon={<Building2 size={16} />}
              value={form.businessName}
              onChange={(value) =>
                updateField("businessName", value)
              }
              placeholder="Example: Royal Garden Events"
            />

            <Field
              label="City"
              required
              icon={<MapPin size={16} />}
              value={form.city}
              onChange={(value) =>
                updateField("city", value)
              }
              placeholder="Example: Hyderabad"
            />

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Address
              </label>

              <textarea
                value={form.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                rows={3}
                placeholder="Complete business address"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Business Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Describe the provider business and services..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Provider Owner Account
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                These credentials will be used by the provider to
                log in to Baaraath.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field
              label="Owner Full Name"
              required
              icon={<UserRound size={16} />}
              value={form.fullName}
              onChange={(value) =>
                updateField("fullName", value)
              }
              placeholder="Provider owner's full name"
            />

            <Field
              label="Mobile Number"
              icon={<Phone size={16} />}
              value={form.phone}
              onChange={(value) =>
                updateField("phone", value)
              }
              placeholder="+91 9876543210"
            />

            <Field
              label="Email Address"
              required
              icon={<Mail size={16} />}
              type="email"
              value={form.email}
              onChange={(value) =>
                updateField("email", value)
              }
              placeholder="provider@example.com"
            />

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Role
              </label>

              <div className="mt-2 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                PROVIDER
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Provider role is assigned automatically.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <KeyRound size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Login Password
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Set the initial password for the provider account.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <PasswordField
              label="Password"
              value={form.password}
              visible={showPassword}
              onToggle={() =>
                setShowPassword((current) => !current)
              }
              onChange={(value) =>
                updateField("password", value)
              }
              placeholder="Minimum 8 characters"
            />

            <PasswordField
              label="Confirm Password"
              value={form.confirmPassword}
              visible={showConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword(
                  (current) => !current
                )
              }
              onChange={(value) =>
                updateField(
                  "confirmPassword",
                  value
                )
              }
              placeholder="Re-enter password"
            />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/providers"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Creating Provider...
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Create Provider
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative mt-2">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  visible,
  onToggle,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
        <span className="ml-1 text-red-500">*</span>
      </label>

      <div className="relative mt-2">
        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-10 pr-11 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
}
