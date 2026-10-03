import { NextResponse } from "next/server";
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await params;
    const body = await request.json();

    const active = Boolean(body.active);

    const service = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        active: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        active,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        active: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: active
        ? "Service activated successfully."
        : "Service deactivated successfully.",
      service: updated,
    });
  } catch (error) {
    console.error("Admin service PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update service status." },
      { status: 500 }
    );
  }
}