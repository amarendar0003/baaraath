"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
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
  vendor: {
    id: string;
    name: string;
    city: string;
  };
  bookingCount: number;
};

type Category = {
  id: string;
  name: string;
};

type Vendor = {
  id: string;
  name: string;
  city: string;
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
      {active ? (
        <CheckCircle2 size={13} />
      ) : (
        <XCircle size={13} />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [active, setActive] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
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

      if (categoryId) {
        params.set("categoryId", categoryId);
      }

      if (vendorId) {
        params.set("vendorId", vendorId);
      }

      if (active !== "ALL") {
        params.set("active", active);
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
          data.message || "Unable to load services."
        );
      }

      setServices(data.services ?? []);
      setCategories(data.categories ?? []);
      setVendors(data.vendors ?? []);
    } catch (err) {
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
  }, [search, categoryId, vendorId, active]);

  async function updateServiceStatus(
    serviceId: string,
    nextActive: boolean
  ) {
    setUpdatingId(serviceId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/services/${serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: nextActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update service."
        );
      }

      setServices((current) =>
        current.map((service) =>
          service.id === serviceId
            ? {
                ...service,
                active: nextActive,
              }
            : service
        )
      );

      setSuccess(
        nextActive
          ? "Service activated successfully."
          : "Service deactivated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update service."
      );
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Administration
          </p>

          <h2 className="text-2xl font-bold text-slate-900">
            Service Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage marketplace services and their availability.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Dashboard
        </Link>
      </div>

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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search services..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={categoryId}
            onChange={(event) =>
              setCategoryId(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All providers</option>

            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>

          <select
            value={active}
            onChange={(event) =>
              setActive(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading services...
          </div>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <h3 className="font-semibold text-slate-900">
            No services found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {service.title}
                    </h3>

                    <StatusBadge active={service.active} />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {service.category.name}
                  </p>

                  {service.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {service.description}
                    </p>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Provider
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {service.vendor.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {service.vendor.city}
                      </p>
                    </div>

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

                      <p className="mt-1 flex items-center gap-1 font-medium text-slate-900">
                        <Clock3 size={14} />
                        {service.durationMinutes} min
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Bookings
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {service.bookingCount}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Created {formatDate(service.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  <Link
                    href={`/services/${service.id}`}
                    target="_blank"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Service
                  </Link>

                  {service.active ? (
                    <button
                      type="button"
                      disabled={updatingId === service.id}
                      onClick={() =>
                        updateServiceStatus(
                          service.id,
                          false
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === service.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={updatingId === service.id}
                      onClick={() =>
                        updateServiceStatus(
                          service.id,
                          true
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === service.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}