"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BedDouble,
  ParkingSquare,
  RotateCcw,
  SlidersHorizontal,
  Snowflake,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  AMENITIES,
  CAPACITY_OPTIONS,
  OTHER_SERVICES,
  VENUE_TYPES,
  type FacetCounts,
} from "./filterConfig";

type Props = {
  categories: { slug: string; name: string; count: number }[];
  totalCount: number;
  facets: FacetCounts;
};

const amenityIcons: Record<string, LucideIcon> = {
  ac: Snowflake,
  parking: ParkingSquare,
  power_backup: Zap,
  rooms: BedDouble,
};

const FACET_KEYS = ["venueType", "capacity", "amenities", "inhouse", "outside"];

function splitList(value: string | null) {
  return value ? value.split(",").filter(Boolean) : [];
}

export default function ServicesSidebar({
  categories,
  totalCount,
  facets,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Other Services (and its In-house / Outside groups) start minimized,
  // unless one of their options is already selected in the URL.
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const hasInhouse = splitList(searchParams.get("inhouse")).length > 0;
    const hasOutside = splitList(searchParams.get("outside")).length > 0;

    return {
      venue: true,
      capacity: true,
      amenities: true,
      other: hasInhouse || hasOutside,
      inhouse: hasInhouse,
      outside: hasOutside,
      price: false,
    };
  });

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Keep the price inputs in sync when the URL changes (e.g. Clear).
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const category = searchParams.get("category") || "";
  const capacity = searchParams.get("capacity") || "";

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(changes).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggle(key: string, value: string) {
    const current = splitList(searchParams.get(key));

    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    update({ [key]: next.join(",") || null });
  }

  function resetVenueFilters() {
    update(Object.fromEntries(FACET_KEYS.map((key) => [key, null])));
  }

  function toggleSection(key: string) {
    setOpen((current) => ({ ...current, [key]: !current[key] }));
  }

  function sectionHeader(id: string, title: string, small = false) {
    return (
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="flex w-full items-center justify-between text-left"
      >
        <span
          className={
            small
              ? "text-xs font-bold text-slate-800"
              : "text-sm font-bold text-slate-900"
          }
        >
          {title}
        </span>
        <span className="text-base font-bold leading-none text-amber-500">
          {open[id] ? "−" : "+"}
        </span>
      </button>
    );
  }

  function checkRow(
    param: string,
    value: string,
    label: string,
    count: number,
    Icon?: LucideIcon,
  ) {
    const checked = splitList(searchParams.get(param)).includes(value);

    return (
      <label
        key={`${param}-${value}`}
        className="flex cursor-pointer items-start gap-2 py-1.5 text-sm text-slate-600 transition hover:text-slate-900">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggle(param, value)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-amber-500"
        />

        {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}

        <span className="flex-1 leading-5">{label}</span>

        <span className="text-xs tabular-nums text-slate-400">{count}</span>
      </label>
    );
  }

  const cardClass =
    "rounded-2xl border border-amber-200/70 bg-white shadow-sm";

  return (
    <aside className="space-y-4">
      {/* CATEGORIES */}
      <section className={`${cardClass} p-4`}>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Categories
        </h2>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => update({ category: null, acType: null })}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
              !category
                ? "bg-amber-50 font-semibold text-amber-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                !category
                  ? "bg-amber-200 text-amber-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {totalCount}
            </span>
          </button>

          {categories.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => update({ category: item.slug, acType: null })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                category === item.slug
                  ? "bg-amber-50 font-semibold text-amber-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{item.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  category === item.slug
                    ? "bg-amber-200 text-amber-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FILTER VENUES */}
      <section className={`${cardClass} p-4`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <SlidersHorizontal className="h-4 w-4 text-amber-500" />
            Filter Venues
          </h2>

          <button
            type="button"
            onClick={resetVenueFilters}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-amber-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All
          </button>
        </div>

        {/* Venue type */}
        <div className="border-t border-amber-100 py-3">
          {sectionHeader("venue", "Venue Type")}

          {open.venue && (
            <div className="mt-2">
              {VENUE_TYPES.map((item) =>
checkRow("venueType", item.key, item.label, facets.venueType[item.key] || 0),
)}
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="border-t border-amber-100 py-3">
          {sectionHeader("capacity", "Capacity (Guests)")}

          {open.capacity && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ capacity: null })}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  !capacity
                    ? "border-amber-500 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-amber-400"
                }`}
              >
                Any
              </button>

              {CAPACITY_OPTIONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => update({ capacity: item.key })}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    capacity === item.key
                      ? "border-amber-500 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-amber-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="border-t border-amber-100 py-3">
          {sectionHeader("amenities", "Amenities")}

          {open.amenities && (
            <div className="mt-2">
              {AMENITIES.map((item) =>
checkRow("amenities", item.key, item.label, facets.amenities[item.key] || 0, amenityIcons[item.key]),
)}
            </div>
          )}
        </div>

        {/* Other services */}
        <div className="border-t border-amber-100 pt-3">
          {sectionHeader("other", "Other Services")}

          {open.other && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/30 p-3">
                {sectionHeader("inhouse", "In-house", true)}

                {open.inhouse && (
                  <div className="mt-2">
                    {OTHER_SERVICES.map((item) =>
checkRow(
                        "inhouse",
                        item.key,
                        `In-house ${item.label}`,
                        facets.inhouse[item.key] || 0,
                      ),
)}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-amber-200/70 bg-amber-50/30 p-3">
                {sectionHeader("outside", "Outside", true)}

                {open.outside && (
                  <div className="mt-2">
                    {OTHER_SERVICES.map((item) =>
checkRow(
                        "outside",
                        item.key,
                        `Outside ${item.label}`,
                        facets.outside[item.key] || 0,
                      ),
)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price range (existing feature, kept) */}
        <div className="mt-3 border-t border-amber-100 pt-3">
          {sectionHeader("price", "Price Range")}

          {open.price && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Min ₹"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Max ₹"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />

              <button
                type="button"
                onClick={() =>
                  update({
                    minPrice: minPrice || null,
                    maxPrice: maxPrice || null,
                  })
                }
                className="col-span-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Apply Price
              </button>
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}