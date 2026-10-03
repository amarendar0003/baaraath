import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");

    const where: {
      customerId: string;
      status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    } = {
      customerId: session.userId,
    };

    if (
      status === "PENDING" ||
      status === "CONFIRMED" ||
      status === "CANCELLED" ||
      status === "COMPLETED"
    ) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
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
    });

    return NextResponse.json({
      success: true,
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
          vendor: booking.Service.Vendor.name,
          vendorId: booking.Service.Vendor.id,
          city: booking.Service.Vendor.city,
          address: booking.Service.Vendor.address,
          category: booking.Service.Category.name,
        },
      })),
    });
  } catch (error) {
    console.error("Bookings API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load bookings.",
      },
      { status: 500 }
    );
  }
}