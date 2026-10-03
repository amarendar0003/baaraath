import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateBookingReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let result = "AB-";

  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/bookings reached");

    const body = await request.json();

    console.log("BOOKING BODY:", body);

    const serviceId = String(body.serviceId || "").trim();

    // Accept both old and new field names
    const fullName = String(
      body.fullName ||
      body.customerName ||
      ""
    ).trim();

    const email = String(
      body.email ||
      body.customerEmail ||
      ""
    ).trim().toLowerCase();

    const phone = String(
      body.phone ||
      body.customerPhone ||
      ""
    ).trim();

    const eventDate = String(
      body.eventDate ||
      body.bookingDate ||
      ""
    ).trim();

    const notes = String(body.notes || "").trim();

    /*
     * Guest count can come directly from the API field,
     * or from the existing booking page notes:
     *
     * Guests: 557
     */
    let guestCount = Number(
      body.guestCount ||
      body.guests ||
      0
    );

    if (
      (!Number.isInteger(guestCount) || guestCount < 1) &&
      notes
    ) {
      const guestMatch = notes.match(
        /Guests:\s*(\d+)/i
      );

      if (guestMatch) {
        guestCount = Number(guestMatch[1]);
      }
    }

    if (!serviceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Service ID is required.",
        },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address is required.",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Mobile number is required.",
        },
        { status: 400 }
      );
    }

    if (!eventDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Event date is required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Number of guests must be at least 1.",
        },
        { status: 400 }
      );
    }

    const bookingDate = new Date(
      `${eventDate}T12:00:00`
    );

    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid event date.",
        },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        Vendor: true,
        Category: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Service not found.",
        },
        { status: 404 }
      );
    }

    if (!service.active) {
      return NextResponse.json(
        {
          success: false,
          error: "This service is currently unavailable.",
        },
        { status: 409 }
      );
    }

    /*
     * Check whether the selected date already has
     * a pending or confirmed booking.
     */
    const existingBooking =
      await prisma.booking.findFirst({
        where: {
          serviceId: service.id,
          bookingDate,
          status: {
            in: [
              "PENDING",
              "CONFIRMED",
            ],
          },
        },
      });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This service is already booked or has a pending booking for the selected date.",
        },
        { status: 409 }
      );
    }

    /*
     * Find existing customer.
     */
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    /*
     * Create customer if not already registered.
     */
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          fullName,
          email,
          phone,
          role: "CUSTOMER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      /*
       * Update customer contact information.
       */
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          fullName,
          phone: phone || user.phone,
          updatedAt: new Date(),
        },
      });
    }

    /*
     * Generate unique booking reference.
     */
    let bookingReference = generateBookingReference();

    let referenceExists = await prisma.booking.findUnique({
      where: {
        id: bookingReference,
      },
    });

    while (referenceExists) {
      bookingReference = generateBookingReference();

      referenceExists =
        await prisma.booking.findUnique({
          where: {
            id: bookingReference,
          },
        });
    }

    /*
     * Store guest count and special requests
     * in the current shared Booking.notes field.
     */
    const bookingNotes = [
      `Guest Count: ${guestCount}`,
      phone ? `Phone: ${phone}` : "",
      notes
        ? `Special Requests: ${notes}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    /*
     * Create booking.
     */
    const booking = await prisma.booking.create({
      data: {
        id: bookingReference,
        customerId: user.id,
        serviceId: service.id,
        bookingDate,
        status: "PENDING",
        notes: bookingNotes,
        createdAt: new Date(),
      },
      include: {
        Service: {
          include: {
            Vendor: true,
            Category: true,
          },
        },
      },
    });

    console.log(
      "BOOKING CREATED:",
      booking.id
    );

    return NextResponse.json(
      {
        success: true,

        booking: {
          id: booking.id,
          reference: booking.id,
          status: booking.status,
          bookingDate:
            booking.bookingDate,

          service: {
            id: booking.Service.id,
            title: booking.Service.title,
            price:
              booking.Service.price.toString(),
            durationMinutes:
              booking.Service.durationMinutes,
            vendor:
              booking.Service.Vendor.name,
            city:
              booking.Service.Vendor.city,
            category:
              booking.Service.Category.name,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "BOOKING API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create booking.",
      },
      { status: 500 }
    );
  }
}
