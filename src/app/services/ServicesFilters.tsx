"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  LocateFixed,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LocationDetector from "./LocationDetector";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ServicesFiltersProps = {
  categories: Category[];
  cities: string[];
};

export default function ServicesFilters({
  categories,
  cities,
}: ServicesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("q") || ""
  );

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") || ""
  );

  const currentCategory =
    searchParams.get("category") || "";

  const currentCity =
    searchParams.get("city") || "";

  const currentRating =
    searchParams.get("rating") || "";

  const currentSort =
    searchParams.get("sort") || "latest";

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  function updateFilter(
    key: string,
    value: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname
    );
  }

  function applyPrice() {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname
    );
  }

  function submitSearch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (search.trim()) {
      params.set("q", search.trim());
    } else {
      params.delete("q");
    }

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname
    );
  }

  function clearAll() {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  }

  const activeFilterCount = [
    currentCategory,
    currentCity,
    currentRating,
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
  ].filter(Boolean).length;

  return (
    <aside className="space-y-4">
      {/* Location detection */}
      <LocationDetector />

      {/* Search */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Search
            </h2>
          </div>
        </div>

        <div className="p-5">
          <form onSubmit={submitSearch}>
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search services..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />

            <button
              type="submit"
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Filters */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Filters
            </h2>
          </div>

          {activeFilterCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {activeFilterCount}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="border-b border-slate-100 p-5">
          <p className="mb-3 text-sm font-bold text-slate-900">
            Category
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => updateFilter("category", "")}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm ${
                !currentCategory
                  ? "bg-amber-50 font-semibold text-amber-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>All categories</span>

              {!currentCategory && (
                <Check className="h-4 w-4" />
              )}
            </button>

            {categories.map((category) => {
              const selected =
                currentCategory === category.slug;

              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() =>
                    updateFilter(
                      "category",
                      category.slug
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm ${
                    selected
                      ? "bg-amber-50 font-semibold text-amber-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{category.name}</span>

                  {selected && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* City */}
        <div className="border-b border-slate-100 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">
              Location
            </p>

            <MapPin className="h-4 w-4 text-slate-400" />
          </div>

          <select
            value={currentCity}
            onChange={(event) =>
              updateFilter(
                "city",
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">All locations</option>

            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Your browser location is detected automatically when permission is allowed.
          </p>
        </div>

        {/* Price */}
        <div className="border-b border-slate-100 p-5">
          <p className="mb-3 text-sm font-bold text-slate-900">
            Price Range
          </p>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) =>
                setMinPrice(event.target.value)
              }
              placeholder="Min ₹"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />

            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(event.target.value)
              }
              placeholder="Max ₹"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="button"
            onClick={applyPrice}
            className="mt-2.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Apply Price
          </button>
        </div>

        {/* Rating */}
        <div className="border-b border-slate-100 p-5">
          <p className="mb-3 text-sm font-bold text-slate-900">
            Rating
          </p>

          <select
            value={currentRating}
            onChange={(event) =>
              updateFilter(
                "rating",
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Any rating</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
            <option value="2">2+ stars</option>
          </select>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Rating filter will become active after the Reviews module is connected.
          </p>
        </div>

        {/* Clear */}
        <div className="p-5">
          <button
            type="button"
            onClick={clearAll}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </button>
        </div>
      </section>
    </aside>
  );
}
