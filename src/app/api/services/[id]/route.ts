import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: {
        id,
      },

      include: {
        Vendor: {
          select: {
            id: true,
            name: true,
            description: true,
            city: true,
            address: true,
            ownerId: true,
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

    if (!service) {
      return NextResponse.json(
        {
          message: "Service not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      service: {
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
      },
    });
  } catch (error) {
    console.error("Service detail GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load service.",
      },
      {
        status: 500,
      }
    );
  }
}