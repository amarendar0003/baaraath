"use client";

import Link from "next/link";
import { appPath } from "@/lib/app-path";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  User,
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

  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
  } | null;

  service: {
    id: string;
    title: string;
    description: string | null;
    price: string;
    durationMinutes: number;
    active: boolean;

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

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
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

function statusClass(status: BookingStatus) {
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
  status: BookingStatus;
}) {
  if (status === "CONFIRMED") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "COMPLETED") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "CANCELLED") {
    return <XCircle className="h-4 w-4" />;
  }

  return <Clock3 className="h-4 w-4" />;
}

export default function AdminBookingDetailPage({
  params,
}: PageProps) {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<Booking | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadBooking(
    id: string,
    refresh = false
  ) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      const response = await fetch(
        appPath(`/api/admin/bookings/${encodeURIComponent(id)}`),
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Server returned ${response.status} instead of JSON.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to load booking."
        );
      }

      setBooking(data.booking);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load booking."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    params.then((resolvedParams) => {
      if (!active) {
        return;
      }

      setBookingId(resolvedParams.id);
      loadBooking(resolvedParams.id);
    });

    return () => {
      active = false;
    };
  }, [params]);

  async function updateStatus(
    nextStatus: BookingStatus
  ) {
    if (!booking) {
      return;
    }

    const confirmed = window.confirm(
      `Change booking status from ${booking.status} to ${nextStatus}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        appPath(`/api/admin/bookings/${encodeURIComponent(
          booking.id
        )}`),
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
          data.message ||
            data.error ||
            "Unable to update booking."
        );
      }

      setBooking(data.booking);
      setSuccess(
        data.message ||
          "Booking status updated successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="mt-5 h-10 w-80 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <XCircle className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-950">
            Booking could not be loaded
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "The requested booking was not found."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (bookingId) {
                  loadBooking(bookingId, true);
                }
              }}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <Link
              href="/admin/bookings"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const customer = booking.customer;
  const service = booking.service;
  const vendor = service?.vendor;
  const category = service?.category;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-7">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Link>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                Booking Details
              </p>

              <h1 className="mt-1 break-all text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {booking.id}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Created {formatDateTime(booking.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusClass(
                  booking.status
                )}`}
              >
                <StatusIcon status={booking.status} />
                {booking.status}
              </span>

              <button
                type="button"
                onClick={() =>
                  loadBooking(booking.id, true)
                }
                disabled={refreshing || updating}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">

          <div className="space-y-6">

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Booking Information
                    </h2>

                    <p className="text-sm text-slate-500">
                      Event and booking details
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Booking ID
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                    {booking.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Booking Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDate(booking.bookingDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {booking.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDateTime(booking.createdAt)}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {booking.notes?.trim()
                      ? booking.notes
                      : "No notes were provided for this booking."}
                  </div>
                </div>

              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Service Information
                    </h2>

                    <p className="text-sm text-slate-500">
                      Service selected for this booking
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {service ? (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-950">
                          {service.title}
                        </h3>

                        {category && (
                          <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {category.name}
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl bg-slate-950 px-4 py-3 text-right text-white">
                        <p className="text-xs text-white/60">
                          Price
                        </p>

                        <p className="mt-1 text-lg font-bold">
                          ₹{service.price}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-slate-600">
                      {service.description ||
                        "No service description available."}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Duration
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {service.durationMinutes} minutes
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Service Status
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {service.active
                            ? "Active"
                            : "Inactive"}
                        </p>
                      </div>
                    </div>

                    {vendor && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Provider
                        </p>

                        <p className="mt-1 font-semibold text-slate-950">
                          {vendor.name}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {vendor.city}
                          {vendor.address
                            ? ` • ${vendor.address}`
                            : ""}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                    Service information is not available.
                  </div>
                )}
              </div>
            </section>

          </div>

          <div className="space-y-6">

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <User className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Customer
                    </h2>

                    <p className="text-sm text-slate-500">
                      Customer information
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">

                {customer ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Full Name
                      </p>

                      <p className="mt-1 font-semibold text-slate-950">
                        {customer.fullName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <a
                        href={`mailto:${customer.email}`}
                        className="mt-1 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        <Mail className="h-4 w-4" />
                        {customer.email}
                      </a>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      {customer.phone ? (
                        <a
                          href={`tel:${customer.phone}`}
                          className="mt-1 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-slate-500">
                          Not provided
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        User Role
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {customer.role}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Customer information is not available.
                  </p>
                )}

              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5">
                <h2 className="font-bold text-slate-950">
                  Booking Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the booking status.
                </p>
              </div>

              <div className="grid gap-3 p-5">

                <button
                  type="button"
                  disabled={
                    updating ||
                    booking.status === "CONFIRMED"
                  }
                  onClick={() =>
                    updateStatus("CONFIRMED")
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Confirm Booking
                </button>

                <button
                  type="button"
                  disabled={
                    updating ||
                    booking.status === "COMPLETED"
                  }
                  onClick={() =>
                    updateStatus("COMPLETED")
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Mark Completed
                </button>

                <button
                  type="button"
                  disabled={
                    updating ||
                    booking.status === "CANCELLED"
                  }
                  onClick={() =>
                    updateStatus("CANCELLED")
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Cancel Booking
                </button>

                <Link
                  href="/admin/bookings"
                  className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to All Bookings
                </Link>

              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
