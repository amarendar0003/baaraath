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

function serializeService(service: any) {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    price: service.price.toString(),
    durationMinutes: service.durationMinutes,
    active: service.active,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    vendor: service.Vendor,
    category: service.Category,
    bookingCount: service._count?.Booking ?? 0,
  };
}

export async function GET(request: Request) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const categoryId = searchParams.get("categoryId") || "";
    const vendorId = searchParams.get("vendorId") || "";
    const active = searchParams.get("active") || "ALL";

    const services = await prisma.service.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(vendorId ? { vendorId } : {}),
        ...(active === "ACTIVE"
          ? { active: true }
          : active === "INACTIVE"
            ? { active: false }
            : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Vendor: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        Category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    const vendors = await prisma.vendor.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        city: true,
      },
    });

    return NextResponse.json({
      services: services.map(serializeService),
      categories,
      vendors,
      total: services.length,
    });
  } catch (error) {
    console.error("Admin services GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load services.",
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

    const title = cleanText(body.title);
    const description = cleanText(body.description);
    const vendorId = cleanText(body.vendorId);
    const categoryId = cleanText(body.categoryId);
    const priceValue = Number(body.price);
    const durationMinutes = Number(body.durationMinutes);

    if (!title) {
      return NextResponse.json(
        { message: "Service title is required." },
        { status: 400 }
      );
    }

    if (!vendorId) {
      return NextResponse.json(
        { message: "Provider is required." },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "Category is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      return NextResponse.json(
        { message: "Enter a valid service price." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1
    ) {
      return NextResponse.json(
        { message: "Enter a valid duration." },
        { status: 400 }
      );
    }

    const [vendor, category] = await Promise.all([
      prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true },
      }),
      prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      }),
    ]);

    if (!vendor) {
      return NextResponse.json(
        { message: "Provider not found." },
        { status: 404 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    const service = await prisma.service.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description: description || null,
        price: priceValue.toFixed(2),
        durationMinutes,
        active: body.active !== false,
        vendorId,
        categoryId,
        createdAt: now,
        updatedAt: now,
      },
      include: {
        Vendor: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        Category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Service created successfully.",
        service: serializeService(service),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin services POST error:", error);

    return NextResponse.json(
      {
        message: "Unable to create service.",
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
