import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    console.log("SERVICE API REQUEST:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required." },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: {
        id: id,
      },
      include: {
        Category: true,
        Vendor: true,
      },
    });

    console.log(
      "SERVICE API RESULT:",
      service
        ? {
            id: service.id,
            title: service.title,
            active: service.active,
          }
        : null
    );

    if (!service) {
      return NextResponse.json(
        {
          error: "Service not found.",
          serviceId: id,
        },
        { status: 404 }
      );
    }

    if (!service.active) {
      return NextResponse.json(
        {
          error: "This service is currently unavailable.",
        },
        { status: 410 }
      );
    }

    return NextResponse.json({
      service: {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price.toString(),
        durationMinutes: service.durationMinutes,
        active: service.active,

        category: {
          id: service.Category.id,
          name: service.Category.name,
          slug: service.Category.slug,
        },

        vendor: {
          id: service.Vendor.id,
          name: service.Vendor.name,
          description: service.Vendor.description,
          city: service.Vendor.city,
          address: service.Vendor.address,
        },
      },
    });
  } catch (error) {
    console.error(
      "SERVICE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load service.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
