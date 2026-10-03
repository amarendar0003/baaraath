"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

type UserData = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/dashboard/profile", {
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setUser(data.user);
        setFullName(data.user.fullName);
        setPhone(data.user.phone || "");
      } catch (error) {
        setProfileError(
          error instanceof Error
            ? error.message
            : "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setProfileError("");
    setProfileMessage("");
    setSavingProfile(true);

    try {
      const response = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setProfileError(
          data.message || "Unable to update profile."
        );
        return;
      }

      setUser(data.user);
      setProfileMessage("Profile updated successfully.");
    } catch {
      setProfileError("Unable to connect to the server.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.status === 401) {
        const data = await response.json();

        setPasswordError(
          data.message || "Current password is incorrect."
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(
          data.message || "Unable to change password."
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage("Password changed successfully.");
    } catch {
      setPasswordError("Unable to connect to the server.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Customer account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Profile & Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Personal information */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <h2 className="font-semibold text-slate-950">
                  Personal information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your basic account information.
                </p>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="space-y-5 p-5 sm:p-6"
              >
                {profileError && (
                  <Message type="error">
                    {profileError}
                  </Message>
                )}

                {profileMessage && (
                  <Message type="success">
                    {profileMessage}
                  </Message>
                )}

                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="fullName"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      value={user.email}
                      disabled
                      className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-500"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Email changes require account verification and
                    will be implemented separately.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Phone number
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="+91 98765 43210"
                      className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {savingProfile
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </form>
            </section>

            {/* Password */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <Lock className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-950">
                      Change password
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Keep your account secure with a strong password.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-5 p-5 sm:p-6"
              >
                {passwordError && (
                  <Message type="error">
                    {passwordError}
                  </Message>
                )}

                {passwordMessage && (
                  <Message type="success">
                    {passwordMessage}
                  </Message>
                )}

                <PasswordInput
                  id="currentPassword"
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  show={showCurrent}
                  setShow={setShowCurrent}
                />

                <PasswordInput
                  id="newPassword"
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNew}
                  setShow={setShowNew}
                />

                <PasswordInput
                  id="confirmPassword"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  setShow={setShowConfirm}
                />

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Lock className="h-4 w-4" />
                    {changingPassword
                      ? "Changing..."
                      : "Change password"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Account sidebar */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                  {getInitials(user.fullName)}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-slate-950">
                    {user.fullName}
                  </h2>

                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Account type</span>
                  <span className="font-medium text-slate-700">
                    Customer
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Member since</span>
                  <span className="font-medium text-slate-700">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Account security
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Your password is stored using secure bcrypt
                    hashing and your login session uses an HTTP-only
                    cookie.
                  </p>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: (value: boolean) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-12 text-sm outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function Message({
  type,
  children,
}: {
  type: "success" | "error";
  children: React.ReactNode;
}) {
  if (type === "success") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {children}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {children}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

