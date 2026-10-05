import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validRoles = ["CUSTOMER", "PROVIDER", "ADMIN"] as const;

async function requireAdmin() {
  const session = await getSession();

  if (!session?.userId) {
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

function serializeUser(user: any) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt?.toISOString?.() ?? user.createdAt,
    updatedAt: user.updatedAt?.toISOString?.() ?? user.updatedAt,
    provider: user.Vendor
      ? {
          id: user.Vendor.id,
          name: user.Vendor.name,
          city: user.Vendor.city,
          address: user.Vendor.address,
        }
      : null,
    bookingCount: user._count?.Booking ?? 0,
  };
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

    const user = await prisma.user.findUnique({
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
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Admin user GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load user.",
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

    const session = await getSession();
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const data: {
      fullName?: string;
      email?: string;
      phone?: string | null;
      role?: (typeof validRoles)[number];
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (body.fullName !== undefined) {
      const fullName =
        typeof body.fullName === "string"
          ? body.fullName.trim()
          : "";

      if (!fullName) {
        return NextResponse.json(
          { message: "Full name is required." },
          { status: 400 }
        );
      }

      data.fullName = fullName;
    }

    if (body.email !== undefined) {
      const email =
        typeof body.email === "string"
          ? body.email.trim().toLowerCase()
          : "";

      if (!email) {
        return NextResponse.json(
          { message: "Email is required." },
          { status: 400 }
        );
      }

      const duplicateEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { message: "Another user already uses this email." },
          { status: 409 }
        );
      }

      data.email = email;
    }

    if (body.phone !== undefined) {
      const phone =
        typeof body.phone === "string"
          ? body.phone.trim()
          : "";

      if (phone) {
        const duplicatePhone = await prisma.user.findFirst({
          where: {
            phone,
            NOT: { id },
          },
          select: { id: true },
        });

        if (duplicatePhone) {
          return NextResponse.json(
            { message: "Another user already uses this phone number." },
            { status: 409 }
          );
        }

        data.phone = phone;
      } else {
        data.phone = null;
      }
    }

    if (body.role !== undefined) {
      const role = String(body.role).toUpperCase();

      if (!validRoles.includes(role as (typeof validRoles)[number])) {
        return NextResponse.json(
          {
            message:
              "Invalid role. Allowed roles: CUSTOMER, PROVIDER, ADMIN.",
          },
          { status: 400 }
        );
      }

      if (
        existing.role === "ADMIN" &&
        role !== "ADMIN"
      ) {
        const adminCount = await prisma.user.count({
          where: {
            role: "ADMIN",
          },
        });

        if (adminCount <= 1) {
          return NextResponse.json(
            {
              message:
                "The last administrator cannot be changed to another role.",
            },
            { status: 409 }
          );
        }
      }

      data.role = role as (typeof validRoles)[number];
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      include: {
        Vendor: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
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
      message: "User updated successfully.",
      user: serializeUser(updated),
    });
  } catch (error) {
    console.error("Admin user PATCH error:", error);

    return NextResponse.json(
      {
        message: "Unable to update user.",
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

    const session = await getSession();
    const { id } = await params;

    if (!session?.userId) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    if (session.userId === id) {
      return NextResponse.json(
        {
          message:
            "You cannot delete the administrator account you are currently using.",
        },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        _count: {
          select: {
            Booking: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            message:
              "The last administrator account cannot be deleted.",
          },
          { status: 409 }
        );
      }
    }

    if (user._count.Booking > 0) {
      return NextResponse.json(
        {
          message:
            "This user cannot be deleted because booking records are associated with this account.",
          bookingCount: user._count.Booking,
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User deleted successfully.",
      deletedUserId: id,
    });
  } catch (error) {
    console.error("Admin user DELETE error:", error);

    return NextResponse.json(
      {
        message: "Unable to delete user.",
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
