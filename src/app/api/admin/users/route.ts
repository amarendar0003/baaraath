import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "ALL";

    const where = {
      ...(role !== "ALL" &&
      ["CUSTOMER", "PROVIDER", "ADMIN"].includes(role)
        ? {
            role: role as "CUSTOMER" | "PROVIDER" | "ADMIN",
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                phone: {
                  contains: search,
                },
              },
            ],
          }
        : {}),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Vendor: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    const result = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      vendor: user.Vendor
        ? {
            id: user.Vendor.id,
            name: user.Vendor.name,
            city: user.Vendor.city,
          }
        : null,
    }));

    return NextResponse.json({
      users: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Admin users GET error:", error);

    return NextResponse.json(
      { message: "Unable to load users." },
      { status: 500 },
    );
  }
}
