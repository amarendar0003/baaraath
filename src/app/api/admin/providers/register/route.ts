import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

function normalizeEmail(value: unknown) {
  return cleanText(value).toLowerCase();
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const body = await request.json();

    const businessName = cleanText(body.businessName);
    const description = cleanText(body.description);
    const city = cleanText(body.city);
    const address = cleanText(body.address);

    const fullName = cleanText(body.fullName);
    const email = normalizeEmail(body.email);
    const phone = cleanText(body.phone);
    const password = typeof body.password === "string"
      ? body.password
      : "";

    if (!businessName) {
      return NextResponse.json(
        { message: "Business name is required." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { message: "Provider owner name is required." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email address is required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { message: "City is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        Vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "A user account already exists with this email address.",
          existingUser: {
            id: existingUser.id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            role: existingUser.role,
            provider: existingUser.Vendor
              ? {
                  id: existingUser.Vendor.id,
                  name: existingUser.Vendor.name,
                }
              : null,
          },
        },
        { status: 409 }
      );
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: {
          phone,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            message: "A user account already exists with this phone number.",
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const now = new Date();
    const userId = crypto.randomUUID();
    const vendorId = crypto.randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          fullName,
          email,
          phone: phone || null,
          passwordHash,
          role: "PROVIDER",
          createdAt: now,
          updatedAt: now,
        },
      });

      const vendor = await tx.vendor.create({
        data: {
          id: vendorId,
          name: businessName,
          description: description || null,
          city,
          address: address || null,
          ownerId: user.id,
          createdAt: now,
          updatedAt: now,
        },
      });

      return {
        user,
        vendor,
      };
    });

    return NextResponse.json(
      {
        message: "Provider registered successfully.",
        provider: {
          id: result.vendor.id,
          name: result.vendor.name,
          description: result.vendor.description,
          city: result.vendor.city,
          address: result.vendor.address,
          createdAt: result.vendor.createdAt.toISOString(),
          owner: {
            id: result.user.id,
            fullName: result.user.fullName,
            email: result.user.email,
            phone: result.user.phone,
            role: result.user.role,
            createdAt: result.user.createdAt.toISOString(),
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin provider registration error:", error);

    return NextResponse.json(
      {
        message: "Unable to register provider.",
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
