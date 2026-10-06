"use client";

import Link from "next/link";
import { appPath } from "@/lib/app-path";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  RefreshCw,
  Store,
  Users,
  XCircle,
} from "lucide-react";

type Stats = {
  totalUsers: number;
  customers: number;
  providers: number;
  services: number;
  categories: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
};

type Booking = {
  id: string;
  customerId: string;
  serviceId: string;
  bookingDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  createdAt: string;

  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;

  service: {
    id: string;
    title: string;
    price: string;
    durationMinutes: number;
    vendor: {
      id: string;
      name: string;
      city: string;
      address: string | null;
    } | null;
    category: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type DashboardUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
};

type DashboardData = {
  stats: Stats;
  bookings: Booking[];
  users: DashboardUser[];
};

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  iconClass: string;
};

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

function statusClass(status: Booking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function StatusIcon({
  status,
}: {
  status: Booking["status"];
}) {
  if (status === "CONFIRMED") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "COMPLETED") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "CANCELLED") {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  return <Clock3 className="h-3.5 w-3.5" />;
}

function StatCard({
  title,
  value,
  subtitle,
  href,
  icon,
  iconClass,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-slate-50 opacity-70 transition group-hover:scale-125" />

      <div className="relative">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </p>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            {subtitle}
          </p>

          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(refresh = false) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(appPath("/api/admin/dashboard"), {
        cache: "no-store",
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Dashboard API returned ${response.status} instead of JSON.`
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Unable to load dashboard."
        );
      }

      setData({
        stats: result.stats,
        bookings: Array.isArray(result.bookings)
          ? result.bookings
          : [],
        users: Array.isArray(result.users)
          ? result.users
          : [],
      });
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-7">
            <XCircle className="mx-auto h-10 w-10 text-red-500" />

            <h1 className="mt-4 text-xl font-bold text-red-900">
              Dashboard could not be loaded
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error || "No dashboard data was returned."}
            </p>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const stats = data.stats;

  const statusItems = [
    {
      label: "Pending",
      value: stats.pendingBookings,
      className: "bg-amber-500",
      icon: <Clock3 className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Confirmed",
      value: stats.confirmedBookings,
      className: "bg-blue-500",
      icon: <CheckCircle2 className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Completed",
      value: stats.completedBookings,
      className: "bg-emerald-500",
      icon: <CheckCircle2 className="h-4 w-4 text-slate-400" />,
    },
    {
      label: "Cancelled",
      value: stats.cancelledBookings,
      className: "bg-red-500",
      icon: <XCircle className="h-4 w-4 text-slate-400" />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
                  Baaraath Administration
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Platform Dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Monitor users, providers, services, categories and
                  booking activity from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh Data
              </button>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950">
              Platform Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Live marketplace statistics from the database
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle={`${stats.customers} customers`}
              href="/admin/users"
              icon={<Users className="h-5 w-5" />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Providers"
              value={stats.providers}
              subtitle="Registered businesses"
              href="/admin/providers"
              icon={<Store className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Services"
              value={stats.services}
              subtitle="Marketplace services"
              href="/admin/services"
              icon={<Layers3 className="h-5 w-5" />}
              iconClass="bg-violet-50 text-violet-600"
            />

            <StatCard
              title="Categories"
              value={stats.categories}
              subtitle="Service categories"
              href="/admin/categories"
              icon={<Layers3 className="h-5 w-5" />}
              iconClass="bg-amber-50 text-amber-600"
            />

            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              subtitle="All customer bookings"
              href="/admin/bookings"
              icon={<CalendarDays className="h-5 w-5" />}
              iconClass="bg-indigo-50 text-indigo-600"
            />

            <StatCard
              title="Pending"
              value={stats.pendingBookings}
              subtitle="Awaiting provider action"
              href="/admin/bookings"
              icon={<Clock3 className="h-5 w-5" />}
              iconClass="bg-orange-50 text-orange-600"
            />

            <StatCard
              title="Completed"
              value={stats.completedBookings}
              subtitle="Successfully completed"
              href="/admin/bookings"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Customers"
              value={stats.customers}
              subtitle="Registered customers"
              href="/admin/users"
              icon={<Users className="h-5 w-5" />}
              iconClass="bg-cyan-50 text-cyan-600"
            />

          </div>
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.6fr_1fr]">

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-bold text-slate-950">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest booking activity across Baaraath
                </p>
              </div>

              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">

              {data.bookings.length === 0 ? (
                <div className="px-6 py-14 text-center text-sm text-slate-500">
                  No bookings found.
                </div>
              ) : (
                data.bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${encodeURIComponent(
                      booking.id
                    )}`}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <CalendarDays className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-950">
                          {booking.customer?.fullName ||
                            "Unknown Customer"}
                        </p>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass(
                            booking.status
                          )}`}
                        >
                          <StatusIcon
                            status={booking.status}
                          />
                          {booking.status}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-600">
                        {booking.service?.title ||
                          "Service unavailable"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {booking.service?.vendor?.name ||
                          "Provider"}{" "}
                        • {formatDate(booking.bookingDate)}
                      </p>
                    </div>

                    <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
                  </Link>
                ))
              )}

            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Booking Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current booking status
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">

              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-xs text-slate-400">
                  Total tracked bookings
                </p>

                <p className="mt-2 text-4xl font-bold">
                  {stats.totalBookings}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  {stats.totalBookings > 0 && (
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (stats.confirmedBookings /
                            stats.totalBookings) *
                            100
                        )}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-4">

                {statusItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                    />

                    <span className="flex-1 text-sm text-slate-600">
                      {item.label}
                    </span>

                    {item.icon}

                    <span className="text-sm font-bold text-slate-950">
                      {item.value}
                    </span>
                  </div>
                ))}

              </div>

              <Link
                href="/admin/bookings"
                className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Manage bookings
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>
          </div>

        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950">
                Recent Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest registered accounts
              </p>
            </div>

            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage users
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">

            {data.users.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500 md:col-span-2">
                No users found.
              </div>
            ) : (
              data.users.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {user.fullName
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {user.fullName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    {user.role}
                  </span>
                </div>
              ))
            )}

          </div>
        </section>

      </div>
    </main>
  );
}
