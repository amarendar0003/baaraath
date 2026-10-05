import Link from "next/link";

const services = [
  { icon: "⌂", title: "Banquet halls", text: "Find a welcoming space for every celebration." },
  { icon: "♨", title: "Multi-cuisine", text: "Explore food options your guests will love." },
  { icon: "▤", title: "Catering", text: "Make hosting easier with trusted caterers." },
  { icon: "✿", title: "Decor", text: "Set the scene with thoughtful event decor." },
  { icon: "♫", title: "Music & dance", text: "Bring your celebration to life." },
  { icon: "▣", title: "Photographers", text: "Keep the moments you’ll want to remember." },
];

const reasons = [
  { icon: "✦", title: "Trusted vendors", text: "Explore event services in one convenient place." },
  { icon: "▣", title: "No double booking", text: "See service details before you make a booking." },
  { icon: "◉", title: "Secure & simple", text: "A straightforward way to plan your celebration." },
  { icon: "⌖", title: "Find what’s nearby", text: "Discover venues and services around you." },
  { icon: "★", title: "One place to plan", text: "Bring the important parts of your event together." },
  { icon: "♡", title: "Made for your occasion", text: "Find options for gatherings big and small." },
];

const steps = ["Search", "Choose a date", "Get confirmed", "Celebrate"];

export default function AboutPage() {
  return (
    <div className="bg-[#fffaf5] text-[#35180f]">
      <section
        className="relative isolate flex min-h-[350px] items-center overflow-hidden bg-[#4b2118] bg-cover bg-center px-5 py-16 sm:min-h-[410px] sm:px-10"
        style={{ backgroundImage: "linear-gradient(90deg, rgba(38,16,12,.82), rgba(38,16,12,.22)), url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2000&q=85')" }}
      >
        <div className="mx-auto w-full max-w-6xl text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffd385]">About Baaraath</p>
          <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
            Every celebration deserves a venue that fits.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
            Baaraath brings venues and event services together, so planning your special day feels simple.
          </p>
          <Link href="/services" className="mt-6 inline-flex rounded-lg bg-[#ff7545] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#f26535]">
            Browse services <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:py-16">
        <div className="h-56 rounded-2xl bg-[#ead8c7] bg-cover bg-center shadow-lg sm:h-72" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85')" }} role="img" aria-label="A beautifully arranged celebration venue" />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#e4673f]">Our story</p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">Why we built Baaraath</h2>
          <p className="mt-4 text-sm leading-6 text-[#735e53]">
            Planning a celebration can mean searching across many places. Baaraath makes it easier to discover venues and services, compare your options, and find a good fit for your day.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#735e53]">
            From a family gathering to a wedding, we bring useful event services together so you can spend less time searching and more time looking forward to the occasion.
          </p>
          <p className="mt-4 border-l-2 border-[#ff7545] pl-3 text-sm font-semibold leading-6 text-[#9e4528]">
            One place to find the people and spaces that make your celebration yours.
          </p>
        </div>
      </section>

      <section aria-label="About Baaraath" className="border-y border-[#f2d9c5] bg-[#fff4e9]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[#f2d9c5] sm:grid-cols-4">
          {["Venues & services", "Simple to browse", "Made for celebrations", "Plan in one place"].map((item, index) => (
            <div key={item} className="px-3 py-5 text-center sm:py-6">
              <p className="text-lg font-black text-[#f36b3c] sm:text-xl">{["Many", "Easy", "Any day", "Baaraath"][index]}</p>
              <p className="mt-1 text-[11px] font-medium text-[#735e53] sm:text-xs">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#e4673f]">Explore with Baaraath</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Everything your event needs</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#735e53]">Browse event services in one place and find what suits your occasion.</p>
        <div className="mt-7 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="flex gap-3 border-b border-dashed border-[#edcdb4] py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff0e3] text-lg text-[#f06d3e]" aria-hidden="true">{service.icon}</span>
              <div><h3 className="text-sm font-extrabold">{service.title}</h3><p className="mt-1 text-xs leading-5 text-[#806c61]">{service.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#562311] text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffd385]">A simpler way to plan</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">What you can count on</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Baaraath helps you explore your options and plan your celebration with confidence.</p>
          <div className="mt-7 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason) => (
              <div key={reason.title} className="flex gap-3 border-b border-white/15 py-4">
                <span className="text-lg text-[#ffd385]" aria-hidden="true">{reason.icon}</span>
                <div><h3 className="text-sm font-bold">{reason.title}</h3><p className="mt-1 text-xs leading-5 text-white/70">{reason.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 text-center sm:px-8 sm:py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#e4673f]">Getting started</p>
        <h2 className="mt-2 text-2xl font-black">Booking in four simple steps</h2>
        <p className="mt-2 text-sm text-[#806c61]">Find what you need and get ready to celebrate.</p>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff7545] text-sm font-black text-white">{index + 1}</span>
              <h3 className="mt-3 text-sm font-extrabold">{step}</h3>
              <p className="mt-1 max-w-40 text-xs leading-5 text-[#806c61]">{["Browse venues and services.", "Pick a date that works for you.", "Review your booking details.", "Enjoy your special day."][index]}</p>
            </div>
          ))}
        </div>
        <Link href="/services" className="mt-8 inline-flex rounded-lg bg-[#562311] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#71341e]">Explore services <span aria-hidden="true" className="ml-2">→</span></Link>
      </section>
    </div>
  );
}
