import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const categoryId = searchParams.get("categoryId") || "";
    const city = searchParams.get("city")?.trim() || "";

    const services = await prisma.service.findMany({
      where: {
        active: true,

        ...(q
          ? {
              OR: [
                {
                  title: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(categoryId ? { categoryId } : {}),

        Vendor: {
          status: "APPROVED",
          ...(city
            ? {
                city: {
                  contains: city,
                  mode: "insensitive",
                },
              }
            : {}),
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        durationMinutes: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        Vendor: {
          select: {
            id: true,
            name: true,
            description: true,
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
      })),
    });
  } catch (error) {
    console.error("Services API error:", error);

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