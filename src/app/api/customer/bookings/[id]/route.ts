import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    let body: { status?: string } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const requestedStatus = body.status || "CANCELLED";

    if (requestedStatus !== "CANCELLED") {
      return NextResponse.json(
        {
          error:
            "Customers can only change a booking to CANCELLED.",
        },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     * Find the booking using BOTH:
     *   1. booking ID
     *   2. logged-in customer's ID
     *
     * This prevents one customer from cancelling
     * another customer's booking.
     */
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        customerId: session.userId,
      },
      select: {
        id: true,
        customerId: true,
        status: true,
        bookingDate: true,
        serviceId: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error: "Booking not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Customer cancellation is allowed only while
     * the booking is PENDING or CONFIRMED.
     */
    if (
      booking.status !== "PENDING" &&
      booking.status !== "CONFIRMED"
    ) {
      return NextResponse.json(
        {
          error: `This booking cannot be cancelled because its current status is ${booking.status}.`,
          status: booking.status,
        },
        { status: 409 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "CANCELLED",
      },
      select: {
        id: true,
        customerId: true,
        serviceId: true,
        bookingDate: true,
        status: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: {
        ...updatedBooking,
        bookingDate: updatedBooking.bookingDate.toISOString(),
        createdAt: updatedBooking.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Customer booking cancellation error:", error);

    return NextResponse.json(
      {
        error: "Unable to cancel booking.",
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
