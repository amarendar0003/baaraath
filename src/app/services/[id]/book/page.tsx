"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

type ServiceData = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  vendor: {
    name: string;
    city: string;
    address: string | null;
  };
  category: {
    name: string;
  };
};

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [serviceId, setServiceId] = useState("");

  const [service, setService] = useState<ServiceData | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [bookingId, setBookingId] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    guests: "",
    notes: "",
    terms: false,
  });

  useEffect(() => {
    async function loadService() {
      try {
        const resolvedParams = await params;

        setServiceId(resolvedParams.id);

        const response = await fetch(
          `/api/services/${resolvedParams.id}`,
        );

        if (!response.ok) {
          throw new Error("Service not found");
        }

        const data = await response.json();

        setService(data.service || data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this service.");
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [params]);

  function updateField(
    field: keyof typeof form,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!form.eventDate) {
      setError("Please select your event date.");
      return;
    }

    if (!form.guests || Number(form.guests) < 1) {
      setError("Please enter the number of guests.");
      return;
    }

    if (!form.terms) {
      setError(
        "Please accept the terms and conditions before booking.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
          customerPhone: form.phone.trim(),
          bookingDate: form.eventDate,
          notes: [
            `Guests: ${form.guests}`,
            form.notes.trim()
              ? `Special Requests: ${form.notes.trim()}`
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to create booking.",
        );
      }

      setBookingId(
        data.booking?.id ||
          data.id ||
          data.bookingId ||
          "",
      );

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create booking.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          Loading service...
        </div>
      </main>
    );
  }

  if (error && !service) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Unable to load service
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {error}
          </p>

          <Link
            href="/services"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
        </div>
      </main>
    );
  }

  if (!service) {
    return null;
  }

  if (success) {
    return (
      <BookingSuccess
        service={service}
        bookingId={bookingId}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* HEADER */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="hover:text-amber-600"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href="/services"
              className="hover:text-amber-600"
            >
              Services
            </Link>

            <span>/</span>

            <span className="text-slate-800">
              Booking
            </span>
          </div>
        </div>
      </section>

      {/* TITLE */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href={`/services/${service.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to service
          </Link>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Book this service
          </h1>

          <p className="mt-2 text-slate-500">
            Enter your event details and contact information.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_370px]">
          {/* FORM */}
          <div>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* CUSTOMER DETAILS */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <User className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      Customer details
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Enter the details we can use to contact you.
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Full name
                      <span className="text-red-500"> *</span>
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Email address
                      <span className="text-red-500"> *</span>
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField(
                          "email",
                          event.target.value,
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Mobile number
                      <span className="text-red-500"> *</span>
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        updateField(
                          "phone",
                          event.target.value,
                        )
                      }
                      placeholder="+91 XXXXX XXXXX"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                </div>
              </div>

              {/* EVENT DETAILS */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      Event details
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Tell us about your event.
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="eventDate"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Event date
                      <span className="text-red-500"> *</span>
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id="eventDate"
                        type="date"
                        value={form.eventDate}
                        min={new Date()
                          .toISOString()
                          .split("T")[0]}
                        onChange={(event) =>
                          updateField(
                            "eventDate",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="guests"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Number of guests
                      <span className="text-red-500"> *</span>
                    </label>

                    <div className="relative">
                      <Users className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id="guests"
                        type="number"
                        min="1"
                        value={form.guests}
                        onChange={(event) =>
                          updateField(
                            "guests",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. 150"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Special requests
                  </label>

                  <textarea
                    id="notes"
                    value={form.notes}
                    onChange={(event) =>
                      updateField(
                        "notes",
                        event.target.value,
                      )
                    }
                    rows={5}
                    placeholder="Tell the provider about your requirements, decoration, food preferences, timing or other special requests..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>

              {/* TERMS */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(event) =>
                      updateField(
                        "terms",
                        event.target.checked,
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 accent-amber-500"
                  />

                  <span className="text-sm leading-6 text-slate-600">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-semibold text-amber-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and understand that this booking request will be
                    sent to the service provider.
                  </span>
                </label>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <strong>Booking error:</strong>{" "}
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating booking...
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-5 w-5" />
                    Submit Booking Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* SUMMARY */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* SERVICE */}
              <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-slate-100 p-8 text-center">
                <div className="text-6xl">🎉</div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-700">
                  {service.category.name}
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {service.title}
                </h2>
              </div>

              <div className="p-6">
                <h3 className="font-bold">
                  Booking summary
                </h3>

                <div className="mt-5 space-y-4">
                  <SummaryRow
                    icon={
                      <MapPin className="h-4 w-4" />
                    }
                    label="Location"
                    value={service.vendor.city}
                  />

                  <SummaryRow
                    icon={
                      <Clock3 className="h-4 w-4" />
                    }
                    label="Duration"
                    value={`${service.durationMinutes} minutes`}
                  />

                  <SummaryRow
                    icon={
                      <CalendarDays className="h-4 w-4" />
                    }
                    label="Event date"
                    value={
                      form.eventDate
                        ? formatDate(form.eventDate)
                        : "Not selected"
                    }
                  />

                  <SummaryRow
                    icon={
                      <Users className="h-4 w-4" />
                    }
                    label="Guests"
                    value={
                      form.guests ||
                      "Not specified"
                    }
                  />
                </div>

                <div className="my-6 border-t border-slate-200" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      Starting price
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      ₹
                      {Number(service.price).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECURITY */}
              <div className="border-t border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />

                  <div>
                    <p className="text-sm font-semibold">
                      Secure booking
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your contact and booking information is handled
                      securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  if (!date) {
    return "";
  }

  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function BookingSuccess({
  service,
  bookingId,
}: {
  service: ServiceData;
  bookingId: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-16">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-green-600 px-6 py-12 text-center text-white">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Booking request submitted!
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-green-50">
            Your booking request for{" "}
            <strong>{service.title}</strong> has been submitted
            successfully.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {bookingId && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Booking Reference
              </p>

              <p className="mt-2 break-all text-xl font-bold text-slate-900">
                {bookingId}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h2 className="font-bold">
              {service.title}
            </h2>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-amber-500" />
              {service.vendor.city}
            </div>
          </div>

          <p className="mt-6 text-center text-sm leading-6 text-slate-500">
            Please keep your booking reference for future communication.
            The service provider can process your request according to
            their availability.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href="/services"
              className="flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              Explore More Services
            </Link>

            <Link
              href="/bookings/find"
              className="flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Find My Booking
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}