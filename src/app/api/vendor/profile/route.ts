import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { message: "Provider access required." },
        { status: 403 },
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
      include: {
        User: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor profile not found." },
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
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      },
      owner: {
        id: vendor.User.id,
        fullName: vendor.User.fullName,
        email: vendor.User.email,
        phone: vendor.User.phone,
      },
    });
  } catch (error) {
    console.error("Vendor profile GET error:", error);

    return NextResponse.json(
      { message: "Unable to load vendor profile." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { message: "Provider access required." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const city = String(body.city ?? "").trim();
    const address = String(body.address ?? "").trim();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { message: "Business name is required." },
        { status: 400 },
      );
    }

    if (!city) {
      return NextResponse.json(
        { message: "City is required." },
        { status: 400 },
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { message: "Owner name is required." },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
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
        { message: "Vendor profile not found." },
        { status: 404 },
      );
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: session.userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "This email address is already in use." },
        { status: 409 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: {
          id: session.userId,
        },
        data: {
          fullName,
          email,
          phone: phone || null,
          updatedAt: new Date(),
        },
      });

      const updatedVendor = await tx.vendor.update({
        where: {
          id: vendor.id,
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
        user: updatedUser,
        vendor: updatedVendor,
      };
    });

    return NextResponse.json({
      message: "Vendor profile updated successfully.",
      vendor: {
        id: updated.vendor.id,
        name: updated.vendor.name,
        description: updated.vendor.description,
        city: updated.vendor.city,
        address: updated.vendor.address,
        createdAt: updated.vendor.createdAt,
        updatedAt: updated.vendor.updatedAt,
      },
      owner: {
        id: updated.user.id,
        fullName: updated.user.fullName,
        email: updated.user.email,
        phone: updated.user.phone,
      },
    });
  } catch (error) {
    console.error("Vendor profile PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update vendor profile." },
      { status: 500 },
    );
  }
}
