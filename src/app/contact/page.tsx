import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck,
  CircleHelp,
  Headset,
  Mail,
  MapPin,
  ShieldCheck,
  Store,
} from "lucide-react";

const contactOptions = [
  {
    icon: Mail,
    title: "Email us",
    detail: "support@baaraath.com",
    note: "For questions about Baaraath and our services",
    href: "mailto:support@baaraath.com",
    action: "Send an email",
  },
  {
    icon: CalendarCheck,
    title: "Booking help",
    detail: "Manage your booking",
    note: "View your booking details and next steps",
    href: "/dashboard/bookings",
    action: "My bookings",
  },
  {
    icon: MapPin,
    title: "Find services nearby",
    detail: "Explore Baaraath",
    note: "Discover venues and event services in your area",
    href: "/services",
    action: "Browse services",
  },
];

const helpTopics = [
  {
    question: "How can I find a venue or event service?",
    answer: "Browse services on Baaraath and use the available search and filters to explore options for your celebration.",
  },
  {
    question: "Where can I see my booking details?",
    answer: "Sign in and open My Bookings to review your booking information.",
  },
  {
    question: "How do I ask Baaraath for help?",
    answer: "Email support@baaraath.com and include the details of your question so our team can help.",
  },
  {
    question: "Can I list my business on Baaraath?",
    answer: "Event service providers can get started from the vendor registration page.",
  },
];

const commitments = [
  { icon: ShieldCheck, title: "Safer planning", text: "Clear service details help you make informed choices." },
  { icon: Headset, title: "Helpful support", text: "Reach out to the Baaraath team when you need a hand." },
  { icon: Store, title: "Vendor connections", text: "Find event services and providers in one place." },
];

export default function ContactPage() {
  return (
    <main className="bg-[#fffaf5] text-[#35180f]">
      <section className="border-b border-[#f5d9c3] bg-[#fff5eb] px-5 py-10 text-center sm:py-14">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0b482] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b2532d]">
            <CircleHelp size={13} aria-hidden="true" /> Baaraath support & guidance
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Get in touch with Baaraath
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#735e53]">
            Need help with a booking, have a question about a service, or want to work with us? We’re here to help.
          </p>
        </div>
      </section>

      <section aria-label="Contact options" className="mx-auto grid max-w-6xl gap-4 px-5 py-8 sm:grid-cols-3 sm:px-8">
        {contactOptions.map(({ icon: Icon, title, detail, note, href, action }) => (
          <article key={title} className="rounded-xl border border-[#f2c9a5] bg-white p-5 shadow-[0_4px_14px_rgba(96,54,25,0.05)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff0e3] text-[#e4673f]">
              <Icon size={18} aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-sm font-extrabold">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-[#9b472a]">{detail}</p>
            <p className="mt-1 min-h-10 text-xs leading-5 text-[#806c61]">{note}</p>
            <Link href={href} className="mt-3 inline-flex items-center gap-1 rounded-md border border-[#f0b482] px-3 py-1.5 text-[11px] font-bold text-[#9b472a] transition hover:bg-[#fff5eb]">
              {action} <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-9 sm:px-8">
        <div className="mb-4 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e4673f]">We’re here to help</p>
          <h2 className="mt-1 text-xl font-black">Connect with the right team</h2>
          <p className="mt-1 text-xs text-[#806c61]">Choose the option that best matches what you need.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: CalendarCheck, title: "Booking questions", text: "Need help finding booking details or understanding the next step? Start with My Bookings.", label: "Go to My Bookings", href: "/dashboard/bookings" },
            { icon: Store, title: "Become a vendor", text: "Offer venues or event services? Register your business with Baaraath.", label: "Vendor registration", href: "/vendor/register" },
            { icon: Headset, title: "General support", text: "For other questions, email the Baaraath support team and tell us how we can help.", label: "Email support", href: "mailto:support@baaraath.com" },
          ].map(({ icon: Icon, title, text, label, href }) => (
            <article key={title} className="rounded-xl border border-[#f2c9a5] bg-white p-4">
              <div className="flex items-center gap-2 text-[#e4673f]"><Icon size={17} aria-hidden="true" /><h3 className="text-sm font-extrabold text-[#35180f]">{title}</h3></div>
              <p className="mt-2 min-h-10 text-xs leading-5 text-[#806c61]">{text}</p>
              <Link href={href} className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#a54f2c] hover:underline">{label} <ArrowUpRight size={12} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-5 rounded-xl bg-[#562311] text-white sm:mx-auto sm:max-w-6xl">
        <div className="px-5 py-6 sm:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffd385]">Our service commitments</p>
          <h2 className="mt-1 text-lg font-black">A little more confidence at every step</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {commitments.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-2.5">
                <span className="mt-0.5 text-[#ffd385]"><Icon size={17} aria-hidden="true" /></span>
                <div><h3 className="text-xs font-bold">{title}</h3><p className="mt-1 text-[11px] leading-5 text-white/70">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e4673f]">Helpful information</p>
          <h2 className="mt-1 text-xl font-black">Frequently asked questions</h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {helpTopics.map(({ question, answer }) => (
            <details key={question} className="group rounded-lg border border-[#f2c9a5] bg-white p-4">
              <summary className="cursor-pointer text-xs font-bold marker:text-[#e4673f]">{question}</summary>
              <p className="mt-2 text-xs leading-5 text-[#806c61]">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-5 mb-10 rounded-xl border border-[#f2c9a5] bg-white px-5 py-6 text-center sm:mx-auto sm:max-w-6xl sm:px-8">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e4673f]">Plan with Baaraath</p>
        <h2 className="mt-1 text-xl font-black">Find something for your celebration</h2>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#806c61]">
          Browse venues and event services, compare what works for you, and plan your day with Baaraath.
        </p>
        <Link href="/services" className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#f0b482] px-4 py-2 text-[11px] font-bold text-[#9b472a] transition hover:bg-[#fff5eb]">
          Browse services <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
