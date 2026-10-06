"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { appPath } from "@/lib/app-path";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Clock3,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Service = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  active: boolean;
  categoryId: string;
  Category: {
    id: string;
    name: string;
    slug: string;
  };
};

export default function EditVendorServicePage() {
  const params = useParams();
  const router = useRouter();

  const serviceId = String(params.id);

  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [serviceResponse, categoriesResponse] = await Promise.all([
          fetch(appPath(`/api/vendor/services/${serviceId}`), {
            cache: "no-store",
          }),
          fetch(appPath("/api/categories"), {
            cache: "no-store",
          }),
        ]);

        const serviceData = await serviceResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (!serviceResponse.ok) {
          throw new Error(
            serviceData.error || "Unable to load service."
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.error || "Unable to load categories."
          );
        }

        const loadedService: Service = serviceData.service;

        setService(loadedService);

        setTitle(loadedService.title || "");
        setCategoryId(
          loadedService.categoryId ||
            loadedService.Category?.id ||
            ""
        );
        setDescription(loadedService.description || "");
        setPrice(String(loadedService.price || ""));
        setDurationMinutes(
          String(loadedService.durationMinutes || 60)
        );
        setActive(Boolean(loadedService.active));

        setCategories(categoriesData.categories || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load service."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [serviceId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedTitle = title.trim();
    const numericPrice = Number(price);
    const numericDuration = Number(durationMinutes);

    if (!trimmedTitle) {
      setError("Service title is required.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      !Number.isInteger(numericDuration) ||
      numericDuration <= 0
    ) {
      setError("Duration must be a positive number of minutes.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/vendor/services/${serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: trimmedTitle,
            categoryId,
            description: description.trim() || null,
            price: numericPrice,
            durationMinutes: numericDuration,
            active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update service."
        );
      }

      setSuccess("Service updated successfully.");

      setTimeout(() => {
        router.push("/vendor/services");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update service."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading service...
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <h1 className="text-xl font-bold text-slate-900">
              Service not found
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              The service may have been deleted or you may not
              have permission to edit it.
            </p>

            <Link
              href="/vendor/services"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/vendor/services"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Edit Service
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update your service information, pricing and availability.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                active ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {active ? "Active" : "Inactive"}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <h2 className="font-semibold text-slate-950">
              Service Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your service details accurate so customers can
              find and book you.
            </p>
          </div>

          <div className="space-y-7 px-5 py-6 sm:px-7">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Service Title
              </label>

              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Premium Wedding Catering"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                maxLength={150}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                required
              >
                <option value="">Select category</option>

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

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe your service..."
                rows={6}
                maxLength={3000}
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />

              <div className="mt-1 text-right text-xs text-slate-400">
                {description.length}/3000
              </div>
            </div>

            {/* Price + Duration */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Price
                </label>

                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) =>
                      setPrice(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Duration
                </label>

                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="duration"
                    type="number"
                    min="1"
                    step="1"
                    value={durationMinutes}
                    onChange={(event) =>
                      setDurationMinutes(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-20 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) =>
                    setActive(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Service is active
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Active services are visible to customers and can
                    receive bookings.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <Link
              href="/vendor/services"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Link>

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
        </form>
      </div>
    </main>
  );
}
