"use client";

import Link from "next/link";
import { appPath } from "@/lib/app-path";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  Search,
  Store,
  UserRound,
  Plus,
} from "lucide-react";

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
    role: "PROVIDER";
    createdAt: string;
  };
  serviceCount: number;
};

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProviders();
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  async function loadProviders() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        appPath(`/api/admin/providers?${params.toString()}`),
        {
          cache: "no-store",
        },
      );

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
        throw new Error(
          result.message || "Unable to load providers.",
        );
      }

      setProviders(result.providers || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load providers.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Providers
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage provider businesses registered on Baaraath.
            </p>
          
            <Link
              href="/admin/providers/register"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Register Provider
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3">
            <p className="text-xs text-slate-500">
              Total providers
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
              {providers.length}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, owner, email or city..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center">
              <Store className="mx-auto h-9 w-9 text-slate-300" />

              <h2 className="mt-4 font-semibold text-slate-900">
                No providers found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProviderCard({
  provider,
}: {
  provider: Provider;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-950 p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-semibold">
                {provider.name}
              </h2>

              <p className="mt-1 flex items-center gap-1 text-xs text-white/60">
                <MapPin className="h-3.5 w-3.5" />
                {provider.city}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
            Provider
          </span>
        </div>
      </div>

      <div className="p-5">
        {provider.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
            {provider.description}
          </p>
        ) : (
          <p className="text-sm italic text-slate-400">
            No business description provided.
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <InfoBox
            label="Services"
            value={String(provider.serviceCount)}
            icon={<Store className="h-4 w-4" />}
          />

          <InfoBox
            label="Joined"
            value={formatDate(provider.createdAt)}
            icon={<UserRound className="h-4 w-4" />}
          />
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Provider contact
          </p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <UserRound className="h-4 w-4 text-slate-400" />
              <span className="truncate">
                {provider.owner.fullName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="truncate">
                {provider.owner.email}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>
                {provider.owner.phone || "No phone number"}
              </span>
            </div>
          </div>
        </div>

        {provider.address && (
          <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{provider.address}</span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">
            Provider ID: {provider.id}
          </span>

          <div className="flex flex-wrap gap-2">
  <Link
    href={`/admin/providers/${provider.id}`}
    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
  >
    View Details
  </Link>

  <Link
    href={`/admin/services?vendor=${provider.id}`}
    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
  >
    View Services
  </Link>
</div>
        </div>
      </div>
    </article>
  );
}

function InfoBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "â€”";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

