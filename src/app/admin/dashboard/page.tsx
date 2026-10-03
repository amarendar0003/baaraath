"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Layers3,
  Loader2,
  MapPin,
  Package,
  Settings2,
  ShieldCheck,
  Store,
  Users,
  UserRound,
  UserRoundCog,
  XCircle,
} from "lucide-react";

type DashboardStats = {
  totalUsers: number;
  customers: number;
  providers: number;
  services: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  categories: number;
};

type RecentBooking = {
  id: string;
  status: string;
  bookingDate: string;
  customerName?: string;
  customer?: {
    fullName?: string;
    email?: string;
  };
  serviceName?: string;
  service?: {
    title?: string;
  };
  providerName?: string;
  vendor?: {
    name?: string;
    city?: string;
  };
};

type RecentUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

type BookingOverview = {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
};

type DashboardData = {
  stats?: DashboardStats;
  recentBookings?: RecentBooking[];
  recentUsers?: RecentUser[];
  bookingOverview?: BookingOverview;
};

const defaultStats: DashboardStats = {
  totalUsers: 0,
  customers: 0,
  providers: 0,
  services: 0,
  totalBookings: 0,
  pendingBookings: 0,
  completedBookings: 0,
  categories: 0,
};

const defaultOverview: BookingOverview = {
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
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

function statusStyle(status: string) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      };

    case "COMPLETED":
      return {
        badge: "bg-green-50 text-green-700 border-green-200",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      };

    case "CANCELLED":
      return {
        badge: "bg-red-50 text-red-700 border-red-200",
        icon: <XCircle className="h-3.5 w-3.5" />,
      };

    default:
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock3 className="h-3.5 w-3.5" />,
      };
  }
}

function roleStyle(role: string) {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "bg-violet-50 text-violet-700 border-violet-200";

    case "PROVIDER":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
  iconBox,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  iconBox: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBox}`}
        >
          {icon}
        </div>

        <div className="rounded-lg p-2 text-slate-300 transition group-hover:bg-slate-50 group-hover:text-slate-600">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
        {value.toLocaleString("en-IN")}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {subtitle}
      </p>

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-50 opacity-60 transition group-hover:scale-125" />
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats>(defaultStats);

  const [overview, setOverview] =
    useState<BookingOverview>(defaultOverview);

  const [recentBookings, setRecentBookings] =
    useState<RecentBooking[]>([]);

  const [recentUsers, setRecentUsers] =
    useState<RecentUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/dashboard",
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (response.status === 403) {
        window.location.href = "/dashboard";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to load admin dashboard."
        );
      }

      const source =
        data.dashboard ||
        data.data ||
        data;

      setStats({
        ...defaultStats,
        ...(source.stats || {}),
      });

      setOverview({
        ...defaultOverview,
        ...(source.bookingOverview || {}),
      });

      setRecentBookings(
        Array.isArray(source.recentBookings)
          ? source.recentBookings
          : []
      );

      setRecentUsers(
        Array.isArray(source.recentUsers)
          ? source.recentUsers
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalOverview =
    overview.pending +
    overview.confirmed +
    overview.completed +
    overview.cancelled;

  const pendingPercent =
    totalOverview > 0
      ? Math.round(
          (overview.pending / totalOverview) * 100
        )
      : 0;

  const confirmedPercent =
    totalOverview > 0
      ? Math.round(
          (overview.confirmed / totalOverview) * 100
        )
      : 0;

  const completedPercent =
    totalOverview > 0
      ? Math.round(
          (overview.completed / totalOverview) * 100
        )
      : 0;

  const cancelledPercent =
    totalOverview > 0
      ? Math.round(
          (overview.cancelled / totalOverview) * 100
        )
      : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-28 rounded-3xl bg-white" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-36 rounded-2xl bg-white"
                  />
                )
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-96 rounded-2xl bg-white lg:col-span-2" />
              <div className="h-96 rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb]">

      {/* TOP NAV */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[74px] items-center justify-between gap-4">

            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white shadow-sm">
                B
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600">
                  BAARAATH
                </p>

                <p className="text-lg font-bold leading-tight text-slate-950">
                  Administration
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {[
                ["Dashboard", "/admin/dashboard"],
                ["Users", "/admin/users"],
                ["Providers", "/admin/providers"],
                ["Services", "/admin/services"],
                ["Bookings", "/admin/bookings"],
                ["Categories", "/admin/categories"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    href === "/admin/dashboard"
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <Link
              href="/services"
              target="_blank"
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex"
            >
              Marketplace
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 shadow-xl sm:px-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Administration
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Monitor users, providers, services and
                booking activity across Baaraath.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/bookings"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 shadow-sm hover:bg-slate-100"
              >
                <CalendarCheck2 className="h-4 w-4" />
                Manage Bookings
              </Link>

              <Link
                href="/services"
                target="_blank"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15"
              >
                View Marketplace
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STAT CARDS */}
        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Platform Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current marketplace statistics
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle={`${stats.customers} customers`}
              href="/admin/users"
              icon={<Users className="h-5 w-5" />}
              iconBox="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Providers"
              value={stats.providers}
              subtitle="Registered businesses"
              href="/admin/providers"
              icon={<Store className="h-5 w-5" />}
              iconBox="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Services"
              value={stats.services}
              subtitle="Marketplace services"
              href="/admin/services"
              icon={<Package className="h-5 w-5" />}
              iconBox="bg-violet-50 text-violet-600"
            />

            <StatCard
              title="Categories"
              value={stats.categories}
              subtitle="Service categories"
              href="/admin/categories"
              icon={<Layers3 className="h-5 w-5" />}
              iconBox="bg-amber-50 text-amber-600"
            />

            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              subtitle="All customer bookings"
              href="/admin/bookings"
              icon={<CalendarDays className="h-5 w-5" />}
              iconBox="bg-indigo-50 text-indigo-600"
            />

            <StatCard
              title="Pending"
              value={stats.pendingBookings}
              subtitle="Awaiting provider action"
              href="/admin/bookings"
              icon={<Clock3 className="h-5 w-5" />}
              iconBox="bg-orange-50 text-orange-600"
            />

            <StatCard
              title="Completed"
              value={stats.completedBookings}
              subtitle="Successfully completed"
              href="/admin/bookings"
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBox="bg-green-50 text-green-600"
            />

            <StatCard
              title="Customers"
              value={stats.customers}
              subtitle="Registered customers"
              href="/admin/users"
              icon={<UserRound className="h-5 w-5" />}
              iconBox="bg-cyan-50 text-cyan-600"
            />
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="mt-7 grid gap-6 xl:grid-cols-3">

          {/* RECENT BOOKINGS */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-bold text-slate-950">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest booking activity across Baaraath
                </p>
              </div>

              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 font-semibold text-slate-900">
                  No bookings yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Booking activity will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.slice(0, 8).map(
                  (booking) => {
                    const style = statusStyle(
                      booking.status
                    );

                    const customerName =
                      booking.customerName ||
                      booking.customer?.fullName ||
                      "Customer";

                    const serviceName =
                      booking.serviceName ||
                      booking.service?.title ||
                      "Service";

                    const providerName =
                      booking.providerName ||
                      booking.vendor?.name ||
                      "Provider";

                    const city =
                      booking.vendor?.city || "";

                    return (
                      <Link
                        key={booking.id}
                        href={`/admin/bookings/${booking.id}`}
                        className="group block px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                      >
                        <div className="flex items-center gap-4">

                          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:flex">
                            <CalendarDays className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-bold text-slate-950">
                                {customerName}
                              </p>

                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.badge}`}
                              >
                                {style.icon}
                                {booking.status}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-sm text-slate-600">
                              {serviceName}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <span>
                                {providerName}
                              </span>

                              <span className="hidden sm:inline">
                                •
                              </span>

                              <span>
                                {formatDate(
                                  booking.bookingDate
                                )}
                              </span>

                              {city && (
                                <>
                                  <span className="hidden sm:inline">
                                    •
                                  </span>

                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {city}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            )}

            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
              >
                Open booking management
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* BOOKING OVERVIEW */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-slate-950">
                  Booking Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current booking status
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-medium text-slate-400">
                Total tracked bookings
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totalOverview}
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                {totalOverview > 0 && (
                  <div className="flex h-full">
                    <div
                      className="bg-amber-400"
                      style={{
                        width: `${pendingPercent}%`,
                      }}
                    />

                    <div
                      className="bg-blue-400"
                      style={{
                        width: `${confirmedPercent}%`,
                      }}
                    />

                    <div
                      className="bg-green-400"
                      style={{
                        width: `${completedPercent}%`,
                      }}
                    />

                    <div
                      className="bg-red-400"
                      style={{
                        width: `${cancelledPercent}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-4">

              {[
                [
                  "Pending",
                  overview.pending,
                  "bg-amber-400",
                  Clock3,
                ],
                [
                  "Confirmed",
                  overview.confirmed,
                  "bg-blue-500",
                  CheckCircle2,
                ],
                [
                  "Completed",
                  overview.completed,
                  "bg-green-500",
                  CheckCircle2,
                ],
                [
                  "Cancelled",
                  overview.cancelled,
                  "bg-red-500",
                  XCircle,
                ],
              ].map(
                ([label, value, dot]) => (
                  <div
                    key={String(label)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${String(
                        dot
                      )}`}
                    />

                    {label === "Pending" && (
                      <Clock3 className="h-4 w-4 text-slate-400" />
                    )}

                    {label === "Confirmed" && (
                      <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    )}

                    {label === "Completed" && (
                      <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    )}

                    {label === "Cancelled" && (
                      <XCircle className="h-4 w-4 text-slate-400" />
                    )}

                    <span className="flex-1 text-sm text-slate-600">
                      {String(label)}
                    </span>

                    <span className="text-sm font-bold text-slate-950">
                      {Number(value)}
                    </span>
                  </div>
                )
              )}
            </div>

            <Link
              href="/admin/bookings"
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* LOWER SECTION */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* RECENT USERS */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-bold text-slate-950">
                  Recent Users
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest accounts registered on Baaraath
                </p>
              </div>

              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Manage users
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto h-9 w-9 text-slate-300" />

                <p className="mt-3 text-sm font-semibold text-slate-900">
                  No users found
                </p>
              </div>
            ) : (
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {recentUsers.slice(0, 6).map(
                  (user) => (
                    <Link
                      key={user.id}
                      href={`/admin/users/${user.id}`}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-slate-700 shadow-sm">
                          {user.fullName
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-slate-950">
                              {user.fullName}
                            </p>
                          </div>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {user.email}
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${roleStyle(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </div>

                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {/* QUICK ADMIN */}
          <div className="overflow-hidden rounded-2xl bg-slate-950 p-5 text-white shadow-lg sm:p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Settings2 className="h-5 w-5 text-white" />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Administration
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Manage platform data, providers, services,
              users and bookings securely.
            </p>

            <div className="mt-6 space-y-2">

              <Link
                href="/admin/users"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
              >
                <UserRoundCog className="h-4 w-4 text-slate-300" />

                <span className="flex-1 text-sm font-medium">
                  Manage Users
                </span>

                <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
              </Link>

              <Link
                href="/admin/providers"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
              >
                <Store className="h-4 w-4 text-slate-300" />

                <span className="flex-1 text-sm font-medium">
                  Manage Providers
                </span>

                <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
              </Link>

              <Link
                href="/admin/services"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
              >
                <Package className="h-4 w-4 text-slate-300" />

                <span className="flex-1 text-sm font-medium">
                  Manage Services
                </span>

                <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
              </Link>

              <Link
                href="/admin/categories"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
              >
                <Layers3 className="h-4 w-4 text-slate-300" />

                <span className="flex-1 text-sm font-medium">
                  Manage Categories
                </span>

                <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
              </Link>

            </div>

            <div className="mt-6 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />

                <span className="text-xs font-semibold text-emerald-300">
                  Admin access protected
                </span>
              </div>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Administrative operations require an
                authenticated admin session.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Baaraath Administration
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/services"
              className="hover:text-slate-700"
            >
              Marketplace
            </Link>

            <Link
              href="/admin/bookings"
              className="hover:text-slate-700"
            >
              Bookings
            </Link>

            <Link
              href="/admin/users"
              className="hover:text-slate-700"
            >
              Users
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

