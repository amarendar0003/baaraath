"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type Provider = {
  id: string;
  name: string;
  city?: string | null;
};

type Category = {
  id: string;
  name: string;
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
  vendor: Provider | null;
  category: Category | null;
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

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (categoryFilter) {
        params.set("categoryId", categoryFilter);
      }

      if (providerFilter) {
        params.set("vendorId", providerFilter);
      }

      if (statusFilter !== "ALL") {
        params.set("active", statusFilter);
      }

      const response = await fetch(
        `/api/admin/services?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to load services."
        );
      }

      setServices(data.services || []);
      setCategories(data.categories || []);
      setProviders(data.vendors || []);
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
  }, [search, categoryFilter, providerFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = services.filter((item) => item.active).length;
    const inactive = services.filter((item) => !item.active).length;
    const bookings = services.reduce(
      (total, item) => total + item.bookingCount,
      0
    );

    return {
      total: services.length,
      active,
      inactive,
      bookings,
    };
  }, [services]);

  function openAdd() {
    setSelectedService(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModal("add");
  }

  function openEdit(service: Service) {
    setSelectedService(service);

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
    setSuccess("");
    setModal("edit");
  }

  function openView(service: Service) {
    setSelectedService(service);
    setError("");
    setSuccess("");
    setModal("view");
  }

  function closeModal() {
    if (saving) return;

    setModal(null);
    setSelectedService(null);
    setForm(emptyForm);
    setError("");
  }

  async function saveService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price,
        durationMinutes: Number(form.durationMinutes),
        vendorId: form.vendorId,
        categoryId: form.categoryId,
        active: form.active,
      };

      const url =
        modal === "edit" && selectedService
          ? `/api/admin/services/${selectedService.id}`
          : "/api/admin/services";

      const method = modal === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
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

      setSuccess(
        modal === "edit"
          ? "Service updated successfully."
          : "Service created successfully."
      );

      await loadServices();

      setTimeout(() => {
        setModal(null);
        setSelectedService(null);
        setForm(emptyForm);
        setSuccess("");
      }, 700);
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
    const action = service.active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${service.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/services/${service.id}`,
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
            `Unable to ${action} service.`
        );
      }

      setSuccess(
        service.active
          ? "Service deactivated successfully."
          : "Service activated successfully."
      );

      await loadServices();

      setTimeout(() => setSuccess(""), 1800);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : `Unable to ${action} service.`
      );
    }
  }

  async function deleteService(service: Service) {
    if (service.bookingCount > 0) {
      window.alert(
        `This service cannot be deleted because it has ${service.bookingCount} existing booking(s). Deactivate it instead.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${service.title}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/services/${service.id}`,
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

      setSuccess("Service deleted successfully.");

      await loadServices();

      setTimeout(() => setSuccess(""), 1800);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete service."
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Services
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage marketplace services, pricing, providers,
              categories and service availability.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400"
          >
            <Plus className="h-5 w-5" />
            Add Service
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Services"
          value={stats.total}
          icon={<LayersIcon />}
        />

        <StatCard
          label="Active"
          value={stats.active}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={<XCircle className="h-5 w-5" />}
        />

        <StatCard
          label="Total Bookings"
          value={stats.bookings}
          icon={<Clock3 className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={providerFilter}
            onChange={(event) =>
              setProviderFilter(event.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="">All Providers</option>

            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Service Directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {services.length} service
                {services.length === 1 ? "" : "s"} found
              </p>
            </div>

            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            )}
          </div>
        </div>

        {loading && services.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-sm text-slate-500">
                Loading services...
              </p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              No services found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Try changing the filters or create a new service.
            </p>

            <button
              type="button"
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Provider</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Duration</th>
                  <th className="px-5 py-4">Bookings</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="max-w-[260px]">
                        <p className="font-semibold text-slate-900">
                          {service.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {service.description ||
                            "No description provided."}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {service.vendor?.name || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {service.vendor?.city || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                        {service.category?.name || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        ₹{Number(service.price).toLocaleString("en-IN")}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {service.durationMinutes} min
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">
                        {service.bookingCount}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {service.active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          title="View"
                          onClick={() => openView(service)}
                        >
                          <Eye className="h-4 w-4" />
                        </ActionButton>

                        <ActionButton
                          title="Edit"
                          onClick={() => openEdit(service)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </ActionButton>

                        <ActionButton
                          title={
                            service.active
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() =>
                            toggleService(service)
                          }
                        >
                          {service.active ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </ActionButton>

                        <ActionButton
                          title={
                            service.bookingCount > 0
                              ? "Cannot delete: existing bookings"
                              : "Delete"
                          }
                          onClick={() =>
                            deleteService(service)
                          }
                          disabled={service.bookingCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                  Service Management
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {modal === "add"
                    ? "Add Service"
                    : modal === "edit"
                      ? "Edit Service"
                      : "Service Details"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === "view" && selectedService ? (
              <div className="space-y-5 p-6">
                <DetailRow
                  label="Service Name"
                  value={selectedService.title}
                />

                <DetailRow
                  label="Description"
                  value={
                    selectedService.description ||
                    "No description provided."
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailRow
                    label="Price"
                    value={`₹${Number(
                      selectedService.price
                    ).toLocaleString("en-IN")}`}
                  />

                  <DetailRow
                    label="Duration"
                    value={`${selectedService.durationMinutes} minutes`}
                  />

                  <DetailRow
                    label="Provider"
                    value={
                      selectedService.vendor?.name || "—"
                    }
                  />

                  <DetailRow
                    label="Category"
                    value={
                      selectedService.category?.name || "—"
                    }
                  />

                  <DetailRow
                    label="Bookings"
                    value={String(
                      selectedService.bookingCount
                    )}
                  />

                  <DetailRow
                    label="Status"
                    value={
                      selectedService.active
                        ? "Active"
                        : "Inactive"
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      openEdit(selectedService)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Service
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={saveService}
                className="space-y-5 p-6"
              >
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Service Name *
                  </label>

                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        title: event.target.value,
                      })
                    }
                    placeholder="Example: Wedding Decoration"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
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
                    placeholder="Describe the service..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Price *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          price: event.target.value,
                        })
                      }
                      placeholder="0.00"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Duration (minutes) *
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.durationMinutes}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          durationMinutes:
                            event.target.value,
                        })
                      }
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Provider *
                    </label>

                    <select
                      value={form.vendorId}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          vendorId: event.target.value,
                        })
                      }
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="">
                        Select Provider
                      </option>

                      {providers.map((provider) => (
                        <option
                          key={provider.id}
                          value={provider.id}
                        >
                          {provider.name}
                          {provider.city
                            ? ` — ${provider.city}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Category *
                    </label>

                    <select
                      value={form.categoryId}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          categoryId:
                            event.target.value,
                        })
                      }
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="">
                        Select Category
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

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        active: event.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Service Active
                    </span>

                    <span className="block text-xs text-slate-500">
                      Customers can see and book active services.
                    </span>
                  </span>
                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {modal === "edit"
                      ? "Save Changes"
                      : "Create Service"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-600">
        {label}
      </p>
    </div>
  );
}

function LayersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">
        {value}
      </p>
    </div>
  );
}
