"use client";

import { useEffect, useState } from "react";
import { MapPin, LocateFixed, AlertCircle, Loader2 } from "lucide-react";

type LocationState = {
  city: string;
  latitude: number;
  longitude: number;
};

const STORAGE_KEY = "baaraath_location";

export default function AutoLocation() {
  const [status, setStatus] = useState<
    "detecting" | "success" | "denied" | "error"
  >("detecting");

  const [location, setLocation] = useState<LocationState | null>(null);
  const [message, setMessage] = useState("Detecting your current location...");

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Geolocation is not supported by this browser.");
      return;
    }

    setStatus("detecting");
    setMessage("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = await response.json();

          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.suburb ||
            address.village ||
            "";

          if (!city) {
            throw new Error("City could not be determined");
          }

          const detected: LocationState = {
            city,
            latitude,
            longitude,
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify(detected));

          setLocation(detected);
          setStatus("success");
          setMessage(`Showing services near ${city}`);

          const currentUrl = new URL(window.location.href);

          if (currentUrl.pathname === "/services") {
            currentUrl.searchParams.set("city", city);
            window.history.replaceState({}, "", currentUrl.toString());
          }
        } catch {
          setStatus("error");
          setMessage(
            "Your location was detected, but the city could not be determined."
          );
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        localStorage.removeItem(STORAGE_KEY);

        const currentUrl = new URL(window.location.href);

        if (currentUrl.searchParams.has("city")) {
          currentUrl.searchParams.delete("city");
          window.history.replaceState({}, "", currentUrl.pathname);
        }

        setLocation(null);

        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          setMessage(
            "Location permission was denied. Please allow location access."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus("error");
          setMessage("Your current location is unavailable.");
        } else if (error.code === error.TIMEOUT) {
          setStatus("error");
          setMessage("Location detection timed out. Please try again.");
        } else {
          setStatus("error");
          setMessage("Unable to detect your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    // Do not trust an old saved city as the current location.
    localStorage.removeItem(STORAGE_KEY);

    detectLocation();
  }, []);

  if (status === "success" && location) {
    return (
      <div className="border-b border-emerald-200 bg-emerald-50">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Your location
            </p>
            <p className="text-sm text-emerald-700">
              Showing services near <strong>{location.city}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm">
            <AlertCircle className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Your location
            </p>
            <p className="text-sm text-amber-700">{message}</p>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <LocateFixed className="h-4 w-4" />
            Allow Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-blue-200 bg-blue-50">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
          {status === "detecting" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LocateFixed className="h-5 w-5" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Your location
          </p>
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
