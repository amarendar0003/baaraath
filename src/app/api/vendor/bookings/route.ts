import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Provider access required." },
        { status: 403 },
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found." },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: {
      service: {
        vendorId: string;
      };
      status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    } = {
      service: {
        vendorId: vendor.id,
      },
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
      orderBy: {
        createdAt: "desc",
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
        Service: {
          select: {
            id: true,
            title: true,
            price: true,
            durationMinutes: true,
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

    const normalized = bookings.map((booking) => ({
      id: booking.id,
      reference: booking.id,
      customer: {
        id: booking.User.id,
        fullName: booking.User.fullName,
        email: booking.User.email,
        phone: booking.User.phone,
      },
      service: {
        id: booking.Service.id,
        title: booking.Service.title,
        price: booking.Service.price.toString(),
        durationMinutes: booking.Service.durationMinutes,
        category: booking.Service.Category,
      },
      bookingDate: booking.bookingDate,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt,
    }));

    return NextResponse.json({
      bookings: normalized,
      total: normalized.length,
    });
  } catch (error) {
    console.error("Vendor bookings GET error:", error);

    return NextResponse.json(
      { error: "Unable to load vendor bookings." },
      { status: 500 },
    );
  }
}
