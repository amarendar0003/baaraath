import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("q")?.trim() || "";
    const categoryId = searchParams.get("categoryId") || "";
    const city = searchParams.get("city")?.trim() || "";
    const activeParam = searchParams.get("active");

    const services = await prisma.service.findMany({
      where: {
        ...(activeParam === "false"
          ? { active: false }
          : { active: true }),

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

        ...(city
          ? {
              Vendor: {
                city: {
                  contains: city,
                  mode: "insensitive",
                },
              },
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
            address: true,
          },
        },

        Category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        _count: {
          select: {
            Booking: true,
          },
        },
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
    });
  } catch (error) {
    console.error("Services GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load services.",
      },
      {
        status: 500,
      }
    );
  }
}