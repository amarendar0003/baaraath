import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata: Metadata = {
  title: { absolute: "Baaraath – Book Venues, Catering & Event Services in India" },
  description:
    "Find and book banquet halls, caterers, bands, priests and event planners for weddings, birthdays and every celebration. Compare providers and plan in one place.",
  alternates: { canonical: "/" },
};

const popularCities = ["Hyderabad", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

const categoryTiles = [
  { name: "Banquet Halls", slug: "banquet_hall", icon: "🏛️", tag: "Grand & intimate venues", bg: "from-rose-100 to-orange-50" },
  { name: "Music Bands", slug: "music_band", icon: "🎸", tag: "Live energy for your night", bg: "from-amber-100 to-yellow-50" },
  { name: "Catering", slug: "catering", icon: "🍽️", tag: "Menus guests remember", bg: "from-orange-100 to-amber-50" },
  { name: "Hotels", slug: "hotels", icon: "🏨", tag: "Stay for family & guests", bg: "from-sky-100 to-indigo-50" },
  { name: "Dancing", slug: "dancing", icon: "💃", tag: "Choreographers & troupes", bg: "from-fuchsia-100 to-rose-50" },
  { name: "Priests", slug: "priests", icon: "🪔", tag: "Rituals done right", bg: "from-yellow-100 to-orange-50" },
  { name: "Event Planning", slug: "event_management", icon: "🎪", tag: "Stress-free coordination", bg: "from-emerald-100 to-teal-50" },
];

const featured = [
  { title: "Beautiful venues", description: "Find a space that feels just right for your celebration.", slug: "banquet_hall", icon: "🏰", style: "from-rose-100 via-orange-50 to-amber-100", tag: "VENUES" },
  { title: "Food worth celebrating", description: "Discover catering teams for intimate and grand occasions.", slug: "catering", icon: "🍲", style: "from-amber-100 via-yellow-50 to-orange-100", tag: "CATERING" },
  { title: "Make it unforgettable", description: "Bring your event together with experienced planners.", slug: "event_management", icon: "✨", style: "from-violet-100 via-fuchsia-50 to-rose-100", tag: "EVENT PLANNING" },
];

const occasions = ["Weddings", "Engagements", "Birthdays", "Anniversaries", "Baby Showers", "Corporate Events", "Housewarmings", "Reunions"];

const steps = [
  { icon: "🔎", title: "Search", text: "Tell us what you need and where. Filter by category, city and budget." },
  { icon: "⚖️", title: "Compare", text: "Review vendor profiles, prices and details side by side." },
  { icon: "✅", title: "Book", text: "Send your booking request and track it with a confirmation number." },
];

const reasons = [
  { icon: "🛡️", title: "Vetted providers", text: "Browse detailed vendor profiles before you enquire." },
  { icon: "🗂️", title: "One place for everything", text: "Keep every enquiry and booking organised." },
  { icon: "📍", title: "Local by design", text: "Discover options in your city or chosen area." },
  { icon: "💬", title: "Clear pricing", text: "See starting prices upfront and choose what fits." },
];

// TODO: swap for real customer reviews before launch.
const testimonials = [
  { name: "Ananya R.", event: "Wedding, Hyderabad", quote: "We found the hall, caterer and band in one evening. Booking was effortless." },
  { name: "Rahul M.", event: "50th Anniversary", quote: "Comparing vendors side by side saved us days of phone calls." },
  { name: "Sneha K.", event: "Birthday Party", quote: "Clear prices, quick replies and zero surprises on the day." },
];

const faqs = [
  { q: "How do I book a service?", a: "Browse services, open the one you like and submit the booking form with your event date and guest count. You'll receive a confirmation number." },
  { q: "Can I check on an existing booking?", a: "Yes. Use “Find My Booking” in the menu with your confirmation number to see its latest status." },
  { q: "Is it free to browse and compare?", a: "Absolutely. Exploring providers and comparing services is completely free." },
  { q: "Can I cancel or change a booking?", a: "You can request a cancellation from your booking details. Terms may vary by provider, so check the service page." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Baaraath",
  url: "https://baaraath.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://baaraath.com/services?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const eyebrow = "text-xs font-extrabold tracking-[0.2em] text-[#a16a43]";
const h2 = "mt-2 text-3xl font-black tracking-tight text-[#342433] sm:text-4xl";

export default async function Home() {
  const [categories, services, vendors, bookings] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({
      where: { active: true },
      include: {
        category: { select: { name: true, slug: true } },
        vendor: { select: { name: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.vendor.findMany({ select: { city: true }, distinct: ["city"] }),
    prisma.booking.count(),
  ]);

  const stats = [
    { label: "Services listed", value: services.length + "+", icon: "🎪" },
    { label: "Verified vendors", value: vendors.length + "+", icon: "✓" },
    { label: "Cities covered", value: vendors.length + "", icon: "⌖" },
    { label: "Events planned", value: bookings + "+", icon: "♡" },
  ];

  return (
    // Layout already renders <main>, so use a div here to avoid nested <main>.
    <div className="overflow-x-clip bg-[#fffdf9] text-[#28212b]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ============ HERO ============ */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fff6e8] via-[#fffdf9] to-[#f9eaf1]" />
        <div className="animate-blob pointer-events-none absolute -right-24 -top-20 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#f3d9c5]/60 blur-3xl" />
        <div className="animate-blob pointer-events-none absolute -bottom-32 -left-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#e8c9d7]/55 blur-3xl [animation-delay:-7s]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-28">
          <div className="text-center lg:text-left">
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ead9c6] bg-white/80 px-4 py-2 text-xs font-bold tracking-wide text-[#78445a] shadow-sm backdrop-blur sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b8873b] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#b8873b]" />
                </span>
                India’s celebration marketplace
              </span>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="mx-auto mt-6 max-w-3xl text-[2.6rem] font-black leading-[1.05] tracking-tight text-[#2d1e2b] sm:text-6xl lg:mx-0 lg:text-7xl">
                Book everything for your
                <span className="text-gradient block pb-1">big day, in one place.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#6a5e68] sm:text-lg lg:mx-0">
                Venues, catering, music, priests and planners for weddings, birthdays and every
                occasion worth celebrating. Compare, choose and book with confidence.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <form
                action="/services"
                method="get"
                role="search"
                className="mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-3xl border border-[#eee3da] bg-white p-2 shadow-[0_20px_60px_rgba(83,45,64,0.12)] transition-shadow duration-300 focus-within:shadow-[0_24px_70px_rgba(139,59,94,0.22)] sm:flex-row sm:items-center sm:rounded-full lg:mx-0"
              >
                <label className="flex flex-1 items-center gap-3 px-4 py-2">
                  <span className="sr-only">Search services</span>
                  <span aria-hidden="true" className="text-xl text-[#9a4968]">⌕</span>
                  <input
                    name="q"
                    type="search"
                    autoComplete="off"
                    placeholder="Banquet hall, catering, band…"
                    className="w-full bg-transparent text-sm text-[#302832] outline-none placeholder:text-[#a49aa2]"
                  />
                </label>
                <label className="border-t border-[#f1e9e2] px-4 py-2 sm:border-l sm:border-t-0">
                  <span className="sr-only">Category</span>
                  <select name="category" defaultValue="" className="w-full cursor-pointer bg-transparent text-sm text-[#4b3f49] outline-none">
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="btn-shine min-h-12 rounded-2xl bg-[#55243f] px-8 text-sm font-bold text-white shadow-lg shadow-[#55243f]/25 transition hover:-translate-y-0.5 hover:bg-[#6b2d50] active:translate-y-0 sm:rounded-full"
                >
                  Search
                </button>
              </form>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs lg:justify-start">
                <span className="font-semibold text-[#8b7e88]">Popular:</span>
                {categoryTiles.slice(0, 4).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/services?category=${c.slug}`}
                    className="rounded-full border border-[#eadfd6] bg-white/70 px-3 py-1.5 font-semibold text-[#5f4a58] transition hover:border-[#c7a0ad] hover:bg-white"
                  >
                    {c.icon} {c.name}
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Decorative hero visual */}
          <AnimatedSection delay={250} className="hidden sm:block">
            <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-[#55243f] via-[#7a3557] to-[#b8873b] shadow-[0_30px_80px_rgba(85,36,63,0.35)]" />
              <div className="absolute inset-6 rounded-[2.4rem] border border-white/25" />
              <div className="absolute inset-0 flex items-center justify-center text-[8rem] drop-shadow-2xl">💐</div>
              <div className="animate-float absolute -left-6 top-10 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#3d303c] shadow-xl">🏛️ Banquet Halls</div>
              <div className="animate-float absolute -right-4 top-1/3 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#3d303c] shadow-xl [animation-delay:-2s]">🎸 Live Bands</div>
              <div className="animate-float absolute -left-2 bottom-24 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#3d303c] shadow-xl [animation-delay:-4s]">🍽️ Catering</div>
              <div className="animate-float absolute -bottom-5 right-6 flex items-center gap-3 rounded-2xl bg-[#f3d69a] px-4 py-3 shadow-xl [animation-delay:-1s]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#55243f] text-white">✓</span>
                <span className="text-xs font-extrabold leading-tight text-[#452137]">Booking confirmed<br /><span className="font-semibold opacity-70">Your day is set</span></span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ OCCASION MARQUEE ============ */}
      <section aria-label="Occasions we cover" className="border-y border-[#f0e8e1] bg-[#55243f] py-4 text-[#f3d69a]">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-bold tracking-wide">
          {[0, 1].map((dup) => (
            <ul key={dup} className="flex gap-10" aria-hidden={dup === 1}>
              {occasions.map((o) => (
                <li key={`${dup}-${o}`} className="flex items-center gap-10">
                  {o} <span className="text-white/30">✦</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <AnimatedSection key={s.label} delay={i * 80}>
              <div className="rounded-3xl border border-[#eee7e0] bg-white p-6 text-center shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
                <div className="text-3xl" aria-hidden="true">{s.icon}</div>
                <p className="mt-2 text-3xl font-black text-[#8b3b5e]">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-[#786d76]">{s.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <AnimatedSection>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>EXPLORE BAARAATH</p>
              <h2 className={h2}>Everything your event needs</h2>
            </div>
            <Link href="/services" className="rounded-full border border-[#e8d9df] px-5 py-2.5 text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5]">
              View all services →
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categoryTiles.map((c, i) => (
            <AnimatedSection key={c.slug} delay={i * 70}>
              <Link
                href={`/services?category=${c.slug}`}
                className={`group relative flex h-full min-h-48 flex-col justify-between overflow-hidden rounded-3xl border border-white bg-gradient-to-br ${c.bg} p-5 shadow-[0_4px_18px_rgba(60,38,51,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(60,38,51,0.13)]`}
              >
                <span className="text-5xl transition duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true">{c.icon}</span>
                <div>
                  <h3 className="text-base font-extrabold text-[#3d303c]">{c.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#6e626b]">{c.tag}</p>
                  <span className="mt-3 inline-block text-xs font-extrabold text-[#8b3b5e] transition group-hover:translate-x-1">Explore →</span>
                </div>
              </Link>
            </AnimatedSection>
          ))}
          <AnimatedSection delay={490}>
            <Link
              href="/services"
              className="btn-shine flex h-full min-h-48 flex-col items-center justify-center rounded-3xl bg-[#55243f] p-5 text-center text-white transition duration-300 hover:-translate-y-1.5 hover:bg-[#6b2d50]"
            >
              <span className="text-4xl" aria-hidden="true">✨</span>
              <span className="mt-3 text-base font-extrabold">Browse everything</span>
              <span className="mt-1 text-xs text-white/70">See all services →</span>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="border-y border-[#f0e8e1] bg-[#fbf7f2] py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <p className={eyebrow}>SIMPLE AS 1-2-3</p>
              <h2 className={h2}>From idea to booked in minutes</h2>
            </div>
          </AnimatedSection>
          <ol className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-[#e0c7b3] md:block" aria-hidden="true" />
            {steps.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 120}>
                <li className="relative text-center">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-[0_10px_30px_rgba(83,45,64,0.12)]">
                    <span aria-hidden="true">{s.icon}</span>
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#55243f] text-[11px] font-extrabold text-white">{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold text-[#3d303c]">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#786d76]">{s.text}</p>
                </li>
              </AnimatedSection>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ WHY BAARAATH ============ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <AnimatedSection>
            <p className={eyebrow}>WHY BAARAATH</p>
            <h2 className={h2}>Plan with confidence, not chaos.</h2>
            <p className="mt-4 max-w-md leading-7 text-[#786d76]">
              Stop juggling calls, chats and spreadsheets. Baaraath keeps discovery, comparison and
              booking together so you can focus on the celebration.
            </p>
            <Link
              href="/services"
              className="btn-shine mt-8 inline-flex items-center gap-2 rounded-full bg-[#55243f] px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#55243f]/25 transition hover:-translate-y-0.5 hover:bg-[#6b2d50]"
            >
              Start planning <span aria-hidden="true">→</span>
            </Link>
          </AnimatedSection>

          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <AnimatedSection key={r.title} delay={i * 90}>
                <div className="h-full rounded-3xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(60,38,51,0.10)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7edf1] text-2xl" aria-hidden="true">{r.icon}</span>
                  <h3 className="mt-4 font-extrabold text-[#3d303c]">{r.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#786d76]">{r.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED INSPIRATION ============ */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <AnimatedSection>
          <div className="mb-8">
            <p className={eyebrow}>A LITTLE INSPIRATION</p>
            <h2 className={h2}>Make your occasion yours</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#786d76]">
              Explore popular event needs and start building a plan that suits your style, guest list and budget.
            </p>
          </div>
        </AnimatedSection>
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((item, i) => (
            <AnimatedSection key={item.slug} delay={i * 120}>
              <Link
                href={`/services?category=${item.slug}`}
                className="group block overflow-hidden rounded-3xl border border-[#eee4dd] bg-white shadow-[0_5px_22px_rgba(60,38,51,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(60,38,51,0.10)]"
              >
                <div className={`relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${item.style}`}>
                  <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/70" />
                  <div className="absolute -bottom-20 -left-8 h-48 w-48 rounded-full border border-white/70" />
                  <span className="relative text-7xl transition duration-300 group-hover:scale-110" aria-hidden="true">{item.icon}</span>
                  <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.15em] text-[#75455d]">{item.tag}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-[#3d303c]">{item.title}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-[#786d76]">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#8b3b5e]">
                    Explore options <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ============ FEATURED SERVICES ============ */}
      {services.length > 0 && (
        <section className="border-y border-[#f0e8e1] bg-[#fbf7f2] py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={eyebrow}>TOP PICKS</p>
                <h2 className={h2}>Services our customers love</h2>
                <p className="mt-2 text-sm text-[#786d76]">Handpicked services across top categories and cities.</p>
              </div>
              <Link href="/services" className="rounded-full border border-[#e8d9df] px-4 py-2 text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5]">
                View all services →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => {
                const price = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(Number(service.price));

                return (
                  <AnimatedSection key={service.id} delay={i * 80}>
                    <Link
                      href={`/services/${service.id}`}
                      className="group block overflow-hidden rounded-3xl border border-[#eee7e0] bg-white shadow-[0_2px_12px_rgba(60,38,51,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d8b9c6] hover:shadow-[0_18px_40px_rgba(60,38,51,0.10)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#f9e5d8] via-[#f8eaf0] to-[#efe4f2]">
                        <div className="flex h-full w-full items-center justify-center text-6xl transition duration-500 group-hover:scale-110">🎪</div>
                        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-[#75455d] backdrop-blur">
                          {service.category.name.toUpperCase()}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="line-clamp-1 text-base font-extrabold text-[#3d303c]">{service.title}</h3>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#786d76]">
                          <span aria-hidden="true" className="text-sm">⌖</span>
                          {service.vendor.city}
                          {service.vendor.name && <span className="text-[#e9dfd7]">|</span>}
                          {service.vendor.name && <span>{service.vendor.name}</span>}
                        </p>
                        <div className="mt-4">
                          <span className="text-lg font-black text-[#8b3b5e]">{price}</span>
                          <span className="text-xs text-[#786d76]"> / service</span>
                        </div>
                      </div>
                    </Link>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-[#2f202d] py-20 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold tracking-[0.2em] text-[#f3d69a]">LOVED BY HOSTS</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Celebrations that went perfectly</h2>
            </div>
          </AnimatedSection>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 120}>
                <figure className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:bg-white/10">
                  <div className="text-[#f3d69a]" aria-label="5 out of 5 stars">★★★★★</div>
                  <blockquote className="mt-4 text-sm leading-7 text-white/85">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3d69a] text-sm font-black text-[#55243f]">{t.name[0]}</span>
                    <span className="text-sm">
                      <span className="block font-extrabold">{t.name}</span>
                      <span className="text-white/55">{t.event}</span>
                    </span>
                  </figcaption>
                </figure>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ POPULAR CITIES ============ */}
      <section className="border-b border-[#f0e8e1] bg-[#fbf7f2] py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8">
            <p className={eyebrow}>EXPLORE BY CITY</p>
            <h2 className={h2}>Services in popular cities</h2>
            <p className="mt-2 text-sm text-[#786d76]">Discover trusted providers in cities across India.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {popularCities.map((city, i) => (
              <AnimatedSection key={city} delay={i * 60}>
                <Link
                  href={`/services?city=${encodeURIComponent(city)}`}
                  className="group block rounded-2xl border border-[#eee7e0] bg-white p-4 text-center shadow-[0_4px_18px_rgba(60,38,51,0.04)] transition hover:-translate-y-1 hover:border-[#d8b9c6] hover:shadow-[0_12px_28px_rgba(60,38,51,0.09)]"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7edf1] text-xl text-[#8b3b5e]">
                    <span aria-hidden="true">⌖</span>
                  </div>
                  <h3 className="mt-3 text-sm font-extrabold text-[#3d303c]">{city}</h3>
                  <p className="mt-1 text-xs text-[#9a8e98]">Explore services →</p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <AnimatedSection>
          <div className="text-center">
            <p className={eyebrow}>GOOD TO KNOW</p>
            <h2 className={h2}>Frequently asked questions</h2>
          </div>
        </AnimatedSection>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <AnimatedSection key={f.q} delay={i * 70}>
              <details className="group rounded-2xl border border-[#eee7e0] bg-white px-6 py-5 shadow-[0_2px_12px_rgba(60,38,51,0.03)] open:border-[#d8b9c6] open:shadow-[0_10px_30px_rgba(60,38,51,0.08)]">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-extrabold text-[#3d303c]">
                  {f.q}
                  <span className="faq-plus flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f7edf1] text-lg text-[#8b3b5e] transition-transform duration-300" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-[#786d76]">{f.a}</p>
              </details>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="px-5 pb-20 lg:px-8">
        <AnimatedSection>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#55243f] via-[#6b2d50] to-[#8b3b5e] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <div className="animate-blob pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#f3d69a]/20 blur-3xl" aria-hidden="true" />
            <p className="relative text-xs font-extrabold tracking-[0.2em] text-[#f2d49b]">LET’S START PLANNING</p>
            <h2 className="relative mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Your next celebration deserves a beautiful beginning.
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-white/75 sm:text-lg">
              Browse venues and event services today. It’s free to explore.
            </p>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/services" className="btn-shine inline-flex w-full items-center justify-center rounded-full bg-[#f3d69a] px-8 py-4 text-sm font-extrabold text-[#452137] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#ffe4ae] sm:w-auto">
                Explore Services →
              </Link>
              <Link href="/contact" className="inline-flex w-full items-center justify-center rounded-full border border-white/30 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto">
                Talk to us
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}