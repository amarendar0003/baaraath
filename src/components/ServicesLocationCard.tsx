"use client";

import { useEffect, useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";

export default function ServicesLocationCard() {
  const [city, setCity] = useState("");

  useEffect(() => {
    const readCity = () => {
      const params = new URLSearchParams(window.location.search);
      const detectedCity = params.get("city");

      if (detectedCity) {
        setCity(detectedCity);
      } else {
        setCity("");
      }
    };

    readCity();

    window.addEventListener("popstate", readCity);

    return () => {
      window.removeEventListener("popstate", readCity);
    };
  }, []);

  if (city) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
            <MapPin className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Your location
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              Showing services near{" "}
              <strong>{city}</strong>
            </p>

            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <LocateFixed className="h-3.5 w-3.5" />
              Automatically detected
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
          <LocateFixed className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Your location
          </p>

          <p className="mt-1 text-sm text-blue-700">
            Detecting your current location...
          </p>
        </div>
      </div>
    </div>
  );
}
