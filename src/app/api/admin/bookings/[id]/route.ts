import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function serializeBooking(booking: any) {
  return {
    id: booking.id,
    customerId: booking.customerId,
    serviceId: booking.serviceId,
    bookingDate: booking.bookingDate.toISOString(),
    status: booking.status,
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),

    customer: booking.User
      ? {
          id: booking.User.id,
          fullName: booking.User.fullName,
          email: booking.User.email,
          phone: booking.User.phone,
          role: booking.User.role,
        }
      : null,

    service: booking.Service
      ? {
          id: booking.Service.id,
          title: booking.Service.title,
          description: booking.Service.description,
          price: booking.Service.price.toString(),
          durationMinutes: booking.Service.durationMinutes,
          active: booking.Service.active,

          vendor: booking.Service.Vendor
            ? {
                id: booking.Service.Vendor.id,
                name: booking.Service.Vendor.name,
                city: booking.Service.Vendor.city,
                address: booking.Service.Vendor.address,
              }
            : null,

          category: booking.Service.Category
            ? {
                id: booking.Service.Category.id,
                name: booking.Service.Category.name,
              }
            : null,
        }
      : null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },

      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },

        Service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            durationMinutes: true,
            active: true,

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
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      booking: serializeBooking(booking),
    });
  } catch (error) {
    console.error("Admin booking GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load booking.",
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

    const status = String(body.status || "").toUpperCase();

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          message:
            "Invalid booking status. Allowed values are PENDING, CONFIRMED, CANCELLED and COMPLETED.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.booking.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    const updated = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: status as
          | "PENDING"
          | "CONFIRMED"
          | "CANCELLED"
          | "COMPLETED",
      },
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },

        Service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            durationMinutes: true,
            active: true,

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
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Booking status updated successfully.",
      booking: serializeBooking(updated),
    });
  } catch (error) {
    console.error("Admin booking PATCH error:", error);

    return NextResponse.json(
      {
        message: "Unable to update booking.",
      },
      { status: 500 }
    );
  }
}
