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
  request: Request,
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
      { message: "Unable to load provider details." },
      { status: 500 }
    );
  }
}