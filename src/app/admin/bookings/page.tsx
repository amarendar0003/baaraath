"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Search,
  Store,
  UserRound,
} from "lucide-react";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Booking = {
  id: string;
  bookingDate: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;

  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };

  service: {
    id: string;
    title: string;
    price: string;
    durationMinutes: number;
  };

  vendor: {
    id: string;
    name: string;
    city: string;
  };

  category: {
    id: string;
    name: string;
  };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlStatus = params.get("status");

    if (
      urlStatus &&
      ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(
        urlStatus,
      )
    ) {
      setStatus(urlStatus);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBookings();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, status]);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/admin/bookings?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

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
          result.message || "Unable to load bookings.",
        );
      }

      setBookings(result.bookings || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bookings.",
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
              Bookings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review customer bookings across all providers.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3">
            <p className="text-xs text-slate-500">
              Matching bookings
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
              {bookings.length}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking, customer, service or provider..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center">
              <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />

              <h2 className="mt-4 font-semibold text-slate-900">
                No bookings found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function BookingCard({
  booking,
}: {
  booking: Booking;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <CalendarDays className="h-5 w-5 text-slate-600" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-slate-950">
                Booking #{booking.id}
              </h2>

              <StatusBadge status={booking.status} />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Created {formatDateTime(booking.createdAt)}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Booking date
          </p>

          <p className="mt-1 font-semibold text-slate-950">
            {formatDate(booking.bookingDate)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_1fr_1fr]">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Customer
          </p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <UserRound className="h-4 w-4 text-slate-400" />
              {booking.customer.fullName}
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="truncate">
                {booking.customer.email}
              </span>
            </div>

            {booking.customer.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                {booking.customer.phone}
              </div>
            )}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Service
          </p>

          <div className="mt-3">
            <p className="font-semibold text-slate-900">
              {booking.service.title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {booking.category.name}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                ₹{formatPrice(booking.service.price)}
              </span>

              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDuration(booking.service.durationMinutes)}
              </span>
            </div>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Provider
          </p>

          <div className="mt-3">
            <div className="flex items-start gap-2">
              <Store className="mt-0.5 h-4 w-4 text-slate-400" />

              <div>
                <p className="font-semibold text-slate-900">
                  {booking.vendor.name}
                </p>

                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {booking.vendor.city}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {booking.notes && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Notes
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {booking.notes}
          </p>
        </div>
      )}
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const styles: Record<BookingStatus, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    COMPLETED: "border-blue-200 bg-blue-50 text-blue-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatPrice(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining
    ? `${hours}h ${remaining}m`
    : `${hours}h`;
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

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
