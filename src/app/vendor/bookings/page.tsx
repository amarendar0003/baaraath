"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Mail,
  Phone,
  UserRound,
  MapPin,
  Loader2,
} from "lucide-react";

type Booking = {
  id: string;
  reference: string;
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
  bookingDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  createdAt: string;
};

const tabs = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function statusClass(status: Booking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "COMPLETED":
      return "bg-green-50 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings(status = "") {
    setLoading(true);
    setError("");

    try {
      const query = status
        ? `?status=${encodeURIComponent(status)}`
        : "";

      const response = await fetch(`/api/vendor/bookings${query}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load bookings.");
      }

      setBookings(data.bookings || []);
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

  useEffect(() => {
    loadBookings(activeTab);
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/vendor/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ? Back to Vendor Dashboard
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Customer Bookings
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage booking requests received for your services.
              </p>
            </div>

            <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
              <span className="text-sm text-slate-500">
                Total bookings
              </span>
              <div className="text-2xl font-bold text-slate-900">
                {bookings.length}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.value
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-60 items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading bookings...
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No bookings found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Booking requests for your services will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <CalendarDays className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          {booking.service.title}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Booking reference: {booking.reference}
                      </p>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <div className="text-xs text-slate-400">
                      Service price
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                      ?{Number(booking.service.price).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex gap-3">
                    <UserRound className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400">
                        Customer
                      </div>
                      <div className="font-semibold text-slate-900">
                        {booking.customer.fullName}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400">
                        Booking date
                      </div>
                      <div className="font-semibold text-slate-900">
                        {new Date(
                          booking.bookingDate,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400">
                        Duration
                      </div>
                      <div className="font-semibold text-slate-900">
                        {booking.service.durationMinutes} minutes
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400">
                        Category
                      </div>
                      <div className="font-semibold text-slate-900">
                        {booking.service.category.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {booking.customer.email}
                    </span>

                    {booking.customer.phone && (
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {booking.customer.phone}
                      </span>
                    )}
                  </div>

                  {booking.notes && (
                    <div className="max-w-xl rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
                      <span className="font-semibold">Notes:</span>{" "}
                      {booking.notes}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
