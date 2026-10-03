"use client";

import { useEffect, useState } from "react";
import { Loader2, LocateFixed, MapPin, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function LocationDetector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [detecting, setDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const existingCity = searchParams.get("city");

    if (existingCity) {
      setDetectedCity(existingCity);
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Location detection is not supported by this browser.");
      return;
    }

    let cancelled = false;

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) return;

        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `/api/location/reverse?lat=${encodeURIComponent(
              latitude
            )}&lon=${encodeURIComponent(longitude)}`,
            {
              cache: "no-store",
            }
          );

          const data = await response.json();

          if (!response.ok || !data.city) {
            throw new Error("City could not be detected.");
          }

          if (cancelled) return;

          const city = data.city;

          setDetectedCity(city);
          setMessage("");

          const params = new URLSearchParams(
            searchParams.toString()
          );

          params.set("city", city);

          router.replace(`${pathname}?${params.toString()}`);
        } catch {
          if (!cancelled) {
            setMessage("Could not determine your city.");
          }
        } finally {
          if (!cancelled) {
            setDetecting(false);
          }
        }
      },
      (error) => {
        if (cancelled) return;

        setDetecting(false);

        if (error.code === error.PERMISSION_DENIED) {
          setMessage(
            "Location permission was denied. Select your city manually."
          );
        } else {
          setMessage(
            "Location could not be detected. Select your city manually."
          );
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  function detectAgain() {
    window.location.reload();
  }

  function clearLocation() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("city");

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
    setDetectedCity("");
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          {detecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Your location
          </p>

          {detecting ? (
            <p className="mt-1 text-xs text-slate-600">
              Detecting your location...
            </p>
          ) : detectedCity ? (
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-blue-700">
              <MapPin className="h-3.5 w-3.5" />
              {detectedCity}
            </div>
          ) : (
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {message ||
                "Allow browser location access to find nearby services."}
            </p>
          )}
        </div>

        {detectedCity && (
          <button
            type="button"
            onClick={clearLocation}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
            aria-label="Clear location"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!detecting && !detectedCity && (
        <button
          type="button"
          onClick={detectAgain}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          Detect My Location
        </button>
      )}
    </div>
  );
}
