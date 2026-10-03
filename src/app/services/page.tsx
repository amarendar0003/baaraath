import ServicesLocationCard from "@/components/ServicesLocationCard";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AutoLocation from "@/components/AutoLocation";

type SearchParams = {
  q?: string;
  category?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  sort?: string;
};

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
  const icons: Record<string, string> = {
    banquet_hall: "🏛️",
    music_band: "🎵",
    event_management: "🎉",
    catering: "🍽️",
    dancing: "💃",
    priests: "🪔",
    hotels: "🏨",
  };

  return icons[slug] || "✨";
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

  const [categories, cities, services] = await Promise.all([
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
        active: true,

        ...(q
          ? {
              OR: [
                {
                  title: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  Vendor: {
                    name: {
                      contains: q,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),

        ...(category
          ? {
              Category: {
                slug: category,
              },
            }
          : {}),

        ...(city
          ? {
              Vendor: {
                city: {
                  contains: city,
                  mode: "insensitive",
                },
              },
            }
          : {}),

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
  ]);

  const activeCategory = categories.find((item) => item.slug === category);

  const activeFilters = [
    q ? `Search: ${q}` : "",
    activeCategory ? activeCategory.name : "",
    city ? `Location: ${city}` : "",
    minPrice > 0 ? `Min ₹${minPrice}` : "",
    maxPrice > 0 ? `Max ₹${maxPrice}` : "",
    rating ? `${rating}+ rating` : "",
  ].filter(Boolean);

  return (
    <>
      <ServicesLocationCard />

      <main className="min-h-screen bg-slate-50 text-slate-900">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <Link href="/" className="hover:text-slate-900">
                    Home
                  </Link>
                  <span>›</span>
                  <span>Services</span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Find the right service for your occasion
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                  Discover event services, compare providers, check prices and
                  find services near your location.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm">
                <span className="mr-2">☷</span>
                {services.length} services found
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[245px_1fr] lg:px-8">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                  ◎
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Your location
                  </h2>

                  {city ? (
                    <p className="mt-1 text-sm text-slate-600">
                      Showing services in{" "}
                      <span className="font-semibold">{city}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-600">
                      Detecting your current location...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <form
              action="/services"
              method="GET"
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-4 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  🔎 Search
                </h2>
              </div>

              <div className="space-y-3 p-4">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search services..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                />

                {category && (
                  <input type="hidden" name="category" value={category} />
                )}

                {city && <input type="hidden" name="city" value={city} />}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  🔎 Search
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  ⚙ Filters
                </h2>
              </div>

              <div className="p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Category
                </h3>

                <div className="space-y-1">
                  <Link
                    href={`/services${city ? `?city=${encodeURIComponent(city)}` : ""}`}
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      !category
                        ? "bg-amber-50 font-semibold text-amber-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {!category && "✓ "}All categories
                  </Link>

                  {categories.map((item) => {
                    const query = new URLSearchParams();

                    query.set("category", item.slug);

                    if (city) query.set("city", city);

                    if (q) query.set("q", q);

                    return (
                      <Link
                        key={item.id}
                        href={`/services?${query.toString()}`}
                        className={`block rounded-lg px-3 py-2 text-sm ${
                          category === item.slug
                            ? "bg-amber-50 font-semibold text-amber-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {category === item.slug && "✓ "}
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Location
                </h3>

                {city ? (
                  <div className="rounded-xl bg-blue-50 px-3 py-3 text-sm">
                    <div className="font-semibold text-slate-900">
                      📍 {city}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Automatically detected location
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    Detecting your location...
                  </div>
                )}

                {cities.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-medium text-slate-500">
                      Choose another city
                    </summary>

                    <div className="mt-2 space-y-1">
                      {cities.map((item) => {
                        const query = new URLSearchParams();

                        query.set("city", item.city);

                        if (category) query.set("category", category);

                        return (
                          <Link
                            key={item.city}
                            href={`/services?${query.toString()}`}
                            className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            {item.city}
                          </Link>
                        );
                      })}
                    </div>
                  </details>
                )}
              </div>

              <div className="border-t border-slate-100 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Price Range
                </h3>

                <form action="/services" method="GET" className="grid grid-cols-2 gap-2">
                  {category && (
                    <input type="hidden" name="category" value={category} />
                  )}

                  {city && <input type="hidden" name="city" value={city} />}

                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={params.minPrice || ""}
                    min="0"
                    placeholder="Min ₹"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />

                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={params.maxPrice || ""}
                    min="0"
                    placeholder="Max ₹"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />

                  <button
                    type="submit"
                    className="col-span-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    Apply Price
                  </button>
                </form>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">
                  {services.length} {services.length === 1 ? "service" : "services"}
                </div>

                {activeFilters.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <span
                        key={filter}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                      >
                        {filter}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <form
                action="/services"
                method="GET"
                className="flex items-center gap-2"
              >
                {q && <input type="hidden" name="q" value={q} />}
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
                {city && <input type="hidden" name="city" value={city} />}

                <label htmlFor="sort" className="text-sm text-slate-500">
                  Sort by
                </label>

                <select
                  id="sort"
                  name="sort"
                  defaultValue={sort}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none"
                >
                  <option value="latest">Latest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Apply
                </button>
              </form>
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
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

