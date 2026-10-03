import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "ALL";

    const bookings = await prisma.booking.findMany({
      where: {
        ...(status !== "ALL" &&
        ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)
          ? {
              status: status as
                | "PENDING"
                | "CONFIRMED"
                | "CANCELLED"
                | "COMPLETED",
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  id: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  notes: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  User: {
                    fullName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  User: {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  Service: {
                    title: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  Service: {
                    Vendor: {
                      name: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },

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

            Vendor: {
              select: {
                id: true,
                name: true,
                city: true,
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
      bookings: bookings.map((booking) => ({
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
          durationMinutes: booking.Service.durationMinutes,
        },

        vendor: booking.Service.Vendor,
        category: booking.Service.Category,
      })),

      total: bookings.length,
    });
  } catch (error) {
    console.error("Admin bookings GET error:", error);

    return NextResponse.json(
      { message: "Unable to load bookings." },
      { status: 500 },
    );
  }
}
