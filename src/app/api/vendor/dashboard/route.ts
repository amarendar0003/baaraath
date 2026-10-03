import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        {
          success: false,
          message: "Provider access required.",
        },
        { status: 403 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "Provider profile not found.",
        },
        { status: 404 }
      );
    }

    const [
      totalServices,
      activeServices,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.service.count({
        where: {
          vendorId: vendor.id,
        },
      }),

      prisma.service.count({
        where: {
          vendorId: vendor.id,
          active: true,
        },
      }),

      prisma.booking.count({
        where: {
          Service: {
            vendorId: vendor.id,
          },
        },
      }),

      prisma.booking.count({
        where: {
          Service: {
            vendorId: vendor.id,
          },
          status: "PENDING",
        },
      }),

      prisma.booking.count({
        where: {
          Service: {
            vendorId: vendor.id,
          },
          status: "CONFIRMED",
        },
      }),

      prisma.booking.count({
        where: {
          Service: {
            vendorId: vendor.id,
          },
          status: "COMPLETED",
        },
      }),

      prisma.booking.count({
        where: {
          Service: {
            vendorId: vendor.id,
          },
          status: "CANCELLED",
        },
      }),

      prisma.booking.findMany({
        where: {
          Service: {
            vendorId: vendor.id,
          },
        },
        include: {
          User: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
          Service: {
            include: {
              Category: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,

      vendor: {
        id: vendor.id,
        name: vendor.name,
        description: vendor.description,
        city: vendor.city,
        address: vendor.address,
        owner: vendor.User,
        createdAt: vendor.createdAt,
      },

      stats: {
        totalServices,
        activeServices,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
      },

      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        bookingDate: booking.bookingDate,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,

        customer: {
          fullName: booking.User.fullName,
          email: booking.User.email,
          phone: booking.User.phone,
        },

        service: {
          id: booking.Service.id,
          title: booking.Service.title,
          category: booking.Service.Category.name,
          price: booking.Service.price.toString(),
        },
      })),
    });
  } catch (error) {
    console.error("Vendor dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load provider dashboard.",
      },
      { status: 500 }
    );
  }
}