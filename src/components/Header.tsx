"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LocateFixed,
  LogIn,
  LogOut,
  Loader2,
  MapPin,
  Menu,
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

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/#about" },
  { label: "Contact Us", href: "/#contact" },
  { label: "My Bookings", href: "/dashboard/bookings" },
];

type CurrentUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
};

function readSavedCity(raw: string | null) {
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && parsed.city) {
      return String(parsed.city);
    }

    if (typeof parsed === "string") {
      return parsed;
    }
  } catch {
    // Plain city value.
  }

  return raw;
}

export default function Header() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setUser(data.user ?? null);
        }
      } catch (error) {
        console.error("Unable to load current user:", error);

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCity = params.get("city");

    if (urlCity) {
      setLocation(urlCity);
      localStorage.setItem("baaraath_location", urlCity);
      return;
    }

    const savedCity = readSavedCity(
      localStorage.getItem("baaraath_location"),
    );

    if (savedCity) {
      setLocation(savedCity);
      return;
    }

    detectLocation();
  }, []);

  useEffect(() => {
    function handleLocationChanged() {
      const savedCity = readSavedCity(
        localStorage.getItem("baaraath_location"),
      );

      if (savedCity) {
        setLocation(savedCity);
      }
    }

    window.addEventListener(
      "baaraath-location-changed",
      handleLocationChanged,
    );

    return () => {
      window.removeEventListener(
        "baaraath-location-changed",
        handleLocationChanged,
      );
    };
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        locationRef.current &&
        !locationRef.current.contains(target)
      ) {
        setLocationOpen(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  async function detectLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this browser.",
      );
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
          localStorage.setItem(
            "baaraath_location",
            detectedCity,
          );

          const url = new URL(window.location.href);
          url.searchParams.set("city", detectedCity);

          window.history.replaceState(
            {},
            "",
            url.toString(),
          );

          window.dispatchEvent(
            new Event("baaraath-location-changed"),
          );
        } catch (error) {
          console.error(error);
          setLocationError(
            "Unable to determine your city.",
          );
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        setDetecting(false);

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
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

    localStorage.setItem(
      "baaraath_location",
      city,
    );

    const url = new URL(window.location.href);
    url.searchParams.set("city", city);

    window.location.href = url.toString();
  }

  function handleLocationClick() {
    setLocationOpen((current) => !current);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/login";
    }
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.includes("#")) return false;

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const hideHeader = [
    "/admin",
    "/vendor",
    "/login",
    "/register",
  ].some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  );

  if (hideHeader) {
    return null;
  }

  function getHref(href: string) {
    if (href === "/services" && location) {
      return `/services?city=${encodeURIComponent(location)}`;
    }

    return href;
  }

  function handleNavClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    setMobileOpen(false);

    if (
      href.startsWith("/#") &&
      pathname === "/"
    ) {
      const target = document.getElementById(
        href.slice(2),
      );

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${window.location.search}${href.slice(1)}`,
        );
      }

      return;
    }

    if (href === "/" && pathname === "/") {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      window.history.replaceState(
        {},
        "",
        window.location.pathname +
          window.location.search,
      );
    }
  }

  function getDashboardHref() {
    if (!user) return "/login";

    if (user.role === "ADMIN") {
      return "/admin/dashboard";
    }

    if (user.role === "PROVIDER") {
      return "/vendor/dashboard";
    }

    return "/dashboard";
  }

  function getInitials(name: string) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-slate-950/95 shadow-lg shadow-slate-950/20 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center px-4 sm:px-6 lg:px-8 2xl:px-12">

        {/* LOGO */}
        <div className="flex flex-1 items-center">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={(event) =>
              handleNavClick(event, "/")
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 text-lg font-black text-slate-950 shadow-md shadow-amber-500/30">
              B
            </div>

            <div className="hidden sm:block">
              <div className="text-lg font-bold leading-none tracking-wide text-white">
                Baaraath
              </div>

              <div className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-amber-400/80">
                CELEBRATE EVERYTHING
              </div>
            </div>
          </Link>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={getHref(link.href)}
              onClick={(event) =>
                handleNavClick(event, link.href)
              }
              className={`relative py-1 text-sm font-medium tracking-wide transition after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:rounded-full after:bg-amber-400 after:transition-all hover:text-amber-400 ${
                isActive(link.href)
                  ? "text-amber-400 after:w-full"
                  : "text-slate-300 after:w-0 hover:after:w-full"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">

          {/* LOCATION */}
          <div
            ref={locationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={handleLocationClick}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-400/40 hover:bg-white/10 hover:text-amber-400"
            >
              <MapPin className="h-4 w-4 shrink-0 text-amber-400" />

              <span className="max-w-[90px] truncate sm:max-w-[140px]">
                {detecting
                  ? "Detecting..."
                  : location || "Set Location"}
              </span>

              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>

            {locationOpen && (
              <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

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

                <div className="p-3">
                  <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Choose city manually
                  </p>

                  <div className="max-h-64 overflow-y-auto">
                    {cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() =>
                          selectCity(city)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          location.toLowerCase() ===
                          city.toLowerCase()
                            ? "bg-amber-50 font-semibold text-amber-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <MapPin className="h-4 w-4 shrink-0" />

                        {city}

                        {location.toLowerCase() ===
                          city.toLowerCase() && (
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

          {/* DESKTOP AUTH */}
          {authLoading ? (
            <div className="hidden h-10 w-24 items-center justify-center rounded-full bg-white/5 sm:flex">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            </div>
          ) : user ? (
            <div
              ref={userMenuRef}
              className="relative hidden sm:block"
            >
              <button
                type="button"
                onClick={() =>
                  setUserMenuOpen(
                    (current) => !current,
                  )
                }
                className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-slate-200 transition hover:border-amber-400/40 hover:bg-white/10 hover:text-amber-400"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-950">
                  {getInitials(user.fullName)}
                </span>

                <span className="max-w-[120px] truncate">
                  {user.fullName}
                </span>

                <ChevronDown className="h-4 w-4" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.fullName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      {user.role === "PROVIDER"
                        ? "Vendor"
                        : user.role}
                    </p>
                  </div>

                  <div className="p-2">

                    <Link
                      href={getDashboardHref()}
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Dashboard
                    </Link>

                    {user.role === "CUSTOMER" && (
                      <>
                        <Link
                          href="/dashboard/profile"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          My Profile
                        </Link>

                        <Link
                          href="/dashboard/bookings"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          My Bookings
                        </Link>
                      </>
                    )}

                    {user.role === "PROVIDER" && (
                      <Link
                        href="/vendor/profile"
                        onClick={() =>
                          setUserMenuOpen(false)
                        }
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        My Profile
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 sm:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}

          {/* MOBILE MENU */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-200 hover:bg-white/10 lg:hidden"
            onClick={() =>
              setMobileOpen(
                (current) => !current,
              )
            }
            aria-label="Open menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-4 lg:hidden">
          <div className="space-y-1">

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={getHref(link.href)}
                onClick={(event) =>
                  handleNavClick(event, link.href)
                }
                className={`block rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/5 ${
                  isActive(link.href)
                    ? "bg-amber-400/10 text-amber-400"
                    : "text-slate-300"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-white/10" />

            {authLoading ? (
              <div className="flex items-center justify-center rounded-full bg-white/5 px-4 py-3 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : user ? (
              <div className="space-y-2">

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-white">
                    {user.fullName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {user.email}
                  </p>
                </div>

                <Link
                  href={getDashboardHref()}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  Dashboard
                </Link>

                {user.role === "CUSTOMER" && (
                  <>
                    <Link
                      href="/dashboard/profile"
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/dashboard/bookings"
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-sm font-semibold text-slate-950"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}