"use client";

import Link from "next/link";
import { appPath } from "@/lib/app-path";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

type ProfileData = {
  vendor: {
    id: string;
    name: string;
    description: string | null;
    city: string;
    address: string | null;
  };
  owner: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
};

export default function VendorProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    address: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(appPath("/api/vendor/profile"), {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = appPath("/login");
        return;
      }

      if (response.status === 403) {
        window.location.href = appPath("/dashboard");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load profile.");
      }

      setData(result);

      setForm({
        name: result.vendor.name || "",
        description: result.vendor.description || "",
        city: result.vendor.city || "",
        address: result.vendor.address || "",
        fullName: result.owner.fullName || "",
        email: result.owner.email || "",
        phone: result.owner.phone || "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load vendor profile.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSuccess("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(appPath("/api/vendor/profile"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (response.status === 401) {
        window.location.href = appPath("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to update profile.");
      }

      setData(result);

      setForm({
        name: result.vendor.name || "",
        description: result.vendor.description || "",
        city: result.vendor.city || "",
        address: result.vendor.address || "",
        fullName: result.owner.fullName || "",
        email: result.owner.email || "",
        phone: result.owner.phone || "",
      });

      setSuccess("Vendor profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-6 h-[600px] animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Unable to load vendor profile."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/vendor/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Business Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your business and provider contact information.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Building2 className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Business Information
                </h2>

                <p className="text-sm text-slate-500">
                  Information customers see about your business.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              <Field
                label="Business name"
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Enter business name"
                required
              />

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  rows={5}
                  placeholder="Describe your business..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <Field
                label="City"
                value={form.city}
                onChange={(value) => updateField("city", value)}
                placeholder="Hyderabad"
                icon={<MapPin className="h-4 w-4" />}
                required
              />

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Address
                </label>

                <textarea
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  rows={3}
                  placeholder="Business address"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <User className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Provider Contact
                </h2>

                <p className="text-sm text-slate-500">
                  Your account and contact information.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.fullName}
                onChange={(value) => updateField("fullName", value)}
                placeholder="Your full name"
                icon={<User className="h-4 w-4" />}
                required
              />

              <Field
                label="Phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="Phone number"
                icon={<Phone className="h-4 w-4" />}
              />

              <div className="sm:col-span-2">
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) => updateField("email", value)}
                  placeholder="you@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  required
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/vendor/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative mt-2">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
}
