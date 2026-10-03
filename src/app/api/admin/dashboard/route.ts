import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
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

    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      totalServices,
      activeServices,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalCategories,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { role: "CUSTOMER" },
      }),

      prisma.user.count({
        where: { role: "PROVIDER" },
      }),

      prisma.service.count(),

      prisma.service.count({
        where: { active: true },
      }),

      prisma.booking.count(),

      prisma.booking.count({
        where: { status: "PENDING" },
      }),

      prisma.booking.count({
        where: { status: "CONFIRMED" },
      }),

      prisma.booking.count({
        where: { status: "COMPLETED" },
      }),

      prisma.booking.count({
        where: { status: "CANCELLED" },
      }),

      prisma.category.count(),

      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
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
              Vendor: {
                select: {
                  name: true,
                },
              },
              Category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCustomers,
        totalProviders,
        totalServices,
        activeServices,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalCategories,
      },

      recentUsers,

      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        bookingDate: booking.bookingDate,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
        customer: booking.User,
        service: {
          id: booking.Service.id,
          title: booking.Service.title,
          price: booking.Service.price.toString(),
          vendor: booking.Service.Vendor.name,
          category: booking.Service.Category.name,
        },
      })),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return NextResponse.json(
      { message: "Unable to load admin dashboard." },
      { status: 500 },
    );
  }
}
