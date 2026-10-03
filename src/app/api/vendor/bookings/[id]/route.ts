import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

type BookingStatus = (typeof allowedStatuses)[number];

async function requireProvider() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 }
    );
  }

  if (session.role !== "PROVIDER") {
    return NextResponse.json(
      { message: "Provider access required." },
      { status: 403 }
    );
  }

  return session;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireProvider();

    if (session instanceof NextResponse) {
      return session;
    }

    const { id } = await params;

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
        { message: "Provider profile not found." },
        { status: 404 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        Service: {
          vendorId: vendor.id,
        },
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
            description: true,
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

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        bookingDate: booking.bookingDate,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
        customer: booking.User,
        service: {
          id: booking.Service.id,
          title: booking.Service.title,
          description: booking.Service.description,
          price: booking.Service.price.toString(),
          durationMinutes: booking.Service.durationMinutes,
          category: booking.Service.Category,
        },
      },
    });
  } catch (error) {
    console.error("Provider booking GET error:", error);

    return NextResponse.json(
      { message: "Unable to load booking." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireProvider();

    if (session instanceof NextResponse) {
      return session;
    }

    const { id } = await params;

    const body = await request.json();

    const requestedStatus = String(
      body.status ?? ""
    ).trim().toUpperCase() as BookingStatus;

    if (!allowedStatuses.includes(requestedStatus)) {
      return NextResponse.json(
        {
          message:
            "Invalid booking status. Allowed values are PENDING, CONFIRMED, CANCELLED and COMPLETED.",
        },
        { status: 400 }
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
        { message: "Provider profile not found." },
        { status: 404 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        Service: {
          vendorId: vendor.id,
        },
      },
      select: {
        id: true,
        status: true,
        bookingDate: true,
        Service: {
          select: {
            id: true,
            title: true,
          },
        },
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        {
          message:
            "Completed bookings cannot be changed.",
        },
        { status: 409 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        {
          message:
            "Cancelled bookings cannot be changed.",
        },
        { status: 409 }
      );
    }

    if (
      booking.status === "PENDING" &&
      requestedStatus !== "CONFIRMED" &&
      requestedStatus !== "CANCELLED"
    ) {
      return NextResponse.json(
        {
          message:
            "A pending booking can only be confirmed or cancelled.",
        },
        { status: 409 }
      );
    }

    if (
      booking.status === "CONFIRMED" &&
      requestedStatus !== "COMPLETED" &&
      requestedStatus !== "CANCELLED"
    ) {
      return NextResponse.json(
        {
          message:
            "A confirmed booking can only be completed or cancelled.",
        },
        { status: 409 }
      );
    }

    const updated = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: requestedStatus,
      },
      select: {
        id: true,
        bookingDate: true,
        status: true,
        notes: true,
        createdAt: true,
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

    return NextResponse.json({
      message: `Booking status changed to ${updated.status}.`,
      booking: {
        id: updated.id,
        bookingDate: updated.bookingDate,
        status: updated.status,
        notes: updated.notes,
        createdAt: updated.createdAt,
        customer: updated.User,
        service: {
          id: updated.Service.id,
          title: updated.Service.title,
          price: updated.Service.price.toString(),
          durationMinutes: updated.Service.durationMinutes,
          category: updated.Service.Category,
        },
      },
    });
  } catch (error) {
    console.error("Provider booking PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update booking status." },
      { status: 500 }
    );
  }
}