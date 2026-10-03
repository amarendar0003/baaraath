import { NextResponse } from "next/server";
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

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { success: false, message: "Provider access required." },
        { status: 403 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Provider profile not found." },
        { status: 404 }
      );
    }

    const services = await prisma.service.findMany({
      where: {
        vendorId: vendor.id,
      },
      include: {
        Category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      services: services.map((service) => ({
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price.toString(),
        durationMinutes: service.durationMinutes,
        active: service.active,
        category: {
          id: service.Category.id,
          name: service.Category.name,
          slug: service.Category.slug,
        },
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Vendor services GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load services.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (session.role !== "PROVIDER") {
      return NextResponse.json(
        { success: false, message: "Provider access required." },
        { status: 403 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: {
        ownerId: session.userId,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Provider profile not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const categoryId = String(body.categoryId || "").trim();
    const price = Number(body.price);
    const durationMinutes = Number(body.durationMinutes);

    if (!title || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Service title and category are required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid price.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid duration.",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description: description || null,
        price,
        durationMinutes,
        active: true,
        vendorId: vendor.id,
        categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        Category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully.",
        service: {
          id: service.id,
          title: service.title,
          description: service.description,
          price: service.price.toString(),
          durationMinutes: service.durationMinutes,
          active: service.active,
          category: service.Category,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor services POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create service.",
      },
      { status: 500 }
    );
  }
}