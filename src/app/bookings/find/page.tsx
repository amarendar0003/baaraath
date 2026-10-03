"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type BookingResult = {
  id: string;
  status: string;
  bookingDate: string;
  notes: string | null;
  createdAt: string;
  service: {
    id: string;
    title: string;
    price: string;
    vendor: {
      name: string;
      city: string;
      address: string | null;
    };
    category: {
      name: string;
    };
  };
  customer: {
    fullName: string;
    email: string;
    phone: string | null;
  };
};

export default function FindBookingPage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");

  const [booking, setBooking] =
    useState<BookingResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setBooking(null);

    if (!reference.trim()) {
      setError("Please enter your booking reference.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter the email used during booking.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        reference: reference.trim(),
        email: email.trim(),
      });

      const response = await fetch(
        `/api/bookings/find?${params.toString()}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Booking not found.",
        );
      }

      setBooking(data.booking);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to find your booking.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* HEADER */}
      

      {/* CONTENT */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl">
          {/* TITLE */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Search className="h-7 w-7" />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Find your booking
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Enter your booking reference and the email address
              you used when making the booking.
            </p>
          </div>

          {/* SEARCH CARD */}
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <form
              onSubmit={handleSearch}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="reference"
                  className="mb-2 block text-sm font-semibold"
                >
                  Booking reference
                </label>

                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(event) =>
                    setReference(event.target.value)
                  }
                  placeholder="Example: AB-12345678"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  You can find this reference in your booking
                  confirmation.
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Find Booking
                  </>
                )}
              </button>
            </form>
          </div>

          {/* BOOKING RESULT */}
          {booking && (
            <BookingResult booking={booking} />
          )}

          {/* SECURITY */}
          <div className="mx-auto mt-8 flex max-w-2xl gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />

            <div>
              <p className="text-sm font-semibold">
                Your information is protected
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Booking details are shown only after verifying the
                booking reference and email address.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BookingResult({
  booking,
}: {
  booking: BookingResult;
}) {
  return (
    <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      {/* RESULT HEADER */}
      <div
        className={`p-6 sm:p-8 ${
          booking.status === "CONFIRMED"
            ? "bg-green-50"
            : booking.status === "CANCELLED"
              ? "bg-red-50"
              : "bg-amber-50"
        }`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Booking reference
            </p>

            <h2 className="mt-1 break-all text-2xl font-bold">
              {booking.id}
            </h2>
          </div>

          <BookingStatus status={booking.status} />
        </div>
      </div>

      {/* DETAILS */}
      <div className="p-6 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Service
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {booking.service.title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {booking.service.category.name}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DetailItem
                icon={
                  <CalendarDays className="h-5 w-5" />
                }
                label="Event date"
                value={formatDate(booking.bookingDate)}
              />

              <DetailItem
                icon={
                  <MapPin className="h-5 w-5" />
                }
                label="Location"
                value={booking.service.vendor.city}
              />

              <DetailItem
                icon={
                  <Clock3 className="h-5 w-5" />
                }
                label="Created"
                value={formatDate(booking.createdAt)}
              />

              <DetailItem
                icon={
                  <Mail className="h-5 w-5" />
                }
                label="Customer"
                value={booking.customer.email}
              />
            </div>

            {booking.notes && (
              <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Booking notes
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>

          {/* PROVIDER */}
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Service provider
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 font-bold text-white">
                {booking.service.vendor.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="font-bold">
                  {booking.service.vendor.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {booking.service.vendor.city}
                </p>
              </div>
            </div>

            {booking.service.vendor.address && (
              <div className="mt-5 flex gap-2 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                <span>
                  {booking.service.vendor.address}
                </span>
              </div>
            )}

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs text-slate-400">
                Booking status
              </p>

              <p className="mt-1 font-semibold">
                {formatStatus(booking.status)}
              </p>
            </div>
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="mt-8 border-t border-slate-200 pt-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Customer
          </p>

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-slate-400">
                Name:
              </span>{" "}
              <strong>{booking.customer.fullName}</strong>
            </div>

            <div>
              <span className="text-slate-400">
                Email:
              </span>{" "}
              <strong>{booking.customer.email}</strong>
            </div>

            {booking.customer.phone && (
              <div>
                <span className="text-slate-400">
                  Phone:
                </span>{" "}
                <strong>{booking.customer.phone}</strong>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-7 sm:flex-row">
          <Link
            href="/services"
            className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            Explore More Services
          </Link>

          <Link
            href="/"
            className="flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function BookingStatus({
  status,
}: {
  status: string;
}) {
  if (status === "CONFIRMED") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        Confirmed
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
        <XCircle className="h-4 w-4" />
        Cancelled
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
      <Clock3 className="h-4 w-4" />
      Pending
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="rounded-xl bg-white p-2 text-amber-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

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

function formatStatus(value: string) {
  switch (value) {
    case "CONFIRMED":
      return "Confirmed";

    case "CANCELLED":
      return "Cancelled";

    case "COMPLETED":
      return "Completed";

    default:
      return "Pending";
  }
}

