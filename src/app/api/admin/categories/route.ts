import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 }
    );
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 }
    );
  }

  return null;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function GET(request: Request) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const categories = await prisma.category.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                slug: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            Service: true,
          },
        },
      },
    });

    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        createdAt: category.createdAt.toISOString(),
        serviceCount: category._count.Service,
      })),
      total: categories.length,
    });
  } catch (error) {
    console.error("Admin categories GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const body = await request.json();

    const name = cleanText(body.name);
    const requestedSlug = cleanText(body.slug);

    if (!name) {
      return NextResponse.json(
        {
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    const slug = createSlug(requestedSlug || name);

    if (!slug) {
      return NextResponse.json(
        {
          message: "Enter a valid category name or slug.",
        },
        { status: 400 }
      );
    }

    const existingName = await prisma.category.findUnique({
      where: {
        name,
      },
      select: {
        id: true,
      },
    });

    if (existingName) {
      return NextResponse.json(
        {
          message: "A category with this name already exists.",
        },
        { status: 409 }
      );
    }

    const existingSlug = await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          message: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name,
        slug,
      },
      include: {
        _count: {
          select: {
            Service: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Category created successfully.",
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          createdAt: category.createdAt.toISOString(),
          serviceCount: category._count.Service,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin categories POST error:", error);

    return NextResponse.json(
      {
        message: "Unable to create category.",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
