import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

function formatPrice(price: unknown) {
  const value = Number(price);

  if (Number.isNaN(value)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCategoryEmoji(slug: string) {
  switch (slug) {
    case "banquet_hall":
      return "🏛️";

    case "music_band":
      return "🎵";

    case "event_management":
      return "🎪";

    case "catering":
      return "🍽️";

    case "dancing":
      return "💃";

    case "priests":
      return "🪔";

    case "hotels":
      return "🏨";

    default:
      return "✨";
  }
}

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: {
      id,
    },
    include: {
      Vendor: true,
      Category: true,
    },
  });

  if (!service || !service.active) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
            🔍
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Service not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            The service you are looking for may have been removed,
            disabled or the link may be incorrect.
          </p>

          <Link
            href="/services"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
        </div>
      </main>
    );
  }

  const price = formatPrice(service.price);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* BREADCRUMB */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
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

            <span className="font-medium text-slate-800">
              {service.title}
            </span>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}
          <div>
            {/* IMAGE / HERO */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex min-h-[360px] items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-slate-100 sm:min-h-[470px]">
                <div className="text-center">
                  <div className="text-8xl">
                    {getCategoryEmoji(service.Category.slug)}
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-400">
                    Service image gallery
                  </p>
                </div>
              </div>

              {/* CATEGORY */}
              <div className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg">
                {service.Category.name}
              </div>

              {/* SAVE */}
              <button
                type="button"
                className="absolute right-5 top-5 rounded-full bg-white/95 p-3 text-slate-600 shadow-lg transition hover:text-red-500"
                aria-label="Save service"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* TITLE */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {service.title}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      {service.Vendor.city}
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-700">
                        New
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-amber-50 px-5 py-3">
                  <p className="text-xs text-amber-700">
                    Starting from
                  </p>

                  <p className="text-2xl font-bold text-slate-900">
                    {price}
                  </p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold">
                About this service
              </h2>

              {service.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {service.description}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  The service provider has not added a detailed
                  description yet.
                </p>
              )}
            </div>

            {/* SERVICE INFORMATION */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold">
                Service information
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={<Clock3 className="h-5 w-5" />}
                  title="Duration"
                  value={`${service.durationMinutes} minutes`}
                />

                <InfoCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  title="Booking"
                  value="Online booking available"
                />

                <InfoCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Status"
                  value="Currently available"
                />

                <InfoCard
                  icon={<Users className="h-5 w-5" />}
                  title="Category"
                  value={service.Category.name}
                />
              </div>
            </div>

            {/* LOCATION */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    Location
                  </h2>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {service.Vendor.city}
                      </p>

                      {service.Vendor.address ? (
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {service.Vendor.address}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-slate-400">
                          Address not provided
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MAP PLACEHOLDER */}
              <div className="mt-6 flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <div className="text-center">
                  <MapPin className="mx-auto h-10 w-10 text-amber-500" />

                  <p className="mt-3 font-semibold text-slate-700">
                    Map location
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PostGIS coordinates and interactive map will be
                    connected in the location stage.
                  </p>
                </div>
              </div>
            </div>

            {/* PROVIDER */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold">
                Service provider
              </h2>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
                    {service.Vendor.name
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">
                      {service.Vendor.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {service.Vendor.city}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Registered service provider
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                  >
                    <Phone className="h-4 w-4" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT BOOKING PANEL */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
              {/* PRICE */}
              <div className="border-b border-slate-200 p-6">
                <p className="text-sm text-slate-500">
                  Starting price
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-bold">
                    {price}
                  </span>

                  <span className="pb-1 text-sm text-slate-400">
                    / service
                  </span>
                </div>
              </div>

              {/* BOOKING FORM PREVIEW */}
              <div className="p-6">
                <h2 className="text-lg font-bold">
                  Book this service
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose your event date and continue to booking.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="event-date"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Event date
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                      <CalendarDays className="h-5 w-5 text-slate-400" />

                      <input
                        id="event-date"
                        type="date"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="guests"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Number of guests
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                      <Users className="h-5 w-5 text-slate-400" />

                      <input
                        id="guests"
                        type="number"
                        min="1"
                        placeholder="Enter number of guests"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href={`/services/${service.id}/book`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 font-semibold text-white transition hover:bg-amber-600"
                >
                  <CalendarDays className="h-5 w-5" />
                  Continue to Booking
                </Link>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  You will be able to enter your customer details and
                  booking requirements on the next page.
                </p>
              </div>

              {/* SAFETY */}
              <div className="border-t border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />

                  <div>
                    <p className="text-sm font-semibold">
                      Safe booking
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your booking details are securely handled by
                      Baaraath.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK */}
            <Link
              href="/services"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="rounded-xl bg-white p-3 text-amber-600 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}