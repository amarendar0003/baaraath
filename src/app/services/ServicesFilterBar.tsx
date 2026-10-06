"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  AC_TYPES,
  LOCATION_MAP,
  citiesForLocation,
  findLocationForCity,
  findStateForDistrict,
} from "./filterConfig";

type Props = {
  cities: string[];
  // Banquet Hall shows the extra "Any Type" (AC / Non-AC) field.
  showType: boolean;
  initial: {
    q: string;
    state: string;
    district: string;
    city: string;
    sort: string;
    acType: string;
  };
  // Other active filters that must survive when the bar is applied.
  preserved: Record<string, string>;
};

const fieldClass =
  "h-9 w-full min-w-0 rounded-lg border border-amber-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200";

export default function ServicesFilterBar({
  cities,
  showType,
  initial,
  preserved,
}: Props) {
  const router = useRouter();

  const derived = initial.city ? findLocationForCity(initial.city) : null;

  const [q, setQ] = useState(initial.q);
  const [state, setState] = useState(initial.state || derived?.state || "");
  const [district, setDistrict] = useState(
    initial.district || derived?.district || "",
  );
  const [city, setCity] = useState(initial.city);
  const [sort, setSort] = useState(initial.sort || "latest");
  const [acType, setAcType] = useState(initial.acType);

  const stateOptions = Object.keys(LOCATION_MAP);

  const districtOptions = state
    ? Object.keys(LOCATION_MAP[state] || {})
    : Array.from(
        new Set(Object.values(LOCATION_MAP).flatMap((d) => Object.keys(d))),
      );

  const allowedCities =
    state || district
      ? citiesForLocation(state, district).map((item) => item.toLowerCase())
      : null;

  const cityOptions = cities.filter(
    (item) => !allowedCities || allowedCities.includes(item.toLowerCase()),
  );

  if (city && !cityOptions.some((item) => item.toLowerCase() === city.toLowerCase())) {
    cityOptions.unshift(city);
  }

  function handleState(value: string) {
    setState(value);
    setDistrict("");
    setCity("");
  }

  function handleDistrict(value: string) {
    setDistrict(value);

    if (value && !state) {
      setState(findStateForDistrict(value));
    }

    const nextState = state || (value ? findStateForDistrict(value) : "");
    const allowed = citiesForLocation(nextState, value).map((item) =>
      item.toLowerCase(),
    );

    if (value && city && !allowed.includes(city.toLowerCase())) {
      setCity("");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    Object.entries(preserved).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    if (q.trim()) params.set("q", q.trim());
    if (state) params.set("state", state);
    if (district) params.set("district", district);
    if (city) params.set("city", city);
    if (showType && acType) params.set("acType", acType);
    if (sort && sort !== "latest") params.set("sort", sort);

    const query = params.toString();

    router.push(query ? `/services?${query}` : "/services");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2 shadow-sm"
    >
      <div
        className={`grid items-center gap-2 sm:grid-cols-2 lg:grid-cols-3 ${
          showType
            ? "lg:grid-cols-[minmax(0,1.3fr)_repeat(6,minmax(0,1fr))_auto_auto]"
            : "lg:grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,1fr))_auto_auto]"
        }`}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500" />
          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search..."
            className={`${fieldClass} pl-8`}
          />
        </div>

        <select className={fieldClass} aria-label="Country" defaultValue="India">
          <option value="India">India</option>
        </select>

        <select
          className={fieldClass}
          aria-label="State"
          value={state}
          onChange={(event) => handleState(event.target.value)}
        >
          <option value="">All States</option>
          {stateOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className={fieldClass}
          aria-label="District"
          value={district}
          onChange={(event) => handleDistrict(event.target.value)}
        >
          <option value="">All Districts</option>
          {districtOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className={fieldClass}
          aria-label="City"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        >
          <option value="">All Cities</option>
          {cityOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {showType && (
          <select
            className={fieldClass}
            aria-label="Type"
            value={acType}
            onChange={(event) => setAcType(event.target.value)}
          >
            <option value="">Any Type</option>
            {AC_TYPES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        )}

        <select
          className={fieldClass}
          aria-label="Sort by"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="latest">Relevance</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="name">Name</option>
        </select>

        <button
          type="submit"
          className="h-9 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 text-xs font-semibold text-slate-950 shadow-sm shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
        >
          Apply
        </button>

        <Link
          href="/services"
          className="text-center text-xs font-medium text-slate-600 underline underline-offset-4 transition hover:text-amber-600"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
