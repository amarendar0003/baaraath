"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Layers3,
  Loader2,
  MapPin,
  Package,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
  X,
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

type FormState = {
  title: string;
  description: string;
  price: string;
  durationMinutes: string;
  vendorId: string;
  categoryId: string;
  active: boolean;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  price: "",
  durationMinutes: "60",
  vendorId: "",
  categoryId: "",
  active: true,
};

function formatPrice(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(active: boolean) {
  return active
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [viewingService, setViewingService] =
    useState<Service | null>(null);

  const [actionId, setActionId] = useState<string | null>(null);

  async function loadServices(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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

      if (activeFilter !== "ALL") {
        params.set("active", activeFilter);
      }

      const response = await fetch(
        `/api/admin/services?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Server returned ${response.status} instead of JSON.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to load services."
        );
      }

      setServices(Array.isArray(data.services) ? data.services : []);
      setCategories(
        Array.isArray(data.categories) ? data.categories : []
      );
      setVendors(
        Array.isArray(data.vendors) ? data.vendors : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load services."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadServices();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, categoryId, vendorId, activeFilter]);

  function openAddModal() {
    setModalMode("ADD");
    setEditingId(null);
    setForm({
      ...emptyForm,
      vendorId: vendors[0]?.id || "",
      categoryId: categories[0]?.id || "",
    });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(service: Service) {
    setModalMode("EDIT");
    setEditingId(service.id);

    setForm({
      title: service.title,
      description: service.description || "",
      price: service.price,
      durationMinutes: String(service.durationMinutes),
      vendorId: service.vendor?.id || "",
      categoryId: service.category?.id || "",
      active: service.active,
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof FormState,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveService() {
    try {
      setSaving(true);
      setError("");

      if (!form.title.trim()) {
        throw new Error("Service title is required.");
      }

      if (!form.vendorId) {
        throw new Error("Please select a provider.");
      }

      if (!form.categoryId) {
        throw new Error("Please select a category.");
      }

      const price = Number(form.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid price.");
      }

      const duration = Number(form.durationMinutes);

      if (!Number.isInteger(duration) || duration < 1) {
        throw new Error("Enter a valid duration.");
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        durationMinutes: duration,
        vendorId: form.vendorId,
        categoryId: form.categoryId,
        active: form.active,
      };

      const url =
        modalMode === "ADD"
          ? "/api/admin/services"
          : `/api/admin/services/${encodeURIComponent(
              editingId || ""
            )}`;

      const response = await fetch(url, {
        method: modalMode === "ADD" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to save service."
        );
      }

      closeModal();
      await loadServices(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save service."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleService(service: Service) {
    const action = service.active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${service.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(service.id);
      setError("");

      const response = await fetch(
        `/api/admin/services/${encodeURIComponent(service.id)}`,
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
            "Unable to update service."
        );
      }

      await loadServices(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update service."
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteService(service: Service) {
    if (service.bookingCount > 0) {
      setError(
        `"${service.title}" cannot be deleted because it has ${service.bookingCount} existing booking${
          service.bookingCount === 1 ? "" : "s"
        }. Deactivate it instead.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${service.title}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(service.id);
      setError("");

      const response = await fetch(
        `/api/admin/services/${encodeURIComponent(service.id)}`,
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
        current.filter((item) => item.id !== service.id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete service."
      );
    } finally {
      setActionId(null);
    }
  }

  const activeCount = useMemo(
    () => services.filter((service) => service.active).length,
    [services]
  );

  const inactiveCount = services.length - activeCount;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Link>

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Service Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage marketplace services, providers, pricing,
              availability and service status.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            Add Service
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total services
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {services.length}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Active
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {activeCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Inactive
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-600">
                  {inactiveCount}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
                <Power className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search services..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={vendorId}
              onChange={(event) =>
                setVendorId(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All providers</option>

              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>

            <select
              value={activeFilter}
              onChange={(event) =>
                setActiveFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <button
              type="button"
              onClick={() => loadServices(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">Action failed</p>
              <p className="mt-1">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Package className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                No services found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No services match your current filters. Try
                changing your search or create a new service.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Service
              </button>
            </div>
          ) : (
            <div className="grid gap-5">
              {services.map((service) => {
                const busy = actionId === service.id;

                return (
                  <article
                    key={service.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="p-5 sm:p-6">

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-xl font-bold text-slate-950">
                              {service.title}
                            </h2>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(
                                service.active
                              )}`}
                            >
                              {service.active ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}

                              {service.active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-medium text-indigo-600">
                            {service.category?.name ||
                              "Uncategorized"}
                          </p>

                          {service.description && (
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                              {service.description}
                            </p>
                          )}

                          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Provider
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                {service.vendor?.name ||
                                  "Not available"}
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="h-3 w-3" />
                                {service.vendor?.city ||
                                  "Unknown"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Price
                              </p>

                              <p className="mt-1 text-lg font-bold text-slate-950">
                                ₹{formatPrice(service.price)}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Duration
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {service.durationMinutes} min
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Bookings
                              </p>

                              <p className="mt-1 text-lg font-bold text-slate-950">
                                {service.bookingCount}
                              </p>
                            </div>

                          </div>

                          <p className="mt-4 text-xs text-slate-400">
                            Created {formatDate(service.createdAt)}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:w-48 lg:flex-col">
                          <button
                            type="button"
                            onClick={() =>
                              setViewingService(service)
                            }
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:flex-none"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(service)
                            }
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 lg:flex-none"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              toggleService(service)
                            }
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60 lg:flex-none"
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}

                            {service.active
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              busy ||
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
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none"
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}

                            {service.bookingCount > 0
                              ? "Delete Locked"
                              : "Delete"}
                          </button>
                        </div>

                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Administration
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {modalMode === "ADD"
                    ? "Add New Service"
                    : "Edit Service"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Service Title
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="e.g. Premium Event Planning"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe the service..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateForm(
                          "price",
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      className="h-11 w-full rounded-xl border border-slate-200 pl-8 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Duration
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={form.durationMinutes}
                      onChange={(event) =>
                        updateForm(
                          "durationMinutes",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-16 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      minutes
                    </span>
                  </div>
                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Provider
                  </label>

                  <select
                    value={form.vendorId}
                    onChange={(event) =>
                      updateForm(
                        "vendorId",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>

                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      updateForm(
                        "categoryId",
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Service availability
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Active services are visible to customers.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    updateForm(
                      "active",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveService}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {saving
                  ? "Saving..."
                  : modalMode === "ADD"
                    ? "Create Service"
                    : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {viewingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Service Details
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {viewingService.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewingService(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-500">
                  Status
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusBadge(
                    viewingService.active
                  )}`}
                >
                  {viewingService.active ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}

                  {viewingService.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {viewingService.description ||
                    "No description provided."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {viewingService.category?.name ||
                      "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Provider
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {viewingService.vendor?.name ||
                      "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Price
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-950">
                    ₹{formatPrice(viewingService.price)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Duration
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {viewingService.durationMinutes} minutes
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Total Bookings
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {viewingService.bookingCount}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(viewingService.createdAt)}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setViewingService(null)}
                className="w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}
