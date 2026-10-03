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

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
        ...service,
        price: service.price.toString(),
        bookingCount: service._count.Booking,
      },
    });
  } catch (error) {
    console.error("Admin service GET error:", error);

    return NextResponse.json(
      { message: "Unable to load service." },
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
      include: {
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    const data: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      const title = cleanText(body.title);

      if (!title) {
        return NextResponse.json(
          { message: "Service title is required." },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (body.description !== undefined) {
      const description = cleanText(body.description);
      data.description = description || null;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { message: "Enter a valid service price." },
          { status: 400 }
        );
      }

      data.price = price.toFixed(2);
    }

    if (body.durationMinutes !== undefined) {
      const duration = Number(body.durationMinutes);

      if (!Number.isInteger(duration) || duration < 1) {
        return NextResponse.json(
          { message: "Enter a valid duration." },
          { status: 400 }
        );
      }

      data.durationMinutes = duration;
    }

    if (body.vendorId !== undefined) {
      const vendorId = cleanText(body.vendorId);

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true },
      });

      if (!vendor) {
        return NextResponse.json(
          { message: "Provider not found." },
          { status: 404 }
        );
      }

      data.vendorId = vendorId;
    }

    if (body.categoryId !== undefined) {
      const categoryId = cleanText(body.categoryId);

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json(
          { message: "Category not found." },
          { status: 404 }
        );
      }

      data.categoryId = categoryId;
    }

    if (body.active !== undefined) {
      data.active = Boolean(body.active);
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
        ...updated,
        price: updated.price.toString(),
        bookingCount: updated._count.Booking,
      },
    });
  } catch (error) {
    console.error("Admin service PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update service." },
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
        active: true,
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
            "This service cannot be deleted because it has existing bookings. Deactivate it instead.",
          bookingCount: service._count.Booking,
        },
        { status: 409 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Admin service DELETE error:", error);

    return NextResponse.json(
      { message: "Unable to delete service." },
      { status: 500 }
    );
  }
}
