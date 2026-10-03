import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

type BookingStatus = (typeof allowedStatuses)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const body = await request.json();

    const status = body.status as string;

    if (!allowedStatuses.includes(status as BookingStatus)) {
      return NextResponse.json(
        { error: "Invalid booking status." },
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
        { error: "Vendor profile not found." },
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
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: status as BookingStatus,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: "Booking status updated successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Vendor booking PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update booking status." },
      { status: 500 }
    );
  }
}