"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  Trash2,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  bookingCount: number;
};

type Provider = {
  id: string;
  name: string;
  description: string | null;
  city: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  services: Service[];
  totalServices: number;
  activeServices: number;
  totalBookings: number;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function AdminProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const providerId = params?.id;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    address: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  async function loadProvider() {
    if (!providerId) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/providers/${providerId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load provider."
        );
      }

      setProvider(data.provider);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load provider."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProvider();
  }, [providerId]);

  function openEdit() {
    if (!provider) return;

    setForm({
      name: provider.name,
      description: provider.description || "",
      city: provider.city,
      address: provider.address || "",
      ownerName: provider.owner.fullName,
      ownerEmail: provider.owner.email,
      ownerPhone: provider.owner.phone || "",
      newPassword: "",
      confirmPassword: "",
    });

    setActionError("");
    setActionSuccess("");
    setEditOpen(true);
  }

  async function handleUpdate() {
    if (!providerId) return;

    setActionError("");
    setActionSuccess("");

    if (!form.name.trim()) {
      setActionError("Provider name is required.");
      return;
    }

    if (!form.city.trim()) {
      setActionError("City is required.");
      return;
    }

    if (!form.ownerName.trim()) {
      setActionError("Provider owner name is required.");
      return;
    }

    if (!form.ownerEmail.trim()) {
      setActionError("Provider owner email is required.");
      return;
    }

    if (form.newPassword && form.newPassword.length < 8) {
      setActionError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setActionError("New password and confirmation password do not match.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/providers/${providerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            city: form.city,
            address: form.address,
            ownerName: form.ownerName,
            ownerEmail: form.ownerEmail,
            ownerPhone: form.ownerPhone,
            newPassword: form.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update provider."
        );
      }

      setActionSuccess("Provider updated successfully.");
      setEditOpen(false);

      await loadProvider();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update provider."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!providerId) return;

    setActionError("");

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/admin/providers/${providerId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete provider."
        );
      }

      router.replace("/admin/providers");
      router.refresh();
    } catch (err) {
      setDeleting(false);
      setDeleteOpen(false);

      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to delete provider."
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading provider...
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/providers"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} />
          Back to Providers
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || "Provider not found."}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/providers"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft size={16} />
            Back to Providers
          </Link>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 size={24} />
                </div>

                <div>
                  <p className="text-sm font-medium text-indigo-600">
                    Provider
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900">
                    {provider.name}
                  </h2>
                </div>
              </div>

              {provider.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  {provider.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <Pencil size={16} />
                Edit Provider
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionError("");
                  setDeleteOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <Trash2 size={16} />
                Delete Provider
              </button>
            </div>
          </div>
        </div>

        {actionSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {actionSuccess}
          </div>
        )}

        {actionError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Services
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {provider.totalServices}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Active Services
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {provider.activeServices}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Bookings
            </p>

            <p className="mt-2 text-2xl font-bold text-indigo-600">
              {provider.totalBookings}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-indigo-600" />
              <h3 className="font-semibold text-slate-900">
                Business Information
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Business Name
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {provider.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  City
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  <MapPin size={15} />
                  {provider.city}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Address
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {provider.address || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Registered
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  <CalendarDays size={15} />
                  {formatDate(provider.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <UserRound size={18} className="text-indigo-600" />
              <h3 className="font-semibold text-slate-900">
                Owner Information
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {provider.owner.fullName}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-700">
                  <Mail size={15} />
                  {provider.owner.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  <Phone size={15} />
                  {provider.owner.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Account Role
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-700">
                  {provider.owner.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Provider Services
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Services currently associated with this provider.
              </p>
            </div>

            <Link
              href={`/admin/services?vendor=${provider.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View in Service Management →
            </Link>
          </div>

          {provider.services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <Building2
                size={30}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 font-medium text-slate-900">
                No services
              </p>

              <p className="mt-1 text-sm text-slate-500">
                This provider has not created any services yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {provider.services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {service.title}
                        </h4>

                        <StatusBadge active={service.active} />
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {service.category.name}
                      </p>

                      {service.description && (
                        <p className="mt-3 max-w-3xl text-sm text-slate-600">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/services/${service.id}`}
                      target="_blank"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Service
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Price
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        ₹{service.price}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Duration
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-700">
                        <Clock3 size={14} />
                        {service.durationMinutes} minutes
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Bookings
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-700">
                        <Users size={14} />
                        {service.bookingCount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Provider Management
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Edit Provider
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Provider Name *
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Provider business name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Provider description"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    City *
                  </label>

                  <input
                    value={form.city}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        city: event.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Hyderabad"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Address
                  </label>

                  <input
                    value={form.address}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        address: event.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Business address"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Delete Provider?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to permanently delete{" "}
              <span className="font-semibold text-slate-900">
                {provider.name}
              </span>
              .
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800">
              If this provider has services with existing bookings,
              deletion will be blocked automatically.
            </div>

            {actionError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete Provider"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}




