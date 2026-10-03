"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  Layers3,
  Loader2,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type Vendor = {
  id: string;
  name: string;
  city: string;
};

type Service = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  vendor: Vendor;
  category: Category;
  bookingCount: number;
};

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [status, setStatus] = useState<FilterStatus>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    durationMinutes: "60",
    vendorId: "",
    categoryId: "",
    active: true,
  });

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (categoryId) {
        params.set("categoryId", categoryId);
      }

      if (vendorId) {
        params.set("vendorId", vendorId);
      }

      if (status !== "ALL") {
        params.set("active", status);
      }

      const response = await fetch(
        `/api/admin/services?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to load services."
        );
      }

      setServices(data.services || []);
      setCategories(data.categories || []);
      setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadServices();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, categoryId, vendorId, status]);

  const statistics = useMemo(() => {
    const active = services.filter(
      (service) => service.active
    ).length;

    const inactive = services.filter(
      (service) => !service.active
    ).length;

    const bookings = services.reduce(
      (sum, service) => sum + service.bookingCount,
      0
    );

    return {
      total: services.length,
      active,
      inactive,
      bookings,
    };
  }, [services]);

  function startEdit(service: Service) {
    setEditing(service);

    setForm({
      title: service.title,
      description: service.description || "",
      price: service.price,
      durationMinutes: String(service.durationMinutes),
      vendorId: service.vendor.id,
      categoryId: service.category.id,
      active: service.active,
    });

    setError("");
  }

  function closeEdit() {
    if (saving) {
      return;
    }

    setEditing(null);
  }

  async function saveService(event: React.FormEvent) {
    event.preventDefault();

    if (!editing) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/admin/services/${encodeURIComponent(
          editing.id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            price: form.price,
            durationMinutes: Number(
              form.durationMinutes
            ),
            vendorId: form.vendorId,
            categoryId: form.categoryId,
            active: form.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to update service."
        );
      }

      setEditing(null);
      await loadServices();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update service."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleService(service: Service) {
    try {
      setUpdatingId(service.id);
      setError("");

      const response = await fetch(
        `/api/admin/services/${encodeURIComponent(
          service.id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !service.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to update service status."
        );
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? {
                ...item,
                active: !service.active,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update service status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteService(service: Service) {
    if (service.bookingCount > 0) {
      setError(
        `Cannot delete "${service.title}" because it has ${service.bookingCount} existing booking${
          service.bookingCount === 1 ? "" : "s"
        }.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Delete "${service.title}" permanently? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(service.id);
      setError("");

      const response = await fetch(
        `/api/admin/services/${encodeURIComponent(
          service.id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to delete service."
        );
      }

      setServices((current) =>
        current.filter(
          (item) => item.id !== service.id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete service."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Link>

            <p className="mt-6 text-sm font-medium text-indigo-600">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Service Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage marketplace services, pricing,
              providers and availability.
            </p>
          </div>

          <Link
            href="/services"
            target="_blank"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Marketplace
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Services
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {statistics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Active
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {statistics.active}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Inactive
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-500">
              {statistics.inactive}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Existing Bookings
            </p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {statistics.bookings}
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-4">

            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search services..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={vendorId}
              onChange={(event) =>
                setVendorId(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All providers</option>

              {vendors.map((vendor) => (
                <option
                  key={vendor.id}
                  value={vendor.id}
                >
                  {vendor.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as FilterStatus
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

          </div>
        </div>

        {loading ? (
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
            <p className="mt-3 text-sm text-slate-500">
              Loading services...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Layers3 className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No services found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {services.map((service) => {
              const updating =
                updatingId === service.id;

              const deleting =
                deletingId === service.id;

              return (
                <article
                  key={service.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-950">
                          {service.title}
                        </h2>

                        {service.active ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            <XCircle className="h-3.5 w-3.5" />
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {service.category?.name ||
                          "Uncategorized"}
                      </p>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {service.description ||
                          "No description available."}
                      </p>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Provider
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {service.vendor?.name ||
                              "Provider"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {service.vendor?.city ||
                              "Location unavailable"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Price
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-950">
                            ₹{service.price}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Duration
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
                            <Clock3 className="h-4 w-4 text-slate-400" />
                            {service.durationMinutes} min
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Bookings
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-950">
                            {service.bookingCount}
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 lg:w-44">

                      <Link
                        href={`/services/${service.id}`}
                        target="_blank"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View Service
                        <ExternalLink className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(service)
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit Service
                      </button>

                      <button
                        type="button"
                        disabled={updating || deleting}
                        onClick={() =>
                          toggleService(service)
                        }
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                          service.active
                            ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                            : "border-green-200 bg-white text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : service.active ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}

                        {updating
                          ? "Updating..."
                          : service.active
                            ? "Deactivate"
                            : "Activate"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          deleting ||
                          updating ||
                          service.bookingCount > 0
                        }
                        onClick={() =>
                          deleteService(service)
                        }
                        title={
                          service.bookingCount > 0
                            ? "Cannot delete a service with existing bookings."
                            : "Delete service"
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {deleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}

                        {deleting
                          ? "Deleting..."
                          : service.bookingCount > 0
                            ? "Delete Locked"
                            : "Delete Service"}
                      </button>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4">
          <div className="mx-auto flex min-h-full max-w-2xl items-center justify-center">
            <div className="w-full rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Administration
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Edit Service
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-lg p-2 text-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={saveService}
                className="space-y-5 p-6"
              >
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Service Title
                  </label>

                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Price
                    </label>

                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Duration (minutes)
                    </label>

                    <input
                      required
                      type="number"
                      min="1"
                      max="1440"
                      step="1"
                      value={form.durationMinutes}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          durationMinutes:
                            event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Category
                    </label>

                    <select
                      required
                      value={form.categoryId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          categoryId:
                            event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Provider
                    </label>

                    <select
                      required
                      value={form.vendorId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          vendorId:
                            event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">
                        Select provider
                      </option>

                      {vendors.map((vendor) => (
                        <option
                          key={vendor.id}
                          value={vendor.id}
                        >
                          {vendor.name} — {vendor.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        active: event.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      Service Active
                    </span>

                    <span className="block text-xs text-slate-500">
                      Active services are available in the marketplace.
                    </span>
                  </span>
                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEdit}
                    disabled={saving}
                    className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
