import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /*
     * Provider access is verified from the database.
     * This avoids rejecting a valid provider because an
     * older JWT contains a stale role.
     */
    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
        city: true,
        address: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          error: "Provider account not found",
          userId: session.userId,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
    ];

    const where: any = {
      Service: {
        vendorId: vendor.id,
      },
    };

    if (
      status &&
      allowedStatuses.includes(status)
    ) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          User: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          User: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          Service: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        Service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            durationMinutes: true,
            active: true,
            vendorId: true,
            categoryId: true,
            Category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            Vendor: {
              select: {
                id: true,
                name: true,
                city: true,
                address: true,
              },
            },
          },
        },
      },
    });

    const serializedBookings = bookings.map((booking) => ({
      id: booking.id,
      customerId: booking.customerId,
      serviceId: booking.serviceId,
      bookingDate: booking.bookingDate.toISOString(),
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),

      User: booking.User,

      Service: booking.Service
        ? {
            ...booking.Service,
            price: booking.Service.price.toString(),
          }
        : null,
    }));

    return NextResponse.json({
      bookings: serializedBookings,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        city: vendor.city,
        address: vendor.address,
      },
      total: serializedBookings.length,
    });
  } catch (error) {
    console.error("Vendor bookings GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load bookings",
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
