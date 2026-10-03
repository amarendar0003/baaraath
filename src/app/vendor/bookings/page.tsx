"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Phone,
  Search,
  UserRound,
  XCircle,
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
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const config = {
    PENDING: {
      text: "Pending",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },
    CONFIRMED: {
      text: "Confirmed",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },
    COMPLETED: {
      text: "Completed",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    CANCELLED: {
      text: "Cancelled",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {status === "PENDING" && <Clock3 size={13} />}
      {status === "CONFIRMED" && <CheckCircle2 size={13} />}
      {status === "COMPLETED" && <CheckCircle2 size={13} />}
      {status === "CANCELLED" && <XCircle size={13} />}

      {config.text}
    </span>
  );
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/vendor/bookings?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load bookings."
        );
      }

      setBookings(data.bookings ?? []);
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
    const timer = setTimeout(() => {
      loadBookings();
    }, 250);

    return () => clearTimeout(timer);
  }, [status, search]);

  async function updateBookingStatus(
    bookingId: string,
    nextStatus: BookingStatus
  ) {
    const action =
      nextStatus === "CONFIRMED"
        ? "confirm"
        : nextStatus === "CANCELLED"
          ? "cancel"
          : "complete";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this booking?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(bookingId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/vendor/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update booking."
        );
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: nextStatus,
              }
            : booking
        )
      );

      setSuccess(
        data.message || "Booking status updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Provider
          </p>

          <h2 className="text-2xl font-bold text-slate-900">
            Booking Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review and manage bookings for your services.
          </p>
        </div>

        <Link
          href="/vendor/dashboard"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search booking, customer or service..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading bookings...
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <CalendarDays
            size={32}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-3 font-semibold text-slate-900">
            No bookings found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {booking.service.title}
                    </h3>

                    <StatusBadge status={booking.status} />
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Booking ID:{" "}
                    <span className="font-mono">
                      {booking.id}
                    </span>
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Customer
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <UserRound size={14} />
                        {booking.customer.fullName}
                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">
                        {booking.customer.email}
                      </p>

                      {booking.customer.phone && (
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.customer.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Booking Date
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <CalendarDays size={14} />
                        {formatDate(booking.bookingDate)}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={13} />
                        {formatTime(booking.bookingDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Service
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {booking.service.category.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {booking.service.durationMinutes} minutes
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Price
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        ₹{booking.service.price}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Customer Notes
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {booking.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:w-48 xl:flex-col">
                  {booking.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          updateBookingStatus(
                            booking.id,
                            "CONFIRMED"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === booking.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Confirm
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          updateBookingStatus(
                            booking.id,
                            "CANCELLED"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </>
                  )}

                  {booking.status === "CONFIRMED" && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          updateBookingStatus(
                            booking.id,
                            "COMPLETED"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === booking.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Complete
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          updateBookingStatus(
                            booking.id,
                            "CANCELLED"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </>
                  )}

                  {booking.status === "COMPLETED" && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-xs font-semibold text-emerald-700">
                      Booking completed
                    </div>
                  )}

                  {booking.status === "CANCELLED" && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs font-semibold text-red-700">
                      Booking cancelled
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}