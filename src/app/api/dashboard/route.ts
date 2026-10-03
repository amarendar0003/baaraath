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

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          customerId: session.userId,
        },
      }),

      prisma.booking.count({
        where: {
          customerId: session.userId,
          status: "PENDING",
        },
      }),

      prisma.booking.count({
        where: {
          customerId: session.userId,
          status: "CONFIRMED",
        },
      }),

      prisma.booking.count({
        where: {
          customerId: session.userId,
          status: "COMPLETED",
        },
      }),

      prisma.booking.count({
        where: {
          customerId: session.userId,
          status: "CANCELLED",
        },
      }),

      prisma.booking.findMany({
        where: {
          customerId: session.userId,
        },
        include: {
          Service: {
            include: {
              Vendor: true,
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
      stats: {
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
        service: {
          id: booking.Service.id,
          title: booking.Service.title,
          price: booking.Service.price.toString(),
          durationMinutes: booking.Service.durationMinutes,
          vendor: booking.Service.Vendor.name,
          city: booking.Service.Vendor.city,
          category: booking.Service.Category.name,
        },
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard.",
      },
      { status: 500 }
    );
  }
}