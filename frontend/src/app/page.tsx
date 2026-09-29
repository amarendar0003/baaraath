import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AnimatedSection from "@/components/AnimatedSection";

const popularCities = [
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
];

const testimonials = [
  {
    name: "Ananya & Rohan",
    role: "Wedding in Hyderabad",
    body: "We found our banquet hall and caterer within a week. Baaraath made the entire process so simple.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Birthday celebration, Mumbai",
    body: "Comparing vendors and reading reviews helped us choose the perfect band for our evening.",
    rating: 5,
  },
  {
    name: "Vikram Patel",
    role: "Corporate event, Bangalore",
    body: "The booking flow was smooth and transparent. No hidden surprises, just great service.",
    rating: 5,
  },
];

const steps = [
  {
    title: "Search services",
    description: "Find venues, caterers, planners and more by category or city.",
    icon: "⌕",
  },
  {
    title: "Compare providers",
    description: "View profiles, pricing and reviews to choose what fits your event.",
    icon: "▣",
  },
  {
    title: "Book with confidence",
    description: "Enquire and book directly. Keep everything organised in one place.",
    icon: "✓",
  },
];

export default async function Home() {
  const [categories, services, vendors, bookings] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { services: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      where: { active: true },
      include: {
        category: { select: { name: true, slug: true } },
        vendor: { select: { name: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.vendor.findMany({
      select: { city: true },
      distinct: ["city"],
    }),
    prisma.booking.count(),
  ]);

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.slug, { name: c.name, count: c._count.services }])
  );

  const categoryVisual: Record<string, { icon: string; color: string }> = {
    banquet_hall: { icon: "🏛️", color: "bg-rose-50" },
    music_band: { icon: "🎸", color: "bg-amber-50" },
    catering: { icon: "🍽️", color: "bg-orange-50" },
    hotels: { icon: "🏨", color: "bg-sky-50" },
    dancing: { icon: "💃", color: "bg-fuchsia-50" },
    priests: { icon: "🪔", color: "bg-yellow-50" },
    event_management: { icon: "🎪", color: "bg-emerald-50" },
  };

  const fallbackCategoryVisual = { icon: "🎪", color: "bg-rose-50" };

  const featured = [
    {
      title: "Beautiful venues",
      description: "Find a space that feels just right for your celebration.",
      slug: "banquet_hall",
      icon: "🏰",
      style: "from-rose-100 via-orange-50 to-amber-100",
      tag: "VENUES",
    },
    {
      title: "Food worth celebrating",
      description: "Discover catering teams for intimate and grand occasions.",
      slug: "catering",
      icon: "🍲",
      style: "from-amber-100 via-yellow-50 to-orange-100",
      tag: "CATERING",
    },
    {
      title: "Make it unforgettable",
      description: "Bring your event together with experienced planners.",
      slug: "event_management",
      icon: "✨",
      style: "from-violet-100 via-fuchsia-50 to-rose-100",
      tag: "EVENT PLANNING",
    },
  ];

  const stats = [
    { label: "Services listed", value: services.length + "+", icon: "🎪" },
    { label: "Verified vendors", value: vendors.length + "+", icon: "✓" },
    { label: "Cities covered", value: vendors.length + "", icon: "⌖" },
    { label: "Events planned", value: bookings + "+", icon: "♡" },
  ];

  const featuredServices = services.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#342433]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fff8ed] via-[#fffdf9] to-[#f8edf2]" />
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-[#f3d9c5]/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-96 w-96 rounded-full bg-[#e8c9d7]/45 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="text-center lg:text-left">
            <AnimatedSection>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e9d7c5] bg-white/75 px-4 py-2 text-xs font-bold tracking-wide text-[#78445a] shadow-sm sm:text-sm">
                <span className="text-[#b8873b]">✦</span>
                YOUR CELEBRATION, BEAUTIFULLY PLANNED
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="mx-auto max-w-2xl text-4xl font-black leading-[1.12] tracking-tight text-[#342433] sm:text-5xl lg:mx-0 lg:text-6xl">
                Find the perfect place
                <span className="block text-[#9a4968]">for your big moments.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#6e626b] sm:text-lg lg:mx-0">
                Discover venues and event services for weddings, birthdays,
                family gatherings and every occasion worth celebrating.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-[#625661] lg:justify-start">
                <span><span className="mr-1.5 text-[#a66a39]">✓</span>Explore providers</span>
                <span><span className="mr-1.5 text-[#a66a39]">✓</span>Compare services</span>
                <span><span className="mr-1.5 text-[#a66a39]">✓</span>Plan your event</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <form
                action="/services"
                method="get"
                className="mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl border border-[#eee3da] bg-white p-2 shadow-[0_18px_50px_rgba(83,45,64,0.10)] transition-all duration-300 hover:shadow-[0_24px_60px_rgba(83,45,64,0.14)] sm:flex-row sm:items-center lg:mx-0"
              >
                <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                  <span className="text-2xl text-[#9a4968]" aria-hidden="true">⌕</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-[#3d303c]">
                      What are you looking for?
                    </span>
                    <input
                      name="q"
                      type="search"
                      placeholder="Try banquet hall, catering, music…"
                      className="mt-1 w-full border-0 bg-transparent text-sm text-[#302832] outline-none placeholder:text-[#a49aa2]"
                    />
                  </span>
                </label>
                <button
                  type="submit"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#55243f] px-8 text-sm font-bold text-white transition hover:bg-[#6b2d50]"
                >
                  <span aria-hidden="true">⌕</span>
                  Search Services
                </button>
              </form>
            </AnimatedSection>

            <AnimatedSection delay={500}>
              <p className="mt-3 text-xs text-[#8b7e88]">
                Start with a service name, category or location.
              </p>
            </AnimatedSection>
          </div>

          {/* Decorative hero artwork */}
          <AnimatedSection delay={200}>
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -left-4 top-12 h-24 w-24 rounded-full border border-[#e8c99e] sm:-left-7" />
              <div className="absolute -right-2 bottom-8 h-28 w-28 rounded-full bg-[#f0d8df] sm:-right-5" />

              <div className="relative rounded-[2rem] border border-white/80 bg-white/65 p-4 shadow-[0_24px_70px_rgba(83,45,64,0.12)] backdrop-blur sm:p-6 transition-transform duration-500 hover:scale-[1.01]">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-[#f9e5d8] via-[#f8eaf0] to-[#efe4f2] p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-[#75455d]">
                      MAKE IT SPECIAL
                    </span>
                    <span className="text-xl text-[#a9783f]" aria-hidden="true">✦</span>
                  </div>

                  <div className="flex min-h-[250px] items-center justify-center sm:min-h-[310px]">
                    <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-white/70 bg-white/35 sm:h-64 sm:w-64">
                      <div className="absolute inset-5 rounded-full border border-white/80" />
                      <div className="absolute inset-10 rounded-full bg-white/45" />
                      <div className="relative text-center">
                        <div className="text-7xl drop-shadow-sm sm:text-8xl" aria-hidden="true">
                          💐
                        </div>
                        <div className="mt-2 text-sm font-extrabold tracking-wide text-[#613b50]">
                          Moments to remember
                        </div>
                      </div>
                      <span className="absolute left-2 top-12 text-2xl" aria-hidden="true">✧</span>
                      <span className="absolute bottom-10 right-3 text-xl" aria-hidden="true">✦</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/75 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-[#4e3b49]">Your event starts here</p>
                      <p className="mt-1 text-[11px] text-[#857582]">Explore services for your day</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#55243f] text-lg text-white" aria-hidden="true">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <AnimatedSection>
        <section className="border-y border-[#f0e8e1] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <AnimatedSection key={stat.label} delay={index * 80}>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl">{stat.icon}</div>
                    <p className="mt-2 text-2xl font-black text-[#55243f] sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#786d76] sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Categories */}
      <AnimatedSection>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">
                EXPLORE BAARAATH
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
                Browse by category
              </h2>
              <p className="mt-2 text-sm text-[#786d76]">
                Find the services you need to bring your event together.
              </p>
            </div>
            <Link
              href="/services"
              className="rounded-full border border-[#e8d9df] px-4 py-2 text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5]"
            >
              View all services →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {categories.map((category, index) => {
              const info = categoryMap[category.slug] || { name: category.name, count: 0 };
              const visual = categoryVisual[category.slug] || fallbackCategoryVisual;
              return (
                <AnimatedSection key={category.slug} delay={index * 80}>
                  <Link
                    href={`/services?category=${category.slug}`}
                    className="group rounded-2xl border border-[#eee7e0] bg-white p-4 text-center shadow-[0_4px_18px_rgba(60,38,51,0.04)] transition hover:-translate-y-1 hover:border-[#d8b9c6] hover:shadow-[0_12px_28px_rgba(60,38,51,0.09)]"
                  >
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${visual.color} text-3xl transition group-hover:scale-105`}>
                      <span aria-hidden="true">{visual.icon}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-extrabold text-[#3d303c]">
                      {info.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#9a8e98]">
                      {info.count > 0 ? `${info.count} services` : "Explore →"}
                    </p>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </section>
      </AnimatedSection>

      {/* How it works */}
      <AnimatedSection>
        <section className="border-y border-[#f0e8e1] bg-[#fbf7f2] py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">
                HOW IT WORKS
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
                Planning your event in 3 simple steps
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#786d76]">
                From search to booking, we keep it simple and transparent.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((step, index) => (
                <AnimatedSection key={step.title} delay={index * 120}>
                  <div className="relative rounded-3xl border border-[#eee7e0] bg-white p-6 text-center shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#55243f] text-sm font-black text-white">
                        {index + 1}
                      </span>
                    </div>
                    <div className="mt-4 text-4xl">{step.icon}</div>
                    <h3 className="mt-4 font-extrabold text-[#3d303c]">{step.title}</h3>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#786d76]">
                      {step.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Featured inspiration */}
      <AnimatedSection>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">
              A LITTLE INSPIRATION
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
              Make your occasion yours
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#786d76]">
              Explore popular event needs and start building a plan that suits
              your style, guest list and budget.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((item, index) => (
              <AnimatedSection key={item.slug} delay={index * 120}>
                <Link
                  href={`/services?category=${item.slug}`}
                  className="group overflow-hidden rounded-3xl border border-[#eee4dd] bg-white shadow-[0_5px_22px_rgba(60,38,51,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(60,38,51,0.10)]"
                >
                  <div className={`relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${item.style}`}>
                    <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/70" />
                    <div className="absolute -bottom-20 -left-8 h-48 w-48 rounded-full border border-white/70" />
                    <span className="relative text-7xl transition duration-300 group-hover:scale-110" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.15em] text-[#75455d]">
                      {item.tag}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-[#3d303c]">
                      {item.title}
                    </h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-[#786d76]">
                      {item.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#8b3b5e]">
                      Explore options <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Featured Services */}
      <AnimatedSection>
        <section className="border-y border-[#f0e8e1] bg-[#fbf7f2] py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">
                  TOP PICKS
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
                  Services our customers love
                </h2>
                <p className="mt-2 text-sm text-[#786d76]">
                  Handpicked services across top categories and cities.
                </p>
              </div>
              <Link
                href="/services"
                className="rounded-full border border-[#e8d9df] px-4 py-2 text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5]"
              >
                View all services →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service, index) => {
                const formattedPrice = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(Number(service.price));

                return (
                  <AnimatedSection key={service.id} delay={index * 80}>
                    <Link
                      href={`/services/${service.id}`}
                      className="group overflow-hidden rounded-3xl border border-[#eee7e0] bg-white shadow-[0_2px_12px_rgba(60,38,51,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d8b9c6] hover:shadow-[0_18px_40px_rgba(60,38,51,0.10)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#f9e5d8] via-[#f8eaf0] to-[#efe4f2]">
                        <div className="flex h-full w-full items-center justify-center text-6xl transition duration-500 group-hover:scale-110">
                          🎪
                        </div>
                        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-[#75455d] backdrop-blur">
                          {service.category.name.toUpperCase()}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-extrabold text-[#3d303c] line-clamp-1">
                          {service.title}
                        </h3>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#786d76]">
                          <span aria-hidden="true" className="text-sm">⌖</span>
                          {service.vendor.city}
                          {service.vendor.name && <span className="text-[#e9dfd7]">|</span>}
                          {service.vendor.name && <span>{service.vendor.name}</span>}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-lg font-black text-[#8b3b5e]">
                              {formattedPrice}
                            </span>
                            <span className="text-xs text-[#786d76]"> / service</span>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-[#fbf7f2] px-2.5 py-1">
                            <span aria-hidden="true" className="text-sm text-[#b8873b]">
                              ★
                            </span>
                            <span className="text-sm font-extrabold text-[#3d303c]">
                              {Number(service.price) > 0 ? "New" : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">
              CUSTOMER STORIES
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
              Loved by event planners across India
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <AnimatedSection key={item.name} delay={index * 120}>
                <div className="rounded-3xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
                  <div className="flex items-center gap-1 text-[#b8873b]">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <span key={i} aria-hidden="true">★</span>
                    ))}
                  </div>
                  <p className='mt-4 text-sm leading-6 text-[#5f5660]'>{item.body}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbf7f2] text-sm font-black text-[#8b3b5e]">
                      {item.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#3d303c]">{item.name}</p>
                      <p className="text-xs text-[#786d76]">{item.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Popular Cities */}
      <AnimatedSection>
        <section className="border-y border-[#f0e8e1] bg-[#fbf7f2] py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-8">
              <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">
                EXPLORE BY CITY
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
                Services in popular cities
              </h2>
              <p className="mt-2 text-sm text-[#786d76]">
                Discover trusted providers in cities across India.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {popularCities.map((city, index) => (
                <AnimatedSection key={city} delay={index * 60}>
                  <Link
                    href={`/services?city=${encodeURIComponent(city)}`}
                    className="group rounded-2xl border border-[#eee7e0] bg-white p-4 text-center shadow-[0_4px_18px_rgba(60,38,51,0.04)] transition hover:-translate-y-1 hover:border-[#d8b9c6] hover:shadow-[0_12px_28px_rgba(60,38,51,0.09)]"
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
      </AnimatedSection>

      {/* Call to action */}
      <AnimatedSection>
        <section className="px-5 pb-16 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#55243f] px-6 py-10 text-center text-white sm:px-12 sm:py-14">
            <p className="text-xs font-extrabold tracking-[0.2em] text-[#f2d49b]">
              LET’S START PLANNING
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-black tracking-tight sm:text-4xl">
              Your next celebration deserves a beautiful beginning.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Browse available event services and discover options for your
              special occasion.
            </p>
            <Link
              href="/services"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[#f3d69a] px-7 py-3 text-sm font-extrabold text-[#452137] transition hover:bg-[#ffe4ae]"
            >
              Explore Services <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </AnimatedSection>
    </main>
  );
}
