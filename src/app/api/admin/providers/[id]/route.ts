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

    const provider = await prisma.vendor.findUnique({
      where: {
        id,
      },
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        Service: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
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
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { message: "Provider not found." },
        { status: 404 }
      );
    }

    const services = provider.Service.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      durationMinutes: service.durationMinutes,
      active: service.active,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      category: service.Category,
      bookingCount: service._count.Booking,
    }));

    const totalBookings = services.reduce(
      (total, service) => total + service.bookingCount,
      0
    );

    return NextResponse.json({
      provider: {
        id: provider.id,
        name: provider.name,
        description: provider.description,
        city: provider.city,
        address: provider.address,
        owner: provider.User,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
        services,
        totalServices: services.length,
        activeServices: services.filter(
          (service) => service.active
        ).length,
        totalBookings,
      },
    });
  } catch (error) {
    console.error("Admin provider detail GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load provider details.",
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

    const existing = await prisma.vendor.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Provider not found." },
        { status: 404 }
      );
    }

    const name = cleanText(body.name);
    const description = cleanText(body.description);
    const city = cleanText(body.city);
    const address = cleanText(body.address);

    const ownerName = cleanText(body.ownerName);
    const ownerEmail = cleanText(body.ownerEmail).toLowerCase();
    const ownerPhone = cleanText(body.ownerPhone);
    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    if (!name) {
      return NextResponse.json(
        { message: "Provider name is required." },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { message: "City is required." },
        { status: 400 }
      );
    }

    if (!ownerName) {
      return NextResponse.json(
        { message: "Provider owner name is required." },
        { status: 400 }
      );
    }

    if (!ownerEmail) {
      return NextResponse.json(
        { message: "Provider owner email is required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      return NextResponse.json(
        { message: "Enter a valid provider owner email address." },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        {
          message:
            "New password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const owner = await prisma.user.findUnique({
      where: {
        id: existing.ownerId,
      },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Provider owner account not found." },
        { status: 404 }
      );
    }

    const emailOwner = await prisma.user.findUnique({
      where: {
        email: ownerEmail,
      },
      select: {
        id: true,
      },
    });

    if (emailOwner && emailOwner.id !== owner.id) {
      return NextResponse.json(
        {
          message:
            "Another user account already exists with this email address.",
        },
        { status: 409 }
      );
    }

    if (ownerPhone) {
      const phoneOwner = await prisma.user.findUnique({
        where: {
          phone: ownerPhone,
        },
        select: {
          id: true,
        },
      });

      if (phoneOwner && phoneOwner.id !== owner.id) {
        return NextResponse.json(
          {
            message:
              "Another user account already exists with this phone number.",
          },
          { status: 409 }
        );
      }
    }

    const updateData: {
      fullName: string;
      email: string;
      phone: string | null;
      updatedAt: Date;
      passwordHash?: string;
    } = {
      fullName: ownerName,
      email: ownerEmail,
      phone: ownerPhone || null,
      updatedAt: new Date(),
    };

    if (newPassword) {
      const bcrypt = await import("bcryptjs");

      updateData.passwordHash = await bcrypt.hash(
        newPassword,
        12
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOwner = await tx.user.update({
        where: {
          id: owner.id,
        },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const updatedVendor = await tx.vendor.update({
        where: {
          id,
        },
        data: {
          name,
          description: description || null,
          city,
          address: address || null,
          updatedAt: new Date(),
        },
      });

      return {
        owner: updatedOwner,
        vendor: updatedVendor,
      };
    });

    return NextResponse.json({
      message: "Provider updated successfully.",
      provider: {
        id: updated.vendor.id,
        name: updated.vendor.name,
        description: updated.vendor.description,
        city: updated.vendor.city,
        address: updated.vendor.address,
        owner: updated.owner,
        updatedAt: updated.vendor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Admin provider PATCH error:", error);

    return NextResponse.json(
      {
        message: "Unable to update provider.",
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

    const provider = await prisma.vendor.findUnique({
      where: {
        id,
      },
      include: {
        Service: {
          select: {
            id: true,
            title: true,
            _count: {
              select: {
                Booking: true,
              },
            },
          },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { message: "Provider not found." },
        { status: 404 }
      );
    }

    const bookingCount = provider.Service.reduce(
      (total, service) => total + service._count.Booking,
      0
    );

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          message:
            "This provider cannot be deleted because its services have existing bookings. Remove or archive the services instead.",
          bookingCount,
        },
        { status: 409 }
      );
    }

    await prisma.vendor.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Provider deleted successfully.",
      providerId: id,
    });
  } catch (error) {
    console.error("Admin provider DELETE error:", error);

    return NextResponse.json(
      {
        message: "Unable to delete provider.",
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

