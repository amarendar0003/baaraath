import Link from "next/link";
import {
  CalendarCheck,
  Camera,
  ChefHat,
  Music2,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";

const services = [
  { icon: PartyPopper, title: "Banquet halls", text: "Find a welcoming space for every celebration." },
  { icon: Utensils, title: "Catering", text: "Explore food options your guests will love." },
  { icon: Sparkles, title: "Decor", text: "Set the scene with thoughtful event decor." },
  { icon: Music2, title: "Music & dance", text: "Bring your celebration to life." },
  { icon: Camera, title: "Photography", text: "Keep the moments you will want to remember." },
  { icon: ChefHat, title: "Event services", text: "Discover the details that make a day special." },
];

const reasons = [
  { icon: ShieldCheck, title: "Trusted choices", text: "Explore event services in one convenient place." },
  { icon: CalendarCheck, title: "Easy to plan", text: "Compare options and make a booking that suits your date." },
  { icon: Sparkles, title: "Made for celebrations", text: "Find ideas and services for gatherings big and small." },
];

export default function AboutPage() {
  return (
    <main className="bg-[#f8fafc] text-[#0f172a]">
      <section
        className="flex min-h-[360px] items-center bg-[#0f172a] bg-cover bg-center px-5 py-16 sm:min-h-[420px] sm:px-10"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(2,6,23,.88), rgba(2,6,23,.2)), url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2000&q=85')",
        }}
      >
        <div className="mx-auto w-full max-w-6xl text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#fcd34d]">About Baaraath</p>
          <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
            Every celebration deserves a venue that fits.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
            Baaraath brings venues and event services together, so planning your special day feels simple.
          </p>
          <Link
            href="/services"
            className="mt-6 inline-flex rounded-lg bg-[#f59e0b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d97706]"
          >
            Browse services <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:py-16">
        <div
          role="img"
          aria-label="A beautifully arranged celebration venue"
          className="h-56 rounded-2xl bg-[#e2e8f0] bg-cover bg-center shadow-lg sm:h-72"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85')",
          }}
        />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d97706]">Our story</p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">Why we built Baaraath</h2>
          <p className="mt-4 text-sm leading-6 text-[#475569]">
            Planning a celebration can mean searching across many places. Baaraath makes it easier to discover venues and services, compare your options, and find a good fit for your day.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#475569]">
            From a family gathering to a wedding, we bring useful event services together so you can spend less time searching and more time looking forward to the occasion.
          </p>
          <p className="mt-4 border-l-2 border-[#f59e0b] pl-3 text-sm font-semibold leading-6 text-[#b45309]">
            One place to find the people and spaces that make your celebration yours.
          </p>
        </div>
      </section>

      <section className="border-y border-[#e2e8f0] bg-[#fff7ed]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[#e2e8f0] sm:grid-cols-4">
          {[
            ["Venues", "Explore local options"],
            ["Services", "Plan in one place"],
            ["Your day", "Made for every occasion"],
            ["Baaraath", "Here to help you plan"],
          ].map(([heading, caption]) => (
            <div key={heading} className="px-3 py-5 text-center sm:py-6">
              <p className="text-lg font-black text-[#f59e0b] sm:text-xl">{heading}</p>
              <p className="mt-1 text-[11px] font-medium text-[#475569] sm:text-xs">{caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d97706]">Explore with Baaraath</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Everything your event needs</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
          Browse event services in one place and find what suits your occasion.
        </p>
        <div className="mt-7 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 border-b border-dashed border-[#e2e8f0] py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fffbeb] text-[#d97706]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#64748b]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#fcd34d]">A simpler way to plan</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">What you can count on</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Baaraath helps you explore your options and plan your celebration with confidence.
          </p>
          <div className="mt-7 grid gap-x-8 sm:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3 border-b border-white/15 py-4">
                <Icon size={19} className="shrink-0 text-[#fcd34d]" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/70">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 text-center sm:px-8 sm:py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#d97706]">Getting started</p>
        <h2 className="mt-2 text-2xl font-black">Booking in four simple steps</h2>
        <p className="mt-2 text-sm text-[#64748b]">Find what you need and get ready to celebrate.</p>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {["Search", "Choose a date", "Get confirmed", "Celebrate"].map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f59e0b] text-sm font-black text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 text-sm font-extrabold">{step}</h3>
              <p className="mt-1 max-w-40 text-xs leading-5 text-[#64748b]">
                {["Browse venues and services.", "Pick a date that works for you.", "Review your booking details.", "Enjoy your special day."][index]}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/services"
          className="mt-8 inline-flex rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1e293b]"
        >
          Explore services <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </section>
    </main>
  );
}
