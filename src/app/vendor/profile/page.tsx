"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

type Profile = {
  name: string;
  description: string | null;
  city: string;
  address: string | null;
  owner: {
    fullName: string;
    email: string;
    phone: string | null;
  };
};

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    address: "",
    fullName: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/vendor/profile");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load vendor profile.",
          );
        }

        const vendor = data.vendor;

        setProfile(vendor);

        setForm({
          name: vendor.name || "",
          description: vendor.description || "",
          city: vendor.city || "",
          address: vendor.address || "",
          fullName: vendor.owner.fullName || "",
          phone: vendor.owner.phone || "",
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

    loadProfile();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Business name is required.");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Owner name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/vendor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update vendor profile.",
        );
      }

      setProfile(data.vendor);

      setSuccess("Vendor profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update vendor profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 rounded-3xl bg-white p-12 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/vendor/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendor Dashboard
        </Link>

        <div className="mt-5">
          <h1 className="text-3xl font-bold text-slate-900">
            Vendor Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your business and owner information.
          </p>
        </div>

        {profile && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
                <Building2 className="h-9 w-9" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                {profile.name}
              </h2>

              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {profile.city}
              </p>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Account type
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  Service Provider
                </p>
              </div>
            </aside>

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <form onSubmit={handleSubmit}>
                <div className="border-b border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Business Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Information displayed to customers.
                  </p>
                </div>

                <div className="space-y-6 p-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Business Name *
                    </label>

                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none focus:border-amber-500"
                        placeholder="Business name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Business Description
                    </label>

                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
                      placeholder="Tell customers about your business"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        City *
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                          value={form.city}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              city: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none focus:border-amber-500"
                          placeholder="Hyderabad"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Business Address
                      </label>

                      <input
                        value={form.address}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            address: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
                        placeholder="Full business address"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Owner Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your provider account information.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Owner Name *
                      </label>

                      <div className="relative">
                        <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                          value={form.fullName}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none focus:border-amber-500"
                          placeholder="Owner name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email
                      </label>

                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                          value={profile.owner.email}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-500"
                        />
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Email cannot be changed here.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        value={form.phone}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            phone: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none focus:border-amber-500"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}

                  <div className="flex justify-end border-t border-slate-200 pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
