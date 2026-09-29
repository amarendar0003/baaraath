import Link from "next/link";

const categories = [
  { name: "Banquet Halls", slug: "banquet_hall", icon: "🏛️", color: "bg-rose-50" },
  { name: "Music Bands", slug: "music_band", icon: "🎸", color: "bg-amber-50" },
  { name: "Catering", slug: "catering", icon: "🍽️", color: "bg-orange-50" },
  { name: "Hotels", slug: "hotels", icon: "🏨", color: "bg-sky-50" },
  { name: "Dancing", slug: "dancing", icon: "💃", color: "bg-fuchsia-50" },
  { name: "Priests", slug: "priests", icon: "🪔", color: "bg-yellow-50" },
  { name: "Event Planning", slug: "event_management", icon: "🎪", color: "bg-emerald-50" },
];

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

const reasons = [
  {
    icon: "✓",
    title: "Vetted providers",
    description: "Browse vendor profiles and details before you enquire.",
  },
  {
    icon: "▣",
    title: "Booking in one place",
    description: "Keep your event enquiries and bookings organised.",
  },
  {
    icon: "⌖",
    title: "Search by location",
    description: "Explore options in your city or chosen area.",
  },
  {
    icon: "♡",
    title: "Plan with confidence",
    description: "Compare services and choose what fits your event.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#28212b]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fff8ed] via-[#fffdf9] to-[#f8edf2]" />
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-[#f3d9c5]/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-96 w-96 rounded-full bg-[#e8c9d7]/45 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e9d7c5] bg-white/75 px-4 py-2 text-xs font-bold tracking-wide text-[#78445a] shadow-sm sm:text-sm">
              <span className="text-[#b8873b]">✦</span>
              YOUR CELEBRATION, BEAUTIFULLY PLANNED
            </div>

            <h1 className="mx-auto max-w-2xl text-4xl font-black leading-[1.12] tracking-tight text-[#342433] sm:text-5xl lg:mx-0 lg:text-6xl">
              Find the perfect place
              <span className="block text-[#9a4968]">for your big moments.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#6e626b] sm:text-lg lg:mx-0">
              Discover venues and event services for weddings, birthdays,
              family gatherings and every occasion worth celebrating.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-[#625661] lg:justify-start">
              <span><span className="mr-1.5 text-[#a66a39]">✓</span>Explore providers</span>
              <span><span className="mr-1.5 text-[#a66a39]">✓</span>Compare services</span>
              <span><span className="mr-1.5 text-[#a66a39]">✓</span>Plan your event</span>
            </div>

            {/* Search form */}
            <form
              action="/services"
              method="get"
              className="mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl border border-[#eee3da] bg-white p-2 shadow-[0_18px_50px_rgba(83,45,64,0.10)] sm:flex-row sm:items-center lg:mx-0"
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

            <p className="mt-3 text-xs text-[#8b7e88]">
              Start with a service name, category or location.
            </p>
          </div>

          {/* Decorative hero artwork: CSS and emoji, no image files required */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-4 top-12 h-24 w-24 rounded-full border border-[#e8c99e] sm:-left-7" />
            <div className="absolute -right-2 bottom-8 h-28 w-28 rounded-full bg-[#f0d8df] sm:-right-5" />

            <div className="relative rounded-[2rem] border border-white/80 bg-white/65 p-4 shadow-[0_24px_70px_rgba(83,45,64,0.12)] backdrop-blur sm:p-6">
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
        </div>
      </section>

      {/* Category browsing */}
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
          {categories.map((category) => (
            <a
              key={category.slug}
              href={`/services?category=${category.slug}`}
              className="group rounded-2xl border border-[#eee7e0] bg-white p-4 text-center shadow-[0_4px_18px_rgba(60,38,51,0.04)] transition hover:-translate-y-1 hover:border-[#d8b9c6] hover:shadow-[0_12px_28px_rgba(60,38,51,0.09)]"
            >
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${category.color} text-3xl transition group-hover:scale-105`}>
                <span aria-hidden="true">{category.icon}</span>
              </div>
              <h3 className="mt-3 text-sm font-extrabold text-[#3d303c]">
                {category.name}
              </h3>
              <p className="mt-1 text-xs text-[#9a8e98]">Explore →</p>
            </a>
          ))}
        </div>
      </section>

      {/* Featured sections */}
      <section className="border-y border-[#f0e8e1] bg-[#fbf7f2] py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
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
            {featured.map((item) => (
              <a
                key={item.slug}
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
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">
            SIMPLE EVENT DISCOVERY
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
            Everything begins with a good plan
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#786d76]">
            Search, explore and organise your event requirements from one place.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <div key={reason.title} className="text-center">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7edf1] text-2xl font-bold text-[#8b3b5e]">
                {reason.icon}
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#b98b4b] text-[10px] font-extrabold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-4 font-extrabold text-[#3d303c]">{reason.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#786d76]">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
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
    </main>
  );
}