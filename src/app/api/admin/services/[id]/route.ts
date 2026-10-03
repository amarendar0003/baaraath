import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
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
            slug: true,
          },
        },
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
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
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
        vendor: service.Vendor,
        category: service.Category,
        bookingCount: service._count.Booking,
      },
    });
  } catch (error) {
    console.error("Admin service GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load service.",
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

    const existing = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        durationMinutes: true,
        active: true,
        vendorId: true,
        categoryId: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    const data: {
      title?: string;
      description?: string | null;
      price?: string;
      durationMinutes?: number;
      active?: boolean;
      vendorId?: string;
      categoryId?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      const title = String(body.title).trim();

      if (!title) {
        return NextResponse.json(
          { message: "Service title is required." },
          { status: 400 }
        );
      }

      if (title.length > 200) {
        return NextResponse.json(
          { message: "Service title is too long." },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (body.description !== undefined) {
      const description =
        body.description === null
          ? null
          : String(body.description).trim();

      data.description = description || null;
    }

    if (body.price !== undefined) {
      const priceText = String(body.price).trim();
      const price = Number(priceText);

      if (!priceText || !Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { message: "Price must be a valid amount greater than zero." },
          { status: 400 }
        );
      }

      data.price = price.toFixed(2);
    }

    if (body.durationMinutes !== undefined) {
      const duration = Number(body.durationMinutes);

      if (
        !Number.isInteger(duration) ||
        duration <= 0 ||
        duration > 1440
      ) {
        return NextResponse.json(
          {
            message:
              "Duration must be a whole number between 1 and 1440 minutes.",
          },
          { status: 400 }
        );
      }

      data.durationMinutes = duration;
    }

    if (body.active !== undefined) {
      if (typeof body.active !== "boolean") {
        return NextResponse.json(
          { message: "Active must be true or false." },
          { status: 400 }
        );
      }

      data.active = body.active;
    }

    if (body.vendorId !== undefined) {
      const vendorId = String(body.vendorId).trim();

      if (!vendorId) {
        return NextResponse.json(
          { message: "Provider is required." },
          { status: 400 }
        );
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true },
      });

      if (!vendor) {
        return NextResponse.json(
          { message: "Selected provider was not found." },
          { status: 400 }
        );
      }

      data.vendorId = vendorId;
    }

    if (body.categoryId !== undefined) {
      const categoryId = String(body.categoryId).trim();

      if (!categoryId) {
        return NextResponse.json(
          { message: "Category is required." },
          { status: 400 }
        );
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json(
          { message: "Selected category was not found." },
          { status: 400 }
        );
      }

      data.categoryId = categoryId;
    }

    const updated = await prisma.service.update({
      where: { id },
      data,
      include: {
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
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Service updated successfully.",
      service: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        price: updated.price.toString(),
        durationMinutes: updated.durationMinutes,
        active: updated.active,
        vendor: updated.Vendor,
        category: updated.Category,
        bookingCount: updated._count.Booking,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin service PATCH error:", error);

    return NextResponse.json(
      {
        message: "Unable to update service.",
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    if (service._count.Booking > 0) {
      return NextResponse.json(
        {
          message:
            "This service cannot be deleted because it has existing bookings.",
          bookingCount: service._count.Booking,
        },
        { status: 409 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Admin service DELETE error:", error);

    return NextResponse.json(
      {
        message: "Unable to delete service.",
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
