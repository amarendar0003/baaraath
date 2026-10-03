import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const validRoles = ["CUSTOMER", "PROVIDER", "ADMIN"] as const;

type Role = (typeof validRoles)[number];

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

  return session;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();

    if (session instanceof NextResponse) {
      return session;
    }

    const { id } = await params;
    const body = await request.json();

    const role = String(body.role ?? "")
      .trim()
      .toUpperCase() as Role;

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          message:
            "Invalid role. Allowed roles are CUSTOMER, PROVIDER and ADMIN.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (user.id === session.userId && role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "You cannot remove your own ADMIN role while signed in.",
        },
        { status: 409 }
      );
    }

    if (user.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            message:
              "The last ADMIN account cannot be changed to another role.",
          },
          { status: 409 }
        );
      }
    }

    if (role === "PROVIDER") {
      const provider = await prisma.vendor.findUnique({
        where: {
          ownerId: id,
        },
      });

      if (!provider) {
        return NextResponse.json(
          {
            message:
              "This user cannot be changed to PROVIDER because no provider profile exists for this account.",
          },
          { status: 409 }
        );
      }
    }

    if (user.role === "PROVIDER" && role !== "PROVIDER") {
      const provider = await prisma.vendor.findUnique({
        where: {
          ownerId: id,
        },
      });

      if (provider) {
        return NextResponse.json(
          {
            message:
              "This user has a provider profile. Remove or migrate the provider profile before changing the role.",
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role,
        updatedAt: new Date(),
      },
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

    return NextResponse.json({
      message: `User role changed to ${updated.role}.`,
      user: updated,
    });
  } catch (error) {
    console.error("Admin user role PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update user role." },
      { status: 500 }
    );
  }
}