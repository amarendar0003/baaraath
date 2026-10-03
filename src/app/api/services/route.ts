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
        Vendor: true,
        Category: true,
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