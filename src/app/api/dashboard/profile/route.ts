import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load profile.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();

    if (fullName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid full name.",
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

    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          NOT: {
            id: session.userId,
          },
        },
        select: {
          id: true,
        },
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
    }

    const user = await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: {
        fullName,
        phone: phone || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update profile.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current and new passwords are required.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message: "Password authentication is not available for this account.",
        },
        { status: 400 }
      );
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 401 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Password change error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to change password.",
      },
      { status: 500 }
    );
  }
}