import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

const adminLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
  },
  {
    href: "/admin/users",
    label: "Users",
  },
  {
    href: "/admin/providers",
    label: "Providers",
  },
  {
    href: "/admin/services",
    label: "Services",
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
  },
  {
    href: "/admin/categories",
    label: "Categories",
  },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 flex-col justify-center gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:py-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Baaraath
              </p>
              <h1 className="text-lg font-bold text-slate-900">
                Administration
              </h1>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}