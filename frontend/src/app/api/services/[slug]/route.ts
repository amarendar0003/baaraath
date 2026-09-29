import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const service = await prisma.service.findFirst({
      where: {
        OR: [
          { id: slug },
          { title: { contains: slug, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        vendor: { include: { owner: { select: { fullName: true, email: true, phone: true } } } },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const result = {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      vendor: {
        name: service.vendor.name,
        email: service.vendor.owner.email,
        phone: service.vendor.owner.phone,
        city: service.vendor.city,
        address: service.vendor.address,
      },
      price: Number(service.price),
      durationMinutes: service.durationMinutes,
      images: [],
      reviews: [],
      bookedDates: [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}
