"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/bookings/lookup", label: "Find My Booking" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eee7df] bg-[#fffdf9]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Baaraath home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#55243f] text-lg font-black text-[#f7d88b]">
            B
          </span>
          <span className="text-xl font-extrabold tracking-tight text-[#382333]">
            Baaraath
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#5f5660] md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition hover:text-[#8b3b5e] ${
                isActive(link.href) ? "text-[#8b3b5e]" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            href="/location"
            className="hidden items-center gap-2 rounded-full border border-[#e9dfd7] px-4 py-2.5 text-sm font-semibold text-[#514550] transition hover:border-[#c7a0ad] hover:bg-[#fbf4f5] sm:flex"
            aria-label="Set your location"
          >
            <span aria-hidden="true">⌖</span>
            Set Location
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#55243f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#6b2d50]"
          >
            Sign In
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9dfd7] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span aria-hidden="true" className="text-lg">
              {mobileOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[#f1ebe5] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? "bg-[#fbf1f5] text-[#8b3b5e]"
                    : "text-[#514550] hover:bg-[#fbf7f2]"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
