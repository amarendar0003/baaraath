"use client";

import Link from "next/link";
import { appPath } from "@/lib/app-path";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Store,
  UserRound,
  X,
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

  customer?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
  } | null;

  service?: {
    id: string;
    title: string;
    description: string | null;
    price: string;
    durationMinutes: number;
    active: boolean;

    vendor?: {
      id: string;
      name: string;
      city: string;
      address: string | null;
    } | null;

    category?: {
      id: string;
      name: string;
    } | null;
  } | null;
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

function formatPrice(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return `₹${value}`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
}

function statusLabel(status: BookingStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    COMPLETED: "border-blue-200 bg-blue-50 text-blue-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status === "PENDING" && <Clock3 className="h-3.5 w-3.5" />}
      {status === "CONFIRMED" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === "COMPLETED" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === "CANCELLED" && <XCircle className="h-3.5 w-3.5" />}
      {statusLabel(status)}
    </span>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [actionId, setActionId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] =
    useState<BookingStatus | null>(null);

  const [notice, setNotice] = useState("");

  async function loadBookings(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
        }
      );

      if (response.status === 401) {
        window.location.href = appPath("/login");
        return;
      }

      if (response.status === 403) {
        window.location.href = appPath("/dashboard");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to load bookings."
        );
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      console.error("Admin bookings load error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bookings."
      );
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadBookings();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, status]);

  async function openDetails(id: string) {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await fetch(appPath(`/api/admin/bookings/${id}`), {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = appPath("/login");
        return;
      }

      if (response.status === 403) {
        window.location.href = appPath("/dashboard");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load booking details."
        );
      }

      setSelectedBooking(data.booking);
    } catch (err) {
      console.error("Booking details error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load booking details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  async function updateBookingStatus(
    booking: Booking,
    nextStatus: BookingStatus
  ) {
    const messages: Record<BookingStatus, string> = {
      PENDING: "move this booking back to Pending",
      CONFIRMED: "confirm this booking",
      COMPLETED: "mark this booking as Completed",
      CANCELLED: "cancel this booking",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${messages[nextStatus]}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(booking.id);
      setActionStatus(nextStatus);
      setError("");
      setNotice("");

      const response = await fetch(
        `/api/admin/bookings/${booking.id}`,
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

      if (response.status === 401) {
        window.location.href = appPath("/login");
        return;
      }

      if (response.status === 403) {
        window.location.href = appPath("/dashboard");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update booking."
        );
      }

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      if (selectedBooking?.id === booking.id) {
        setSelectedBooking(data.booking);
      }

      setNotice(
        `Booking ${booking.id} updated to ${statusLabel(nextStatus)}.`
      );

      window.setTimeout(() => {
        setNotice("");
      }, 3500);
    } catch (err) {
      console.error("Booking status update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setActionId(null);
      setActionStatus(null);
    }
  }

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((item) => item.status === "PENDING").length,
      confirmed: bookings.filter(
        (item) => item.status === "CONFIRMED"
      ).length,
      completed: bookings.filter(
        (item) => item.status === "COMPLETED"
      ).length,
      cancelled: bookings.filter(
        (item) => item.status === "CANCELLED"
      ).length,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/admin/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Bookings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review and manage customer bookings across all providers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadBookings(true)}
            disabled={refreshing || loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {notice && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Total"
            value={summary.total}
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <SummaryCard
            label="Pending"
            value={summary.pending}
            icon={<Clock3 className="h-5 w-5" />}
            valueClass="text-amber-600"
          />

          <SummaryCard
            label="Confirmed"
            value={summary.confirmed}
            icon={<CheckCircle2 className="h-5 w-5" />}
            valueClass="text-emerald-600"
          />

          <SummaryCard
            label="Completed"
            value={summary.completed}
            icon={<CheckCircle2 className="h-5 w-5" />}
            valueClass="text-blue-600"
          />

          <SummaryCard
            label="Cancelled"
            value={summary.cancelled}
            icon={<XCircle className="h-5 w-5" />}
            valueClass="text-red-600"
          />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking, customer, service or provider..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">
              Booking Directory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {loading
                ? "Loading bookings..."
                : `${bookings.length} booking${
                    bookings.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading bookings...
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4">
                <CalendarDays className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-900">
                No bookings found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  actionId={actionId}
                  actionStatus={actionStatus}
                  onView={() => openDetails(booking.id)}
                  onStatusChange={(nextStatus) =>
                    updateBookingStatus(booking, nextStatus)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {detailsLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-6 py-5 shadow-xl">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              Loading booking details...
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          actionId={actionId}
          actionStatus={actionStatus}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={(nextStatus) =>
            updateBookingStatus(selectedBooking, nextStatus)
          }
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  valueClass = "text-slate-950",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <div className="rounded-xl bg-slate-50 p-2 text-slate-500">
          {icon}
        </div>
      </div>

      <p className={`mt-3 text-2xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function BookingRow({
  booking,
  actionId,
  actionStatus,
  onView,
  onStatusChange,
}: {
  booking: Booking;
  actionId: string | null;
  actionStatus: BookingStatus | null;
  onView: () => void;
  onStatusChange: (status: BookingStatus) => void;
}) {
  const busy = actionId === booking.id;

  return (
    <div className="p-5 transition hover:bg-slate-50/70">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-slate-950">
              Booking #{booking.id}
            </h3>

            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={<UserRound className="h-4 w-4" />}
              label="Customer"
              value={booking.customer?.fullName || "Unknown customer"}
            />

            <InfoItem
              icon={<Store className="h-4 w-4" />}
              label="Service"
              value={booking.service?.title || "Unknown service"}
            />

            <InfoItem
              icon={<MapPin className="h-4 w-4" />}
              label="Provider"
              value={booking.service?.vendor?.name || "Unknown provider"}
            />

            <InfoItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="Booking Date"
              value={formatDateTime(booking.bookingDate)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:w-[330px] xl:justify-end">
          <button
            type="button"
            onClick={onView}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Eye className="h-4 w-4" />
            View
          </button>

          {booking.status === "PENDING" && (
            <>
              <ActionButton
                label="Confirm"
                icon={<CheckCircle2 className="h-4 w-4" />}
                disabled={busy}
                loading={busy && actionStatus === "CONFIRMED"}
                onClick={() => onStatusChange("CONFIRMED")}
                className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              />

              <ActionButton
                label="Cancel"
                icon={<XCircle className="h-4 w-4" />}
                disabled={busy}
                loading={busy && actionStatus === "CANCELLED"}
                onClick={() => onStatusChange("CANCELLED")}
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              />
            </>
          )}

          {booking.status === "CONFIRMED" && (
            <>
              <ActionButton
                label="Complete"
                icon={<CheckCircle2 className="h-4 w-4" />}
                disabled={busy}
                loading={busy && actionStatus === "COMPLETED"}
                onClick={() => onStatusChange("COMPLETED")}
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              />

              <ActionButton
                label="Cancel"
                icon={<XCircle className="h-4 w-4" />}
                disabled={busy}
                loading={busy && actionStatus === "CANCELLED"}
                onClick={() => onStatusChange("CANCELLED")}
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 truncate text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  disabled,
  loading,
  onClick,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icon
      )}

      {loading ? "Saving..." : label}
    </button>
  );
}

function BookingDetailsModal({
  booking,
  actionId,
  actionStatus,
  onClose,
  onStatusChange,
}: {
  booking: Booking;
  actionId: string | null;
  actionStatus: BookingStatus | null;
  onClose: () => void;
  onStatusChange: (status: BookingStatus) => void;
}) {
  const busy = actionId === booking.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Booking Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              #{booking.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current Status
              </p>

              <div className="mt-2">
                <StatusBadge status={booking.status} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Booking Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDateTime(booking.bookingDate)}
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
              <UserRound className="h-5 w-5 text-indigo-600" />
              Customer Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Name"
                value={booking.customer?.fullName || "Not available"}
              />

              <DetailField
                label="Email"
                value={booking.customer?.email || "Not available"}
              />

              <DetailField
                label="Phone"
                value={booking.customer?.phone || "Not provided"}
              />

              <DetailField
                label="Role"
                value={booking.customer?.role || "CUSTOMER"}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
              <Store className="h-5 w-5 text-indigo-600" />
              Service Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Service"
                value={booking.service?.title || "Not available"}
              />

              <DetailField
                label="Category"
                value={
                  booking.service?.category?.name || "Not available"
                }
              />

              <DetailField
                label="Price"
                value={
                  booking.service?.price
                    ? formatPrice(booking.service.price)
                    : "Not available"
                }
              />

              <DetailField
                label="Duration"
                value={
                  booking.service?.durationMinutes
                    ? `${booking.service.durationMinutes} minutes`
                    : "Not available"
                }
              />

              <DetailField
                label="Provider"
                value={
                  booking.service?.vendor?.name || "Not available"
                }
              />

              <DetailField
                label="Location"
                value={
                  booking.service?.vendor
                    ? `${booking.service.vendor.city}${
                        booking.service.vendor.address
                          ? ` — ${booking.service.vendor.address}`
                          : ""
                      }`
                    : "Not available"
                }
              />
            </div>

            {booking.service?.description && (
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Service Description
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {booking.service.description}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 p-5">
            <h3 className="mb-3 font-semibold text-slate-950">
              Booking Notes
            </h3>

            <p className="text-sm leading-6 text-slate-600">
              {booking.notes || "No notes were added to this booking."}
            </p>

            <p className="mt-4 text-xs text-slate-400">
              Created: {formatDateTime(booking.createdAt)}
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
          {booking.status === "PENDING" && (
            <>
              <ActionButton
                label="Confirm Booking"
                icon={<CheckCircle2 className="h-4 w-4" />}
                disabled={busy}
                loading={busy && actionStatus === "CONFIRMED"}
                onClick={() => onStatusChange("CONFIRMED")}
                className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              />

              <ActionButton
                label="Cancel Booking"
                icon={<XCircle className="h-4 w-4" />}
                disabled={busy}
                loading={busy && actionStatus === "CANCELLED"}
                onClick={() => onStatusChange("CANCELLED")}
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              />
            </>
          )}

          {booking.status === "CONFIRMED" && (
            <>
              <ActionButton
                label="Complete Booking"
                icon={<CheckCircle2 className="h-4 w-4" />}
                disabled={busy}
                loading={busy && actionStatus === "COMPLETED"}
                onClick={() => onStatusChange("COMPLETED")}
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              />

              <ActionButton
                label="Cancel Booking"
                icon={<XCircle className="h-4 w-4" />}
                disabled={busy}
                loading={busy && actionStatus === "CANCELLED"}
                onClick={() => onStatusChange("CANCELLED")}
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              />
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}
