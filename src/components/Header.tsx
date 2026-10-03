"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LocateFixed,
  MapPin,
  Menu,
  Search,
  X,
} from "lucide-react";

const cities = [
  "Hyderabad",
  "Warangal",
  "Vijayawada",
  "Visakhapatnam",
  "Khammam",
  "Nalgonda",
  "Karimnagar",
  "Adilabad",
  "Bengaluru",
  "Chennai",
  "Mumbai",
  "Delhi",
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState("");

  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCity = params.get("city");

    if (urlCity) {
      setLocation(urlCity);
      localStorage.setItem("baaraath_location", urlCity);
      return;
    }

    const savedCity = localStorage.getItem("baaraath_location");

    if (savedCity) {
      setLocation(savedCity);
      return;
    }

    detectLocation();
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  function detectLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Unable to detect location.");
          }

          const data = await response.json();

          const address = data.address || {};

          const detectedCity =
            address.city ||
            address.town ||
            address.municipality ||
            address.city_district ||
            address.county;

          if (!detectedCity) {
            throw new Error("Could not determine your city.");
          }

          setLocation(detectedCity);
          localStorage.setItem("baaraath_location", detectedCity);

          const url = new URL(window.location.href);
          url.searchParams.set("city", detectedCity);

          window.history.replaceState({}, "", url.toString());

          window.dispatchEvent(new Event("baaraath-location-changed"));
        } catch (error) {
          console.error(error);
          setLocationError("Unable to determine your city.");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        setDetecting(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. You can choose a city manually.",
          );
        } else {
          setLocationError(
            "Unable to detect your location. Please choose a city manually.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  }

  function selectCity(city: string) {
    setLocation(city);
    setLocationOpen(false);
    setLocationError("");

    localStorage.setItem("baaraath_location", city);

    const url = new URL(window.location.href);

    url.searchParams.set("city", city);

    window.location.href = url.toString();
  }

  function handleLocationClick() {
    setLocationOpen((current) => !current);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-lg font-black text-white">
            B
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-bold leading-none text-slate-900">
              Baaraath
            </div>

            <div className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-slate-400">
              CELEBRATE EVERYTHING
            </div>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-7 lg:flex">

          <Link
            href="/services"
            className="text-sm font-medium text-slate-600 transition hover:text-amber-600"
          >
            Explore Services
          </Link>

          <div ref={locationRef} className="relative">
            <button
              type="button"
              onClick={handleLocationClick}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-amber-600"
            >
              <MapPin className="h-4 w-4" />

              <span>
                {detecting
                  ? "Detecting..."
                  : location || "Set Location"}
              </span>

              <ChevronDown className="h-4 w-4" />
            </button>

            {locationOpen && (
              <div className="absolute right-0 top-10 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Your location
                      </p>

                      <p className="text-xs text-slate-500">
                        {location
                          ? `Showing services near ${location}`
                          : "Choose where you want to search"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AUTO DETECT */}
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detecting}
                  className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-amber-50 disabled:opacity-60"
                >
                  <LocateFixed className="h-5 w-5 text-amber-500" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {detecting
                        ? "Detecting your location..."
                        : "Use my current location"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Automatically detect using GPS
                    </p>
                  </div>
                </button>

                {locationError && (
                  <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                    {locationError}
                  </div>
                )}

                {/* MANUAL CITIES */}
                <div className="p-3">
                  <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Choose city manually
                  </p>

                  <div className="max-h-64 overflow-y-auto">
                    {cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => selectCity(city)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          location.toLowerCase() === city.toLowerCase()
                            ? "bg-amber-50 font-semibold text-amber-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        {city}

                        {location.toLowerCase() === city.toLowerCase() && (
                          <span className="ml-auto text-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          <Link
            href="/vendor/register"
            className="text-sm font-medium text-slate-600 transition hover:text-amber-600"
          >
            Become a Provider
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="hidden items-center gap-4 md:flex">

          <button
            type="button"
            aria-label="Notifications"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="h-5 w-5" />
          </button>

          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-amber-600"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Register
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label="Open menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">

          <div className="space-y-1">

            <Link
              href="/services"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Search className="h-5 w-5" />
              Explore Services
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setLocationOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <MapPin className="h-5 w-5" />
              {location || "Set Location"}
            </button>

            <Link
              href="/vendor/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Become a Provider
            </Link>

            <div className="my-2 border-t border-slate-100" />

            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Register
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}
