"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  Crosshair,
  Filter,
  Heart,
  Hotel,
  LocateFixed,
  MapPin,
  Menu,
  Music,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Utensils,
  Users,
  X,
} from "lucide-react";

type LocationInfo = {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

const categories = [
  {
    name: "Banquet Halls",
    slug: "banquet_hall",
    icon: "🏛️",
    description: "Wedding halls & function venues",
  },
  {
    name: "Catering",
    slug: "catering",
    icon: "🍽️",
    description: "Food & catering services",
  },
  {
    name: "Music Bands",
    slug: "music_band",
    icon: "🎵",
    description: "Live music & entertainment",
  },
  {
    name: "Event Management",
    slug: "event_management",
    icon: "🎪",
    description: "Complete event planning",
  },
  {
    name: "Dancing",
    slug: "dancing",
    icon: "💃",
    description: "Dance & entertainment",
  },
  {
    name: "Priests",
    slug: "priests",
    icon: "🪔",
    description: "Traditional ceremonies",
  },
  {
    name: "Hotels",
    slug: "hotels",
    icon: "🏨",
    description: "Hotels & accommodation",
  },
];

const popularServices = [
  {
    id: "demo-1",
    title: "Premium Wedding Venue",
    category: "Banquet Hall",
    city: "Hyderabad",
    price: "₹75,000",
    rating: "4.9",
    reviews: "124",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "demo-2",
    title: "Royal Celebration Hall",
    category: "Banquet Hall",
    city: "Warangal",
    price: "₹55,000",
    rating: "4.8",
    reviews: "98",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "demo-3",
    title: "Premium Event Catering",
    category: "Catering",
    city: "Hyderabad",
    price: "₹850 / plate",
    rating: "4.7",
    reviews: "86",
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "demo-4",
    title: "Live Wedding Music Band",
    category: "Music Band",
    city: "Hyderabad",
    price: "₹25,000",
    rating: "4.9",
    reviews: "72",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=85",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Verified Providers",
    description:
      "Discover services from registered and verified service providers.",
  },
  {
    icon: SlidersHorizontal,
    title: "Compare Services",
    description:
      "Compare prices, ratings, locations and service details easily.",
  },
  {
    icon: CalendarDays,
    title: "Easy Booking",
    description:
      "Choose your date and submit your booking request in minutes.",
  },
  {
    icon: Users,
    title: "Everything in One Place",
    description:
      "Plan venues, catering, entertainment and more from one platform.",
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [searchText, setSearchText] = useState("");
  const [manualLocation, setManualLocation] = useState("");

  useEffect(() => {
    detectLocation();
  }, []);

  async function detectLocation() {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationLoading(false);
      setLocationError("Location detection is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );

          if (!response.ok) {
            throw new Error("Location lookup failed");
          }

          const data = await response.json();

          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            address.county ||
            "Current location";

          const state = address.state || "";

          const country = address.country || "";

          setLocation({
            city,
            state,
            country,
            latitude,
            longitude,
          });
        } catch {
          setLocation({
            city: "Current location",
            state: "",
            country: "",
            latitude,
            longitude,
          });
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setLocationError(
          "Location permission was not granted. Please enter your city manually.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (searchText.trim()) {
      params.set("q", searchText.trim());
    }

    const city =
      manualLocation.trim() ||
      location?.city ||
      "";

    if (city) {
      params.set("city", city);
    }

    window.location.href = `/services?${params.toString()}`;
  }

  function displayLocation() {
    if (locationLoading) {
      return "Detecting your location...";
    }

    if (manualLocation.trim()) {
      return manualLocation;
    }

    if (location) {
      if (location.state) {
        return `${location.city}, ${location.state}`;
      }

      return location.city;
    }

    return "Select your location";
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900">
      {/* HEADER - rendered globally from app/layout.tsx */}

      {/* HERO / SEARCH */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <Sparkles className="h-4 w-4" />
              Everything for your special occasion
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Find the right services
              <span className="block text-amber-500">
                for your special day
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Discover venues, catering, music, hotels, priests, event
              planners and other trusted event services near you.
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="mx-auto mt-9 max-w-5xl">
            <form
              onSubmit={handleSearch}
              className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60"
            >
              <div className="grid gap-2 lg:grid-cols-[1fr_1fr_auto]">
                {/* SEARCH */}
                <div className="flex min-h-[58px] items-center gap-3 rounded-xl border border-transparent px-4 transition focus-within:border-amber-300 focus-within:bg-amber-50/30">
                  <Search className="h-5 w-5 shrink-0 text-slate-400" />

                  <div className="min-w-0 flex-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      What are you looking for?
                    </label>

                    <input
                      type="text"
                      value={searchText}
                      onChange={(event) =>
                        setSearchText(event.target.value)
                      }
                      placeholder="Venue, catering, music..."
                      className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* LOCATION */}
                <div className="flex min-h-[58px] items-center gap-3 rounded-xl border border-transparent px-4 transition focus-within:border-amber-300 focus-within:bg-amber-50/30">
                  <MapPin className="h-5 w-5 shrink-0 text-amber-500" />

                  <div className="min-w-0 flex-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Location
                    </label>

                    <input
                      type="text"
                      value={manualLocation}
                      onChange={(event) =>
                        setManualLocation(event.target.value)
                      }
                      placeholder={displayLocation()}
                      className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={detectLocation}
                    className="shrink-0 rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                    title="Detect my location"
                  >
                    <LocateFixed className="h-5 w-5" />
                  </button>
                </div>

                {/* SEARCH BUTTON */}
                <button
                  type="submit"
                  className="min-h-[58px] rounded-xl bg-amber-500 px-8 font-semibold text-white transition hover:bg-amber-600"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Search className="h-5 w-5" />
                    Search
                  </span>
                </button>
              </div>
            </form>

            {/* LOCATION STATUS */}
            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              {locationLoading ? (
                <>
                  <Crosshair className="h-4 w-4 animate-pulse text-amber-500" />
                  <span className="text-slate-500">
                    Detecting your current location...
                  </span>
                </>
              ) : location ? (
                <>
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-slate-500">
                    Showing services near{" "}
                    <strong className="text-slate-800">
                      {location.city}
                    </strong>
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">
                    {locationError || "Choose a location to continue"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* POPULAR SEARCHES */}
          <div className="mx-auto mt-7 flex max-w-5xl flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Popular:
            </span>

            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.slug}
                href={`/services?category=${category.slug}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-[#fafafa] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Browse
              </p>

              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                Explore by category
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Find exactly what you need for your event.
              </p>
            </div>

            <Link
              href="/services"
              className="hidden items-center gap-1 text-sm font-semibold text-amber-600 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/services?category=${category.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-3xl transition group-hover:bg-amber-100">
                  {category.icon}
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-800">
                  {category.name}
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEARBY */}
      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                <LocateFixed className="h-4 w-4" />
                Near you
              </div>

              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                Services near {location?.city || "you"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Discover services available around your current location.
              </p>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Browse all
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FIND SERVICES CTA */}
      <section className="bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Plan everything in one place
              </div>

              <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                From the venue to the final celebration, Baaraath helps you
                find the services you need.
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-slate-300">
                Search by category, location, price and rating. Compare
                providers and book services according to your event
                requirements.
              </p>

              <div className="mt-7">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600"
                >
                  Explore Services
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-5xl">🎉</div>

              <h3 className="mt-5 text-2xl font-bold text-white">
                Your event. Your choice.
              </h3>

              <p className="mt-3 leading-7 text-slate-300">
                Discover local providers and choose services based on your
                requirements.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle />
                Easy discovery
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle />
                Location-based search
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle />
                Simple booking
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="about" className="scroll-mt-20 bg-[#fafafa] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Why Baaraath
            </p>

            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Everything made simpler
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-bold">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Users className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-3xl font-bold">
            Are you a service provider?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            List your venue, catering service, music band, hotel or other
            event service on Baaraath and reach customers looking for your
            services.
          </p>

          <div className="mt-7">
            <Link
              href="/vendor/register"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Become a Provider
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

function ServiceCard({
  service,
}: {
  service: (typeof popularServices)[number];
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {service.category}
        </div>

        <button
          type="button"
          className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-slate-500 shadow-sm hover:text-red-500"
          aria-label={`Save ${service.title}`}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 font-bold text-slate-900">
          {service.title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0" />
          {service.city}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
            <Star className="h-3.5 w-3.5 fill-current" />
            {service.rating}
          </div>

          <span className="text-xs text-slate-400">
            {service.reviews} reviews
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] text-slate-400">
              Starting from
            </p>

            <p className="font-bold text-slate-900">
              {service.price}
            </p>
          </div>

          <Link
            href={`/services/${service.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700"
          >
            View
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CheckCircle() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/15 text-green-400">
      ✓
    </span>
  );
}
