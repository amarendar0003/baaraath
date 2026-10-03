"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Tag,
  IndianRupee,
  Clock3,
  FileText,
  Power,
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
  price: string | number;
  durationMinutes: number;
  active: boolean;
  categoryId: string;
  Category: Category;
};

export default function EditVendorServicePage() {
  const params = useParams();
  const router = useRouter();

  const serviceId = params.id as string;

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
    if (!serviceId) return;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [serviceResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/vendor/services/${serviceId}`, {
            cache: "no-store",
          }),
          fetch("/api/categories", {
            cache: "no-store",
          }),
        ]);

        const serviceData = await serviceResponse.json();
        const categoryData = await categoriesResponse.json();

        if (!serviceResponse.ok) {
          throw new Error(
            serviceData.error || "Unable to load service."
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoryData.error || "Unable to load categories."
          );
        }

        const loadedService: Service = serviceData.service;

        setService(loadedService);
        setCategories(categoryData.categories || []);

        setTitle(loadedService.title || "");
        setCategoryId(loadedService.categoryId || "");
        setDescription(loadedService.description || "");
        setPrice(String(loadedService.price ?? ""));
        setDurationMinutes(
          String(loadedService.durationMinutes ?? 60)
        );
        setActive(Boolean(loadedService.active));
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a service title.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    const numericDuration = Number(durationMinutes);
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
            title: title.trim(),
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
          <div className="flex min-h-[400px] items-center justify-center">
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
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />

            <h1 className="text-xl font-semibold text-slate-900">
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
        <div className="mb-8">
          <Link
            href="/vendor/services"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Edit Service
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update your service information, pricing and availability.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main form */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Service Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Provide accurate information so customers can
                  understand your service.
                </p>
              </div>

              <div className="space-y-6 p-6">
                {/* Service title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Service Title
                  </label>

                  <div className="relative">
                    <FileText className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Example: Premium Wedding Catering"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Category
                  </label>

                  <div className="relative">
                    <Tag className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      required
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

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what customers will receive..."
                    rows={7}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Keep the description clear and useful for customers.
                  </p>
                </div>

                {/* Price and duration */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Price
                    </label>

                    <div className="relative">
                      <IndianRupee className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                      <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="duration"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Duration (minutes)
                    </label>

                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                      <input
                        id="duration"
                        type="number"
                        min="1"
                        step="1"
                        value={durationMinutes}
                        onChange={(e) =>
                          setDurationMinutes(e.target.value)
                        }
                        placeholder="60"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Side panel */}
            <aside className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Availability
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Control whether customers can book this service.
                    </p>
                  </div>

                  <Power className="h-5 w-5 text-slate-400" />
                </div>

                <button
                  type="button"
                  onClick={() => setActive((value) => !value)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        active
                          ? "text-green-700"
                          : "text-slate-700"
                      }`}
                    >
                      {active ? "Service Active" : "Service Inactive"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {active
                        ? "Customers can see and book this service."
                        : "Customers cannot book this service."}
                    </p>
                  </div>

                  <span
                    className={`relative h-6 w-11 rounded-full transition ${
                      active
                        ? "bg-green-600"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        active ? "left-6" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              </section>

              {/* Current information */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900">
                  Current Service
                </h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">
                      Service ID
                    </span>

                    <span className="max-w-[180px] truncate font-medium text-slate-700">
                      {service.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">
                      Category
                    </span>

                    <span className="font-medium text-slate-700">
                      {service.Category?.name || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">
                      Current Price
                    </span>

                    <span className="font-semibold text-slate-900">
                      ₹{service.price}
                    </span>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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

                <Link
                  href="/vendor/services"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
              </section>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}