import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  if (session.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { message: "Admin access required." },
        { status: 403 },
      ),
    };
  }

  return { session };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
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
        createdAt: category.createdAt,
        serviceCount: category._count.Service,
      })),
      total: categories.length,
    });
  } catch (error) {
    console.error("Admin categories GET error:", error);

    return NextResponse.json(
      { message: "Unable to load categories." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const slug = String(body.slug ?? "").trim().toLowerCase();

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required." },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json(
        { message: "Category slug is required." },
        { status: 400 },
      );
    }

    const normalizedSlug = slug
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!normalizedSlug) {
      return NextResponse.json(
        { message: "Please enter a valid category slug." },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
          {
            slug: normalizedSlug,
          },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "A category with this name or slug already exists." },
        { status: 409 },
      );
    }

    const category = await prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name,
        slug: normalizedSlug,
      },
    });

    return NextResponse.json(
      {
        message: "Category created successfully.",
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin categories POST error:", error);

    return NextResponse.json(
      { message: "Unable to create category." },
      { status: 500 },
    );
  }
}
