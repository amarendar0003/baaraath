"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";

const categories = [
  { name: "Banquet Halls", slug: "banquet_hall", icon: "🏛️", color: "bg-rose-50" },
  { name: "Music Bands", slug: "music_band", icon: "🎸", color: "bg-amber-50" },
  { name: "Catering", slug: "catering", icon: "🍽️", color: "bg-orange-50" },
  { name: "Hotels", slug: "hotels", icon: "🏨", color: "bg-sky-50" },
  { name: "Dancing", slug: "dancing", icon: "💃", color: "bg-fuchsia-50" },
  { name: "Priests", slug: "priests", icon: "🪔", color: "bg-yellow-50" },
  { name: "Event Planning", slug: "event_management", icon: "🎪", color: "bg-emerald-50" },
];

const cities = ["Hyderabad", "Mumbai", "Delhi", "Bangalore", "Kolkata"];
const priceRanges = [
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 – ₹50,000", min: 10000, max: 50000 },
  { label: "₹50,000 – ₹1,00,000", min: 50000, max: 100000 },
  { label: "Above ₹1,00,000", min: 100000, max: Infinity },
];

const initialServices = [
  {
    id: "1",
    title: "Royal Grand Banquet Hall",
    category: "Banquet Hall",
    slug: "royal-grand-banquet-hall",
    city: "Hyderabad",
    price: 150000,
    priceUnit: "/ day",
    rating: 4.7,
    reviewCount: 124,
    imageUrl: "",
    vendorName: "Grand Events",
  },
  {
    id: "2",
    title: "Harmony Music Band",
    category: "Music Band",
    slug: "harmony-music-band",
    city: "Mumbai",
    price: 50000,
    priceUnit: "/ event",
    rating: 4.5,
    reviewCount: 89,
    imageUrl: "",
    vendorName: "Melody Makers",
  },
  {
    id: "3",
    title: "Elite Catering Services",
    category: "Catering",
    slug: "elite-catering-services",
    city: "Delhi",
    price: 800,
    priceUnit: "/ plate",
    rating: 4.8,
    reviewCount: 210,
    imageUrl: "",
    vendorName: "Elite Foods",
  },
  {
    id: "4",
    title: "Luxury Hotel Venue",
    category: "Hotels",
    slug: "luxury-hotel-venue",
    city: "Bangalore",
    price: 250000,
    priceUnit: "/ day",
    rating: 4.6,
    reviewCount: 156,
    imageUrl: "",
    vendorName: "Premium Stays",
  },
  {
    id: "5",
    title: "Classical Dance Performance",
    category: "Dancing",
    slug: "classical-dance-performance",
    city: "Chennai",
    price: 35000,
    priceUnit: "/ event",
    rating: 4.9,
    reviewCount: 67,
    imageUrl: "",
    vendorName: "Art & Soul",
  },
  {
    id: "6",
    title: "Traditional Pooja Services",
    category: "Priests",
    slug: "traditional-pooja-services",
    city: "Kolkata",
    price: 5000,
    priceUnit: "/ ceremony",
    rating: 4.8,
    reviewCount: 45,
    imageUrl: "",
    vendorName: "Sacred Rituals",
  },
];

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = initialServices.filter((service) => {
    if (selectedCategory && service.category.toLowerCase() !== selectedCategory.replace(/_/g, " ")) {
      const categorySlug = categories.find((c) => c.slug === selectedCategory);
      if (categorySlug && !service.category.toLowerCase().includes(categorySlug.name.toLowerCase())) {
        return false;
      }
    }
    if (selectedCity && service.city !== selectedCity) return false;
    if (priceRange) {
      const range = priceRanges.find((r) => r.label === priceRange);
      if (range) {
        if (service.price < range.min || service.price >= range.max) return false;
      }
    }
    if (minRating && service.rating < parseFloat(minRating)) return false;
    if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedCity("");
    setPriceRange("");
    setMinRating("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-[#342433] sm:text-4xl">
            Browse Services
          </h1>
          <p className="mt-2 text-sm text-[#786d76]">
            Discover event services from trusted providers across India.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-[#eee7e0] bg-white p-4 shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#eee7e0] px-4 py-3">
              <span className="text-xl text-[#9a4968]" aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search services, venues, caterers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 bg-transparent text-sm text-[#302832] outline-none placeholder:text-[#a49aa2]"
                aria-label="Search services"
              />
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-[#eee7e0] px-4 py-3 text-sm font-semibold text-[#3d303c] outline-none focus:border-[#8b3b5e]"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#3d303c]">City</h3>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#eee7e0] px-4 py-2.5 text-sm text-[#3d303c] outline-none focus:border-[#8b3b5e]"
                  aria-label="Filter by city"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#3d303c]">Price Range</h3>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#eee7e0] px-4 py-2.5 text-sm text-[#3d303c] outline-none focus:border-[#8b3b5e]"
                  aria-label="Filter by price range"
                >
                  <option value="">All Prices</option>
                  {priceRanges.map((range) => (
                    <option key={range.label} value={range.label}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#3d303c]">Minimum Rating</h3>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#eee7e0] px-4 py-2.5 text-sm text-[#3d303c] outline-none focus:border-[#8b3b5e]"
                  aria-label="Filter by minimum rating"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ ★</option>
                  <option value="4.5">4.5+ ★</option>
                  <option value="4.8">4.8+ ★</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="w-full rounded-full border border-[#e8d9df] px-4 py-2.5 text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5]"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          <div>
            <div className="mb-6">
              <h2 className="text-lg font-extrabold text-[#3d303c]">
                {filteredServices.length}{" "}
                {filteredServices.length === 1 ? "service" : "services"} found
              </h2>
            </div>

            {filteredServices.length === 0 ? (
              <div className="rounded-2xl border border-[#eee7e0] bg-white p-12 text-center">
                <p className="text-lg font-semibold text-[#3d303c]">
                  No services found
                </p>
                <p className="mt-2 text-sm text-[#786d76]">
                  Try adjusting your filters or search query.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-full bg-[#55243f] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#6b2d50]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} {...service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-8 h-10 w-48 animate-pulse rounded bg-[#fbf7f2]" />
        <div className="mb-8 h-16 animate-pulse rounded-2xl bg-[#fbf7f2]" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#fbf7f2]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesContent />
    </Suspense>
  );
}
