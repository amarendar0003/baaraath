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
    const password = String(body.password || "");
    const role = String(body.role || "CUSTOMER").toUpperCase();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (fullName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid full name.",
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

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid phone number.",
        },
        { status: 400 }
      );
    }

    // Public registration is currently limited to customers.
    // Provider accounts will be created through the vendor registration flow.
    if (role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration role.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
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

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this phone number already exists.",
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        fullName,
        email,
        phone: phone || undefined,
        passwordHash,
        role: "CUSTOMER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create your account. Please try again.",
      },
      { status: 500 }
    );
  }
}