"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Booking = {
  id: string;
  customerId: string;
  serviceId: string;
  bookingDate: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;

  Service: {
    id: string;
    title: string;
    description: string | null;
    price: string;
    durationMinutes: number;
    active: boolean;
    Category: {
      id: string;
      name: string;
      slug: string;
    };
    Vendor: {
      id: string;
      name: string;
      city: string;
      address: string | null;
    };
  };
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

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClasses(status: BookingStatus) {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "CONFIRMED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "COMPLETED":
      return "border-green-200 bg-green-50 text-green-700";

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function StatusIcon({ status }: { status: BookingStatus }) {
  if (status === "COMPLETED") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "CANCELLED") {
    return <XCircle className="h-4 w-4" />;
  }

  if (status === "CONFIRMED") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  return <Clock3 className="h-4 w-4" />;
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] = useState<string | null>(
    null
  );

  const [filter, setFilter] = useState<
    "ALL" | BookingStatus
  >("ALL");

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customer/bookings", {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to load bookings."
        );
      }

      const list = Array.isArray(data)
        ? data
        : data.bookings || [];

      setBookings(list);
    } catch (err) {
      console.error(err);

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
    loadBookings();
  }, []);

  async function cancelBooking(booking: Booking) {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${booking.id}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(booking.id);
      setError("");

      const response = await fetch(
        `/api/customer/bookings/${encodeURIComponent(
          booking.id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CANCELLED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to cancel booking."
        );
      }

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                status: "CANCELLED",
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  }

  const filteredBookings =
    filter === "ALL"
      ? bookings
      : bookings.filter(
          (booking) => booking.status === filter
        );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="h-4 w-96 max-w-full rounded bg-slate-200" />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-56 rounded-2xl bg-white" />
              <div className="h-56 rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-amber-600">
              Customer
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              My Bookings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and manage all your service bookings.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Browse Services
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mt-7 flex flex-wrap gap-2">
          {(
            [
              ["ALL", "All"],
              ["PENDING", "Pending"],
              ["CONFIRMED", "Confirmed"],
              ["COMPLETED", "Completed"],
              ["CANCELLED", "Cancelled"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                filter === value
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Empty */}
        {filteredBookings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No bookings found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {filter === "ALL"
                ? "You have not made any bookings yet."
                : `You do not have any ${filter.toLowerCase()} bookings.`}
            </p>

            <Link
              href="/services"
              className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Find a Service
            </Link>
          </div>
        )}

        {/* Booking Cards */}
        <div className="mt-8 grid gap-5">
          {filteredBookings.map((booking) => {
            const canCancel =
              booking.status === "PENDING" ||
              booking.status === "CONFIRMED";

            const isCancelling =
              cancellingId === booking.id;

            return (
              <article
                key={booking.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-5 sm:p-6">

                  {/* Top */}
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-950">
                          {booking.Service?.title ||
                            "Service"}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                            booking.status
                          )}`}
                        >
                          <StatusIcon
                            status={booking.status}
                          />

                          {booking.status}
                        </span>
                      </div>

                      <p className="mt-2 break-all text-xs text-slate-400">
                        Booking Reference: {booking.id}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-400">
                        Service Price
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-950">
                        ₹{booking.Service?.price || "0"}
                      </p>
                    </div>

                  </div>

                  {/* Details */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Event Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDate(
                          booking.bookingDate
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Provider
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {booking.Service?.Vendor?.name ||
                          "Provider"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {booking.Service?.Category?.name ||
                          "Service"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        City
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
                        <MapPin className="h-3.5 w-3.5 text-amber-500" />
                        {booking.Service?.Vendor?.city ||
                          "Not available"}
                      </p>
                    </div>

                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mt-5 rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Notes
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Created */}
                  <p className="mt-5 text-xs text-slate-400">
                    Booking created:{" "}
                    {formatDateTime(
                      booking.createdAt
                    )}
                  </p>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() =>
                          cancelBooking(booking)
                        }
                        disabled={isCancelling}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Cancel Booking
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-50 px-5 text-sm font-medium text-slate-400">
                        {booking.status === "COMPLETED"
                          ? "Booking Completed"
                          : "Booking Cancelled"}
                      </span>
                    )}

                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </main>
  );
}
