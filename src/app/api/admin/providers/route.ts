import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const vendors = await prisma.vendor.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                city: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                address: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                User: {
                  fullName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                User: {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : undefined,
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            Service: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const providers = vendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      description: vendor.description,
      city: vendor.city,
      address: vendor.address,
      ownerId: vendor.ownerId,
      createdAt: vendor.createdAt.toISOString(),
      updatedAt: vendor.updatedAt.toISOString(),

      owner: vendor.User
        ? {
            id: vendor.User.id,
            fullName: vendor.User.fullName,
            email: vendor.User.email,
            phone: vendor.User.phone,
            role: vendor.User.role,
            createdAt: vendor.User.createdAt.toISOString(),
          }
        : null,

      serviceCount: vendor._count.Service,
    }));

    return NextResponse.json({
      providers,
      total: providers.length,
    });
  } catch (error) {
    console.error("Admin providers GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load providers.",
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
