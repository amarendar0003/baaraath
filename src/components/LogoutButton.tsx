"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to logout.");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      alert("Unable to logout. Please try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
