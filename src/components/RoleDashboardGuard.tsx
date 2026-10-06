"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appPath } from "@/lib/app-path";

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt?: string;
};

type MeResponse = {
  user?: SessionUser;
  message?: string;
  error?: string;
};

export default function RoleDashboardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkRole() {
      try {
        const response = await fetch(appPath("/api/auth/me"), {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          if (!cancelled) {
            router.replace("/login");
          }
          return;
        }

        const data = (await response.json()) as MeResponse;

        const role = data.user?.role;

        if (!role) {
          if (!cancelled) {
            router.replace("/login");
          }
          return;
        }

        /*
         * CUSTOMER DASHBOARD
         * Only CUSTOMER can remain on /dashboard.
         */
        if (role === "CUSTOMER") {
          if (!cancelled) {
            setAllowed(true);
            setChecking(false);
          }
          return;
        }

        /*
         * ADMIN
         * Never allow ADMIN to stay on customer dashboard.
         */
        if (role === "ADMIN") {
          if (pathname !== "/admin/dashboard") {
            router.replace("/admin/dashboard");
          }
          return;
        }

        /*
         * PROVIDER
         * Provider/vendor users must go to vendor dashboard.
         */
        if (role === "PROVIDER") {
          if (pathname !== "/vendor/dashboard") {
            router.replace("/vendor/dashboard");
          }
          return;
        }

        /*
         * Any unknown role:
         * send user back to login rather than exposing
         * the customer dashboard.
         */
        if (!cancelled) {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Role dashboard guard error:", error);

        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    checkRole();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking || !allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <h1 className="mt-5 text-lg font-bold text-slate-900">
            Checking your dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we verify your account access.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
