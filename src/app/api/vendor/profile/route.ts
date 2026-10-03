import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Provider access required." },
        { status: 403 },
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        description: vendor.description,
        city: vendor.city,
        address: vendor.address,
        owner: vendor.User,
      },
    });
  } catch (error) {
    console.error("Vendor profile GET error:", error);

    return NextResponse.json(
      { error: "Unable to load vendor profile." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Provider access required." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const city = String(body.city ?? "").trim();
    const address = String(body.address ?? "").trim();
    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Business name is required." },
        { status: 400 },
      );
    }

    if (!city) {
      return NextResponse.json(
        { error: "City is required." },
        { status: 400 },
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Owner name is required." },
        { status: 400 },
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found." },
        { status: 404 },
      );
    }

    if (phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone,
          NOT: {
            id: session.userId,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "This phone number is already registered." },
          { status: 409 },
        );
      }
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedVendor = await tx.vendor.update({
        where: {
          id: vendor.id,
        },
        data: {
          name,
          description: description || null,
          city,
          address: address || null,
          updatedAt: now,
        },
      });

      const updatedUser = await tx.user.update({
        where: {
          id: session.userId,
        },
        data: {
          fullName,
          phone: phone || null,
          updatedAt: now,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      });

      return {
        vendor: updatedVendor,
        user: updatedUser,
      };
    });

    return NextResponse.json({
      message: "Vendor profile updated successfully.",
      vendor: {
        id: result.vendor.id,
        name: result.vendor.name,
        description: result.vendor.description,
        city: result.vendor.city,
        address: result.vendor.address,
        owner: result.user,
      },
    });
  } catch (error) {
    console.error("Vendor profile PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update vendor profile." },
      { status: 500 },
    );
  }
}
