import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 },
      );
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

        ...(categoryId
          ? {
              categoryId,
            }
          : {}),

        ...(vendorId
          ? {
              vendorId,
            }
          : {}),

        ...(active === "ACTIVE"
          ? {
              active: true,
            }
          : active === "INACTIVE"
            ? {
                active: false,
              }
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
      services: services.map((service) => ({
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
        bookingCount: service._count.Booking,
      })),
      categories,
      vendors,
      total: services.length,
    });
  } catch (error) {
    console.error("Admin services GET error:", error);

    return NextResponse.json(
      { message: "Unable to load services." },
      { status: 500 },
    );
  }
}
