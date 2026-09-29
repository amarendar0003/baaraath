import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const confirmationNumber = searchParams.get("confirmation_number");
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");

  try {
    if (confirmationNumber) {
      const booking = await prisma.booking.findFirst({
        where: {
          notes: { contains: confirmationNumber, mode: "insensitive" },
        },
        include: {
          service: { include: { category: true } },
          customer: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!booking) {
        return NextResponse.json(
          {
            error: "No booking found. Check the confirmation number and try again.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        confirmationNumber: booking.notes?.split(" ").pop() || confirmationNumber,
        serviceName: booking.service.title,
        status: booking.status,
        id: booking.id,
        customerName: booking.customer.fullName,
        customerPhone: booking.customer.phone,
        eventDate: booking.bookingDate.toISOString().split("T")[0],
        guestCount: 0,
        totalAmount: Number(booking.service.price),
        advanceAmount: 0,
        cancellationRequested: false,
      });
    }

    if (name && phone) {
      const customer = await prisma.user.findFirst({
        where: {
          fullName: { contains: name, mode: "insensitive" },
          phone: { contains: phone, mode: "insensitive" },
        },
        include: {
          bookings: {
            include: { service: { include: { category: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!customer || customer.bookings.length === 0) {
        return NextResponse.json(
          {
            error: "No booking found. Check your details and try again.",
          },
          { status: 404 }
        );
      }

      const latest = customer.bookings[0];
      return NextResponse.json({
        confirmationNumber: latest.id,
        serviceName: latest.service.title,
        status: latest.status,
        id: latest.id,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        eventDate: latest.bookingDate.toISOString().split("T")[0],
        guestCount: 0,
        totalAmount: Number(latest.service.price),
        advanceAmount: 0,
        cancellationRequested: false,
      });
    }

    return NextResponse.json(
      { error: "Provide confirmation_number or name and phone." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Lookup failed:", error);
    return NextResponse.json(
      { error: "Unable to reach the booking service right now." },
      { status: 500 }
    );
  }
}
