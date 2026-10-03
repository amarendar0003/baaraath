"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
} from "lucide-react";

type Booking = {
  id: string;
  reference: string;
  bookingDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  service: {
    id: string;
    title: string;
    price: string;
    durationMinutes: number;
    category: string;
  };
};

const filters = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function statusClass(status: Booking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-50 text-blue-700";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings(selectedStatus = status) {
    try {
      setLoading(true);
      setError("");

      const url = selectedStatus
        ? `/api/vendor/bookings?status=${selectedStatus}`
        : "/api/vendor/bookings";

      const response = await fetch(url, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load bookings."
        );
      }

      setBookings(data.bookings || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings(status);
  }, [status]);

  const filteredBookings = bookings.filter((booking) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      booking.reference.toLowerCase().includes(query) ||
      booking.customer.name.toLowerCase().includes(query) ||
      booking.customer.email.toLowerCase().includes(query) ||
      booking.service.title.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Bookings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View booking requests for your services.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatus(filter.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    status === filter.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking, customer or service..."
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading bookings...
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No bookings found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search."
                : "Bookings for your services will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  {/* Main */}
                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {booking.reference}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <h2 className="mt-2 text-lg font-bold text-slate-950">
                      {booking.service.title}
                    </h2>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {booking.service.category}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                      <div className="flex items-start gap-2">
                        <UserRound className="mt-0.5 h-4 w-4 text-slate-400" />

                        <div>
                          <p className="text-xs text-slate-400">
                            Customer
                          </p>

                          <p className="text-sm font-semibold text-slate-700">
                            {booking.customer.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />

                        <div>
                          <p className="text-xs text-slate-400">
                            Booking date
                          </p>

                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />

                        <div>
                          <p className="text-xs text-slate-400">
                            Time
                          </p>

                          <p className="text-sm font-semibold text-slate-700">
                            {formatTime(booking.bookingDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />

                        <div>
                          <p className="text-xs text-slate-400">
                            Service
                          </p>

                          <p className="text-sm font-semibold text-slate-700">
                            ₹{Number(
                              booking.service.price
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Booking notes
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Customer contact */}
                  <div className="w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:w-64">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Customer contact
                    </p>

                    <div className="mt-3 space-y-2">
                      <a
                        href={`mailto:${booking.customer.email}`}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="truncate">
                          {booking.customer.email}
                        </span>
                      </a>

                      {booking.customer.phone && (
                        <a
                          href={`tel:${booking.customer.phone}`}
                          className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                        >
                          <Phone className="h-4 w-4" />
                          {booking.customer.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
