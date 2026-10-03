"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
} from "lucide-react";

type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  vendor: {
    id: string;
    name: string;
    city: string;
  } | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, role]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (role !== "ALL") {
        params.set("role", role);
      }

      const response = await fetch(
        `/api/admin/users?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (response.status === 403) {
        window.location.href = "/dashboard";
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load users.");
      }

      setUsers(result.users || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Administration
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                Users
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Search and review Baaraath user accounts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs text-slate-500">
                Matching users
              </p>

              <p className="mt-1 text-xl font-bold text-slate-950">
                {users.length}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or phone..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="ALL">All roles</option>
              <option value="CUSTOMER">Customers</option>
              <option value="PROVIDER">Providers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1.5fr] md:gap-4">
            <span>User</span>
            <span>Contact</span>
            <span>Role</span>
            <span>Provider</span>
            <span>Joined</span>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse bg-white"
                />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />

              <h2 className="mt-4 font-semibold text-slate-900">
                No users found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or role filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function UserRow({ user }: { user: User }) {
  return (
    <div className="px-5 py-5 hover:bg-slate-50">
      <div className="grid gap-4 md:grid-cols-[2fr_2fr_1fr_1fr_1.5fr] md:items-center md:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
            {user.role === "ADMIN" ? (
              <ShieldCheck className="h-5 w-5 text-slate-600" />
            ) : user.role === "PROVIDER" ? (
              <Store className="h-5 w-5 text-slate-600" />
            ) : (
              <UserRound className="h-5 w-5 text-slate-600" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-950">
              {user.fullName}
            </p>

            <p className="truncate text-xs text-slate-500">
              ID: {user.id}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm text-slate-700">
            {user.email}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {user.phone || "No phone number"}
          </p>
        </div>

        <div>
          <RoleBadge role={user.role} />
        </div>

        <div className="text-sm">
          {user.vendor ? (
            <div>
              <p className="truncate font-medium text-slate-800">
                {user.vendor.name}
              </p>

              <p className="text-xs text-slate-500">
                {user.vendor.city}
              </p>
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>

        <div>
          <p className="text-sm text-slate-700">
            {formatDate(user.createdAt)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatRelative(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    CUSTOMER: "bg-blue-50 text-blue-700 border-blue-200",
    PROVIDER: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[role]}`}
    >
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRelative(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  return "";
}
