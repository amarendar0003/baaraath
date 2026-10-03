import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Provider access required." },
        { status: 403 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Provider profile not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
    ];

    const bookings = await prisma.booking.findMany({
      where: {
        Service: {
          vendorId: vendor.id,
        },
        ...(status && validStatuses.includes(status)
          ? {
              status:
                status as
                  | "PENDING"
                  | "CONFIRMED"
                  | "CANCELLED"
                  | "COMPLETED",
            }
          : {}),
      },
      include: {
        Service: {
          include: {
            Category: true,
          },
        },
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    return NextResponse.json({
      bookings: bookings.map((booking) => ({
        id: booking.id,
        reference: booking.id,
        bookingDate: booking.bookingDate,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
        customer: {
          id: booking.User.id,
          name: booking.User.fullName,
          email: booking.User.email,
          phone: booking.User.phone,
        },
        service: {
          id: booking.Service.id,
          title: booking.Service.title,
          price: booking.Service.price.toString(),
          durationMinutes: booking.Service.durationMinutes,
          category: booking.Service.Category.name,
        },
      })),
    });
  } catch (error) {
    console.error("Vendor bookings error:", error);

    return NextResponse.json(
      { error: "Unable to load bookings." },
      { status: 500 }
    );
  }
}
