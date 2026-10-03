import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["PENDING", "CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CONFIRMED", "COMPLETED", "CANCELLED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};

async function requireAdmin() {
  const session = await getSession();

  if (!session) {
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

  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await params;
    const body = await request.json();

    const newStatus = String(body.status ?? "")
      .trim()
      .toUpperCase();

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
    ];

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          message:
            "Invalid status. Allowed values are PENDING, CONFIRMED, CANCELLED and COMPLETED.",
        },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    const allowed = allowedTransitions[booking.status] ?? [];

    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          message: `Cannot change booking status from ${booking.status} to ${newStatus}.`,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: newStatus as
          | "PENDING"
          | "CONFIRMED"
          | "CANCELLED"
          | "COMPLETED",
      },
      select: {
        id: true,
        status: true,
        bookingDate: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: `Booking status changed to ${updated.status}.`,
      booking: updated,
    });
  } catch (error) {
    console.error("Admin booking status PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update booking status." },
      { status: 500 }
    );
  }
}