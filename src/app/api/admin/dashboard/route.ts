import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
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

    const [
      totalUsers,
      customers,
      providers,
      services,
      categories,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.user.count({
        where: {
          role: "PROVIDER",
        },
      }),

      prisma.service.count(),

      prisma.category.count(),

      prisma.booking.count(),

      prisma.booking.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.booking.count({
        where: {
          status: "CONFIRMED",
        },
      }),

      prisma.booking.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.booking.count({
        where: {
          status: "CANCELLED",
        },
      }),

      prisma.booking.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
        include: {
          User: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          Service: {
            select: {
              id: true,
              title: true,
              price: true,
              durationMinutes: true,
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
                },
              },
            },
          },
        },
      }),

      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    const response = {
      stats: {
        totalUsers,
        customers,
        providers,
        services,
        categories,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
      },

      totals: {
        users: totalUsers,
        customers,
        providers,
        services,
        categories,
        bookings: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },

      bookings: recentBookings.map((booking) => ({
        id: booking.id,
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        bookingDate: booking.bookingDate.toISOString(),
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),

        customer: booking.User
          ? {
              id: booking.User.id,
              fullName: booking.User.fullName,
              email: booking.User.email,
              phone: booking.User.phone,
            }
          : null,

        service: booking.Service
          ? {
              id: booking.Service.id,
              title: booking.Service.title,
              price: booking.Service.price.toString(),
              durationMinutes: booking.Service.durationMinutes,

              vendor: booking.Service.Vendor
                ? {
                    id: booking.Service.Vendor.id,
                    name: booking.Service.Vendor.name,
                    city: booking.Service.Vendor.city,
                    address: booking.Service.Vendor.address,
                  }
                : null,

              category: booking.Service.Category
                ? {
                    id: booking.Service.Category.id,
                    name: booking.Service.Category.name,
                  }
                : null,
            }
          : null,
      })),

      users: recentUsers.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin dashboard GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load admin dashboard.",
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
