import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getProviderService(
  userId: string,
  serviceId: string
) {
  const vendor = await prisma.vendor.findUnique({
    where: {
      ownerId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!vendor) {
    return null;
  }

  return prisma.service.findFirst({
    where: {
      id: serviceId,
      vendorId: vendor.id,
    },
    include: {
      Category: true,
    },
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { success: false, message: "Provider access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const service = await getProviderService(
      session.userId,
      id
    );

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "Service not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const title =
      body.title !== undefined
        ? String(body.title).trim()
        : service.title;

    const description =
      body.description !== undefined
        ? String(body.description).trim()
        : service.description;

    const categoryId =
      body.categoryId !== undefined
        ? String(body.categoryId).trim()
        : service.categoryId;

    const price =
      body.price !== undefined
        ? Number(body.price)
        : Number(service.price);

    const durationMinutes =
      body.durationMinutes !== undefined
        ? Number(body.durationMinutes)
        : service.durationMinutes;

    const active =
      body.active !== undefined
        ? Boolean(body.active)
        : service.active;

    if (!title || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Service title and category are required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid price.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid duration.",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.service.update({
      where: {
        id: service.id,
      },
      data: {
        title,
        description: description || null,
        categoryId,
        price,
        durationMinutes,
        active,
        updatedAt: new Date(),
      },
      include: {
        Category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Service updated successfully.",
      service: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        price: updated.price.toString(),
        durationMinutes: updated.durationMinutes,
        active: updated.active,
        category: updated.Category,
      },
    });
  } catch (error) {
    console.error("Vendor service PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update service.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { success: false, message: "Provider access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const service = await getProviderService(
      session.userId,
      id
    );

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "Service not found.",
        },
        { status: 404 }
      );
    }

    const bookingCount = await prisma.booking.count({
      where: {
        serviceId: service.id,
      },
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This service has booking history and cannot be deleted. Deactivate it instead.",
        },
        { status: 409 }
      );
    }

    await prisma.service.delete({
      where: {
        id: service.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Vendor service DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete service.",
      },
      { status: 500 }
    );
  }
}