"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  Loader2,
  ShieldCheck,
  Store,
  Users,
  UserRound,
  XCircle,
} from "lucide-react";

type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

type RecentUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

type RecentBooking = {
  id: string;
  bookingDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  createdAt: string;
  customer: {
    fullName: string;
    email: string;
    phone: string | null;
  };
  service: {
    id: string;
    title: string;
    price: string;
    vendor: string;
    category: string;
  };
};

type DashboardData = {
  stats: {
    totalUsers: number;
    totalCustomers: number;
    totalProviders: number;
    totalServices: number;
    activeServices: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalCategories: number;
  };
  recentUsers: RecentUser[];
  recentBookings: RecentBooking[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (response.status === 403) {
        window.location.href = "/dashboard";
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load admin dashboard.",
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Unable to load admin dashboard</p>
          <p className="mt-1">{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            <Loader2 className="h-4 w-4" />
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Administration
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Monitor users, providers, services and booking activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Store className="h-4 w-4" />
                View Marketplace
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total users"
            value={data.stats.totalUsers}
            href="/admin/users"
          />

          <StatCard
            icon={<UserRound className="h-5 w-5" />}
            label="Customers"
            value={data.stats.totalCustomers}
            href="/admin/users?role=CUSTOMER"
          />

          <StatCard
            icon={<Store className="h-5 w-5" />}
            label="Providers"
            value={data.stats.totalProviders}
            href="/admin/providers"
          />

          <StatCard
            icon={<Layers3 className="h-5 w-5" />}
            label="Services"
            value={data.stats.totalServices}
            href="/admin/services"
          />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Total bookings"
            value={data.stats.totalBookings}
            href="/admin/bookings"
          />

          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Pending bookings"
            value={data.stats.pendingBookings}
            href="/admin/bookings?status=PENDING"
          />

          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed bookings"
            value={data.stats.completedBookings}
            href="/admin/bookings?status=COMPLETED"
          />

          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Categories"
            value={data.stats.totalCategories}
            href="/admin/categories"
          />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-950">
                  Recent bookings
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest booking activity across Baaraath
                </p>
              </div>

              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {data.recentBookings.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No bookings yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentBookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-950">
                Booking overview
              </h2>

              <div className="mt-5 space-y-4">
                <OverviewRow
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Pending"
                  value={data.stats.pendingBookings}
                />

                <OverviewRow
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Confirmed"
                  value={data.stats.confirmedBookings}
                />

                <OverviewRow
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Completed"
                  value={data.stats.completedBookings}
                />

                <OverviewRow
                  icon={<XCircle className="h-4 w-4" />}
                  label="Cancelled"
                  value={data.stats.cancelledBookings}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-950">
                Recent users
              </h2>

              <div className="mt-4 space-y-3">
                {data.recentUsers.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No users found.
                  </p>
                ) : (
                  data.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                        <UserRound className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user.fullName}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>

                      <RoleBadge role={user.role} />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6" />

                <div>
                  <h2 className="font-semibold">Administration</h2>
                  <p className="mt-1 text-xs text-white/60">
                    Manage platform data securely.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                <QuickLink
                  href="/admin/users"
                  text="Manage users"
                />

                <QuickLink
                  href="/admin/providers"
                  text="Manage providers"
                />

                <QuickLink
                  href="/admin/services"
                  text="Manage services"
                />

                <QuickLink
                  href="/admin/bookings"
                  text="Manage bookings"
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </Link>
  );
}

function BookingRow({
  booking,
}: {
  booking: RecentBooking;
}) {
  return (
    <div className="px-5 py-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <CalendarDays className="h-5 w-5 text-slate-600" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-950">
              {booking.customer.fullName}
            </h3>

            <p className="mt-1 truncate text-sm text-slate-500">
              {booking.service.title}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {booking.service.vendor} ·{" "}
              {formatDate(booking.bookingDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={booking.status} />

          <Link
            href="/admin/bookings"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: RecentBooking["status"];
}) {
  const styles: Record<RecentBooking["status"], string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    CUSTOMER: "bg-blue-50 text-blue-700",
    PROVIDER: "bg-emerald-50 text-emerald-700",
    ADMIN: "bg-purple-50 text-purple-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function OverviewRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}

function QuickLink({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15"
    >
      {text}
      <ArrowRight className="h-4 w-4 text-white/50" />
    </Link>
  );
}

function AdminDashboardSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="h-[500px] animate-pulse rounded-2xl bg-white" />

          <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
