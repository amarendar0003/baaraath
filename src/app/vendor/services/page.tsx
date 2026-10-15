"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { appPath } from "@/lib/app-path";
import {
  Clock3,
  IndianRupee,
  Loader2,
  Plus,
  Store,
} from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  active: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export default function VendorServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const response = await fetch(appPath("/api/vendor/services"), {
          cache: "no-store",
        });
        const result = await response.json();

        if (response.status === 401) {
          window.location.href = appPath("/login");
          return;
        }

        if (response.status === 403) {
          window.location.href = appPath("/dashboard");
          return;
        }

        if (!response.ok) {
          throw new Error(result.message || "Unable to load services.");
        }

        if (!cancelled) {
          setServices(result.services ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load services.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Provider services
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Manage services
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review your listings and update their details or availability.
            </p>
          </div>

          <Link
            href="/vendor/services/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading services...
          </div>
        ) : error ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        ) : services.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <Store className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">
              No services yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add your first service to make it available for customers.
            </p>
            <Link
              href="/vendor/services/new"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add your first service
            </Link>
          </section>
        ) : (
          <div className="mt-8 space-y-4">
            {services.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-950">
                        {service.title}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          service.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {service.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {service.category.name}
                      {service.description ? ` · ${service.description}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {Number(service.price).toLocaleString("en-IN")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-4 w-4" />
                        {service.durationMinutes} minutes
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/vendor/services/${encodeURIComponent(service.id)}/edit`}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit service
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
