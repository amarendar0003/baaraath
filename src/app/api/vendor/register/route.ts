import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();

    const businessName = String(body.businessName || "").trim();
    const description = String(body.description || "").trim();
    const city = String(body.city || "").trim();
    const address = String(body.address || "").trim();
    const registrationNumber = String(
      body.registrationNumber || ""
    ).trim();

    const password = String(body.password || "");

    if (
      !fullName ||
      !email ||
      !phone ||
      !businessName ||
      !city ||
      !address ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid phone number.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "This phone number is already registered.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userId = crypto.randomUUID();
    const vendorId = crypto.randomUUID();
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          fullName,
          email,
          phone,
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
          address,
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

    await createSession({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Provider account created successfully.",
        user: {
          id: result.user.id,
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
        },
        vendor: {
          id: result.vendor.id,
          name: result.vendor.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create provider account.",
      },
      { status: 500 }
    );
  }
}