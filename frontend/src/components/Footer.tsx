"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { href: "/services", label: "Browse Services" },
      { href: "/bookings/lookup", label: "Find My Booking" },
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Use" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-[#2f202d] text-white" role="contentinfo">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
              aria-label="Baaraath home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-base font-black text-[#f3d69a]">
                B
              </span>
              <span className="text-lg font-extrabold">Baaraath</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
              Discover venues and event services for the moments that matter.
              Plan your celebration with trusted providers across India.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-extrabold tracking-wide text-[#f3d69a]">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-sm transition ${
                        pathname === link.href
                          ? "text-[#f3d69a]"
                          : "text-white/65 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-extrabold tracking-wide text-[#f3d69a]">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li>support@baaraath.com</li>
              <li>+91 98765 43210</li>
              <li>Hyderabad, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/45">
          © {new Date().getFullYear()} Baaraath. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
