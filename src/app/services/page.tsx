import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AutoLocation from "@/components/AutoLocation";
import ServicesFilterBar from "./ServicesFilterBar";
import ServicesSidebar from "./ServicesSidebar";
import {
  AC_TYPES,
  AMENITIES,
  CAPACITY_OPTIONS,
  OTHER_SERVICES,
  VENUE_TYPES,
  citiesForLocation,
  countFacets,
  getFacets,
  hasFacetSelection,
  matchesSelection,
} from "./filterConfig";

type SearchParams = {
  q?: string;
  category?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  sort?: string;
  state?: string;
  district?: string;
  acType?: string;
  venueType?: string;
  capacity?: string;
  amenities?: string;
  inhouse?: string;
  outside?: string;
};

function splitList(value?: string) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function formatPrice(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function categoryIcon(slug: string) {
  const key = slug.toLowerCase().replace(/[\s-]+/g, "_");

  if (key.includes("banquet")) return "🏛️";
  if (key.includes("music")) return "🎵";
  if (key.includes("event")) return "🎉";
  if (key.includes("cater")) return "🍽️";
  if (key.includes("danc")) return "💃";
  if (key.includes("priest")) return "🪔";
  if (key.includes("hotel")) return "🏨";

  return "✨";
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const city = params.city?.trim() || "";
  const minPrice = Number(params.minPrice || 0);
  const maxPrice = Number(params.maxPrice || 0);
  const rating = params.rating || "";
  const sort = params.sort || "latest";
  const state = params.state?.trim() || "";
  const district = params.district?.trim() || "";

  // Without an exact city, a chosen state / district narrows by its cities.
  const locationCities =
    !city && (state || district) ? citiesForLocation(state, district) : null;

  const vendorFilter = city
    ? { city: { contains: city, mode: "insensitive" as const } }
    : locationCities
      ? {
          OR: locationCities.map((name) => ({
            city: { equals: name, mode: "insensitive" as const },
          })),
        }
      : null;

  const baseWhere = {
    active: true,

    ...(q
      ? {
          OR: [
            {
              title: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              Vendor: {
                name: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),

    ...(vendorFilter ? { Vendor: vendorFilter } : {}),

    ...(minPrice > 0
      ? {
          price: {
            gte: minPrice,
          },
        }
      : {}),

    ...(maxPrice > 0
      ? {
          price: {
            lte: maxPrice,
          },
        }
      : {}),
  };

  const [categories, cities, rawServices, scopedServices] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),

      prisma.vendor.findMany({
        where: {
          city: {
            not: "",
          },
        },
        select: {
          city: true,
        },
        distinct: ["city"],
        orderBy: {
          city: "asc",
        },
      }),

      prisma.service.findMany({
        where: {
          ...baseWhere,

          ...(category
            ? {
                Category: {
                  slug: category,
                },
              }
            : {}),
        },

        include: {
          Vendor: true,
          Category: true,
        },

        orderBy:
          sort === "price_low"
            ? { price: "asc" }
            : sort === "price_high"
              ? { price: "desc" }
              : sort === "name"
                ? { title: "asc" }
                : { createdAt: "desc" },
      }),

      // Same search / location scope without the category, used for the counts.
      prisma.service.findMany({
        where: baseWhere,
        select: {
          title: true,
          description: true,
          Category: {
            select: {
              slug: true,
            },
          },
        },
      }),
    ]);

  const activeCategory = categories.find((item) => item.slug === category);

  // Banquet Hall category (slug may be banquet_hall, banquet-halls, ...).
  const isBanquet = Boolean(
    activeCategory &&
      /banquet/i.test(`${activeCategory.slug} ${activeCategory.name}`),
  );

  // The AC / Non-AC type only applies to Banquet Hall.
  const acType =
    isBanquet && (params.acType === "ac" || params.acType === "non_ac")
      ? params.acType
      : "";

  const selection = {
    acType,
    venueType: splitList(params.venueType),
    capacity: params.capacity?.trim() || "",
    amenities: splitList(params.amenities),
    inhouse: splitList(params.inhouse),
    outside: splitList(params.outside),
  };

  // Venue type, capacity, amenities and other services are read from the
  // service text because the database has no columns for them.
  const services = hasFacetSelection(selection)
    ? rawServices.filter((service) =>
        matchesSelection(
          getFacets({
            title: service.title,
            description: service.description,
            categorySlug: service.Category.slug,
          }),
          selection,
        ),
      )
    : rawServices;

  const categoryCounts: Record<string, number> = {};

  for (const item of scopedServices) {
    categoryCounts[item.Category.slug] =
      (categoryCounts[item.Category.slug] || 0) + 1;
  }

  const sidebarCategories = categories.map((item) => ({
    slug: item.slug,
    name: item.name,
    count: categoryCounts[item.slug] || 0,
  }));

  const facetCounts = countFacets(
    scopedServices
      .filter((item) => !category || item.Category.slug === category)
      .map((item) =>
        getFacets({
          title: item.title,
          description: item.description,
          categorySlug: item.Category.slug,
        }),
      ),
  );

  const preserved: Record<string, string> = {};

  (
    [
      ["category", category],
      ["venueType", params.venueType?.trim() || ""],
      ["capacity", selection.capacity],
      ["amenities", params.amenities?.trim() || ""],
      ["inhouse", params.inhouse?.trim() || ""],
      ["outside", params.outside?.trim() || ""],
      ["minPrice", params.minPrice?.trim() || ""],
      ["maxPrice", params.maxPrice?.trim() || ""],
      ["rating", rating],
    ] as const
  ).forEach(([key, value]) => {
    if (value) preserved[key] = value;
  });

  const bannerTitle = activeCategory ? activeCategory.name : "All Services";
  const bannerIcon = activeCategory ? categoryIcon(activeCategory.slug) : "✨";
  const allServicesHref = `/services${city ? `?city=${encodeURIComponent(city)}` : ""}`;

  const activeFilters = [
    q ? `Search: ${q}` : "",
    activeCategory ? activeCategory.name : "",
    state ? `State: ${state}` : "",
    district ? `District: ${district}` : "",
    city ? `Location: ${city}` : "",
    acType
      ? `Type: ${AC_TYPES.find((item) => item.key === acType)?.label || acType}`
      : "",
    ...selection.venueType.map(
      (key) => VENUE_TYPES.find((item) => item.key === key)?.label || key,
    ),
    selection.capacity
      ? `Capacity: ${
          CAPACITY_OPTIONS.find((item) => item.key === selection.capacity)
            ?.label || selection.capacity
        }`
      : "",
    ...selection.amenities.map(
      (key) => AMENITIES.find((item) => item.key === key)?.label || key,
    ),
    ...selection.inhouse.map(
      (key) =>
        `In-house ${OTHER_SERVICES.find((item) => item.key === key)?.label || key}`,
    ),
    ...selection.outside.map(
      (key) =>
        `Outside ${OTHER_SERVICES.find((item) => item.key === key)?.label || key}`,
    ),
    minPrice > 0 ? `Min ₹${minPrice}` : "",
    maxPrice > 0 ? `Max ₹${maxPrice}` : "",
    rating ? `${rating}+ rating` : "",
  ].filter(Boolean);

  return (
    <>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto w-full max-w-[1920px] space-y-4 px-4 pt-6 sm:px-6 lg:px-8 2xl:px-12">
          {/* Page header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 shadow-lg ring-1 ring-amber-500/20">
            <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Link
                  href="/"
                  className="text-amber-400 transition hover:text-amber-300"
                >
                  Home
                </Link>
                <span className="text-slate-500">/</span>

                {activeCategory ? (
                  <>
                    <Link
                      href={allServicesHref}
                      className="text-amber-400 transition hover:text-amber-300"
                    >
                      All Services
                    </Link>
                    <span className="text-slate-500">/</span>
                    <span className="text-white">{activeCategory.name}</span>
                  </>
                ) : (
                  <span className="text-white">All Services</span>
                )}
              </div>

              <h1 className="flex items-center justify-center gap-2 text-xl font-bold text-white sm:text-2xl">
                <span className="text-amber-400">{bannerIcon}</span>
                {bannerTitle}
              </h1>

              <div className="md:justify-self-end">
                <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-white/5 px-3 py-1 text-xs font-medium text-amber-300">
                  {services.length}{" "}
                  {services.length === 1 ? "service" : "services"} found
                </span>
              </div>
            </div>
          </div>

          {/* Search + location + sort bar */}
          <ServicesFilterBar
            key={[q, state, district, city, sort, acType, category].join("|")}
            cities={cities.map((item) => item.city)}
            showType={isBanquet}
            initial={{ q, state, district, city, sort, acType }}
            preserved={preserved}
          />
        </div>

        <div className="mx-auto grid w-full max-w-[1920px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-8 2xl:px-12">
          <ServicesSidebar
            categories={sidebarCategories}
            totalCount={scopedServices.length}
            facets={facetCounts}
          />

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <div className="text-sm font-semibold">
                {services.length} {services.length === 1 ? "service" : "services"}
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {activeFilters.map((filter) => (
                    <span
                      key={filter}
                      className="rounded-full bg-slate-100 px-3 py-0.5 text-xs text-slate-600"
                    >
                      {filter}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {services.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="text-4xl">🔎</div>
                <h2 className="mt-4 text-xl font-bold">
                  No services found
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                <Link
                  href="/services"
                  className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {services.map((service) => (
                  <article
                    key={service.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-amber-50 to-slate-100">
                      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {service.Category.name}
                      </span>

                      <span className="text-5xl">
                        {categoryIcon(service.Category.slug)}
                      </span>
                    </div>

                    <div className="p-4">
                      <h2 className="min-h-12 text-lg font-bold leading-6">
                        {service.title}
                      </h2>

                      <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                        <span>📍</span>
                        <div>
                          <div className="font-medium text-slate-600">
                            {service.Vendor.city}
                          </div>

                          {service.Vendor.address && (
                            <div className="text-xs">
                              {service.Vendor.address}
                            </div>
                          )}
                        </div>
                      </div>

                      {service.description && (
                        <p className="mt-4 line-clamp-2 text-sm leading-5 text-slate-500">
                          {service.description}
                        </p>
                      )}

                      <div className="my-4 border-t border-slate-100" />

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs text-slate-400">
                            Starting from
                          </div>

                          <div className="text-xl font-bold text-slate-900">
                            {formatPrice(service.price)}
                          </div>
                        </div>

                        <div className="text-xs text-slate-500">
                          ◷ {service.durationMinutes} min
                        </div>
                      </div>

                      <Link
                        href={`/services/${service.id}`}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        View Details →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}