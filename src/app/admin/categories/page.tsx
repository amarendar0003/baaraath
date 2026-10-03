"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Edit3,
  FolderTree,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  serviceCount: number;
};

type FormState = {
  name: string;
  slug: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  async function loadCategories(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/admin/categories?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Server returned ${response.status} instead of JSON.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to load categories."
        );
      }

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCategories();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  const totalServices = useMemo(
    () =>
      categories.reduce(
        (total, category) =>
          total + category.serviceCount,
        0
      ),
    [categories]
  );

  function openAddModal() {
    setModalMode("ADD");
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setModalMode("EDIT");
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveCategory() {
    try {
      setSaving(true);
      setError("");

      const name = form.name.trim();
      const slug = makeSlug(form.slug || name);

      if (!name) {
        throw new Error("Category name is required.");
      }

      if (!slug) {
        throw new Error("Enter a valid category slug.");
      }

      const url =
        modalMode === "ADD"
          ? "/api/admin/categories"
          : `/api/admin/categories/${encodeURIComponent(
              editingId || ""
            )}`;

      const response = await fetch(url, {
        method: modalMode === "ADD" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to save category."
        );
      }

      closeModal();
      await loadCategories(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category: Category) {
    if (category.serviceCount > 0) {
      setError(
        `"${category.name}" cannot be deleted because ${category.serviceCount} service${
          category.serviceCount === 1 ? "" : "s"
        } use this category.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(category.id);
      setError("");

      const response = await fetch(
        `/api/admin/categories/${encodeURIComponent(
          category.id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to delete category."
        );
      }

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Link>

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Category Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage service categories used throughout the
              Baaraath marketplace.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total categories
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {categories.length}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <FolderTree className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Services assigned
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {totalServices}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search category name or slug..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="button"
              onClick={() => loadCategories(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Action failed
              </p>

              <p className="mt-1">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden border-b border-slate-200 bg-slate-50 px-6 py-4 md:grid md:grid-cols-[1.5fr_1fr_1fr_220px] md:gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Slug
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Services
            </p>

            <p className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </p>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FolderTree className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                No categories found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create your first service category.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((category) => {
                const busy =
                  actionId === category.id;

                return (
                  <div
                    key={category.id}
                    className="px-5 py-5 transition hover:bg-slate-50 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_220px] md:items-center">

                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <FolderTree className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Created {formatDate(category.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
                          {category.slug}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            category.serviceCount > 0
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {category.serviceCount > 0 ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}

                          {category.serviceCount} service
                          {category.serviceCount === 1
                            ? ""
                            : "s"}
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(category)
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            busy ||
                            category.serviceCount > 0
                          }
                          onClick={() =>
                            deleteCategory(category)
                          }
                          title={
                            category.serviceCount > 0
                              ? "Move services to another category before deleting."
                              : "Delete category"
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}

                          {category.serviceCount > 0
                            ? "Locked"
                            : "Delete"}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Administration
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {modalMode === "ADD"
                    ? "Add Category"
                    : "Edit Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category Name
                </label>

                <input
                  value={form.name}
                  onChange={(event) => {
                    const value = event.target.value;

                    setForm((current) => ({
                      ...current,
                      name: value,
                      slug:
                        modalMode === "ADD" &&
                        !current.slug
                          ? makeSlug(value)
                          : current.slug,
                    }));
                  }}
                  placeholder="e.g. Wedding Photography"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug
                </label>

                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: makeSlug(
                        event.target.value
                      ),
                    }))
                  }
                  placeholder="wedding_photography"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  The slug is used internally for category URLs
                  and filtering.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveCategory}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {saving
                  ? "Saving..."
                  : modalMode === "ADD"
                    ? "Create Category"
                    : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
