import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serviceSlug,
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      guestCount,
      totalAmount,
      specialRequests = "",
      termsAccepted,
    } = body;

    if (!serviceSlug || !customerName || !customerEmail || !eventDate || !guestCount || !termsAccepted) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findFirst({
      where: {
        OR: [
          { id: serviceSlug },
          { title: { contains: serviceSlug, mode: "insensitive" } },
        ],
      },
      include: { category: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const customer = await prisma.user.upsert({
      where: { email: customerEmail },
      update: { fullName: customerName, phone: customerPhone },
      create: {
        fullName: customerName,
        email: customerEmail,
        phone: customerPhone,
        role: "CUSTOMER",
      },
    });

    const bookingDate = new Date(eventDate);
    const confirmationNumber =
      "BAA-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: service.id,
        bookingDate,
        status: "PENDING",
        notes: specialRequests || undefined,
      },
      include: {
        service: { include: { category: true, vendor: true } },
        customer: { select: { fullName: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        confirmationNumber,
        id: booking.id,
        serviceName: booking.service.title,
        status: booking.status,
        eventDate: booking.bookingDate.toISOString().split("T")[0],
        guestCount,
        totalAmount,
        customerName: booking.customer.fullName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
