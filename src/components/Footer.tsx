import Link from "next/link";

const services = [
  { label: "Banquet Hall", href: "/services?category=banquet_hall" },
  { label: "Catering", href: "/services?category=catering" },
  { label: "Dancing", href: "/services?category=dancing" },
  { label: "Event Management", href: "/services?category=event_management" },
  { label: "Hotels", href: "/services?category=hotels" },
  { label: "Music Band", href: "/services?category=music_band" },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Find My Booking", href: "/bookings/find" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#030719] text-white">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.7fr_1.1fr_0.9fr_1.25fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Baaraath home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff9800] text-lg font-black text-white">
                B
              </span>
              <span className="text-xl font-extrabold">Baaraath</span>
            </Link>
            <p className="mt-3 max-w-lg text-sm leading-5 text-[#91a8c4]">
              India&apos;s dedicated platform for booking verified banquet halls,
              event management, catering, live music bands, mandaps, priests,
              and hotels.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[#91a8c4]">
              <li><span className="mr-2 text-[#ff9800]">☎</span>Helpline: <a className="font-semibold hover:text-white" href="tel:+919151000254">+91 9151000254</a></li>
              <li><span className="mr-2 text-[#ff9800]">✉</span>Support: <a className="font-semibold hover:text-white" href="mailto:support@baaraath.com">support@baaraath.com</a></li>
              <li><span className="mr-2 text-[#ff9800]">⌖</span>Hyderabad, Telangana, India</li>
            </ul>
          </div>

          <nav aria-label="Explore services">
            <h2 className="text-base font-bold">Explore Services</h2>
            <ul className="mt-3 space-y-2">
              {services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[#91a8c4] transition hover:text-white">
                    <span className="mr-2 text-[#ff9800]">›</span>{link.label}
                  </Link>
                </li>
              ))}
              <li><Link href="/services" className="text-sm font-semibold text-[#ff9800] hover:text-white">→ View All Services →</Link></li>
            </ul>
          </nav>

          <nav aria-label="Quick links">
            <h2 className="text-base font-bold">Quick Links</h2>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#91a8c4] transition hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-base font-bold">For Venue Owners</h2>
            <p className="mt-3 text-sm leading-5 text-[#91a8c4]">
              Grow your business by listing your banquet hall, catering service,
              or event team on Baaraath.
            </p>
            <p className="mt-2 text-sm text-[#91a8c4]">If you want to become a vendor, reach us at:</p>
            <a href="mailto:partners@baaraath.com" className="mt-2 inline-flex rounded-lg border border-[#ff9800]/50 bg-[#ff9800]/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#ff9800]/20">
              <span className="mr-2 text-[#ff9800]">✉</span>partners@baaraath.com
            </a>
            <Link href="/vendor/register" className="mt-2 block text-sm font-semibold text-[#ff9800] hover:text-white">List your business →</Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-[#7188a4] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} <strong className="font-semibold">Baaraath</strong> All rights reserved.</p>
          <p>Banquet Halls · Marriage Mandaps · Music Bands · Catering · Hotels &amp; more across India</p>
        </div>
      </div>
    </footer>
  );
}
