import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: session.userId,
      },
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        Service: {
          select: {
            id: true,
            title: true,
            description: true,
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
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      bookings: bookings.map((booking) => ({
        id: booking.id,
        bookingDate: booking.bookingDate,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,

        service: {
          id: booking.Service.id,
          title: booking.Service.title,
          description: booking.Service.description,
          price: booking.Service.price.toString(),
          durationMinutes: booking.Service.durationMinutes,
          vendor: booking.Service.Vendor,
          category: booking.Service.Category,
        },
      })),
    });
  } catch (error) {
    console.error("Customer bookings GET error:", error);

    return NextResponse.json(
      { message: "Unable to load your bookings." },
      { status: 500 }
    );
  }
}