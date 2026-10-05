import Link from "next/link";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Services", href: "/services" },
      { label: "Locations", href: "/locations" },
      { label: "Find Booking", href: "/bookings/find" },
    ],
  },
  {
    title: "For Providers",
    links: [
      { label: "Become a Provider", href: "/vendor/register" },
      { label: "Provider Login", href: "/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#030719] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Baaraath home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff9800] text-lg font-black text-white">
                B
              </span>
              <span className="text-xl font-extrabold">Baaraath</span>
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#91a8c4]">
              Discover and book venues, catering, entertainment, hotels, and other services for your special occasions.
            </p>
          </div>

          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-base font-bold">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[#91a8c4] transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-9 border-t border-white/10 pt-6 text-sm text-[#7188a4]">
          © {new Date().getFullYear()} Baaraath. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
