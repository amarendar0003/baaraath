import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const reference =
      searchParams.get("reference")?.trim() || "";

    const email =
      searchParams.get("email")?.trim().toLowerCase() || "";

    if (!reference || !email) {
      return NextResponse.json(
        {
          error:
            "Booking reference and email are required.",
        },
        {
          status: 400,
        },
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: reference,
        User: {
          email,
        },
      },
      include: {
        User: true,
        Service: {
          include: {
            Vendor: true,
            Category: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error:
            "No booking was found with the supplied reference and email.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        status: booking.status,
        bookingDate: booking.bookingDate.toISOString(),
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),

        service: {
          id: booking.Service.id,
          title: booking.Service.title,
          price: booking.Service.price.toString(),

          vendor: {
            name: booking.Service.Vendor.name,
            city: booking.Service.Vendor.city,
            address: booking.Service.Vendor.address,
          },

          category: {
            name: booking.Service.Category.name,
          },
        },

        customer: {
          fullName: booking.User.fullName,
          email: booking.User.email,
          phone: booking.User.phone,
        },
      },
    });
  } catch (error) {
    console.error(
      "Find booking API error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to find booking.",
      },
      {
        status: 500,
      },
    );
  }
}