import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const slugInput = String(body.slug ?? "").trim().toLowerCase();

    if (!name || !slugInput) {
      return NextResponse.json(
        { message: "Category name and slug are required." },
        { status: 400 }
      );
    }

    const slug = slugInput
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return NextResponse.json(
        { message: "Please enter a valid category slug." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        AND: [
          {
            id: {
              not: id,
            },
          },
          {
            OR: [
              {
                name: {
                  equals: name,
                  mode: "insensitive",
                },
              },
              {
                slug,
              },
            ],
          },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          message:
            "Another category already uses this name or slug.",
        },
        { status: 409 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json({
      message: "Category updated successfully.",
      category: updated,
    });
  } catch (error) {
    console.error("Admin category PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            Service: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    if (category._count.Service > 0) {
      return NextResponse.json(
        {
          message:
            "This category cannot be deleted because services are using it. Move those services to another category first.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Admin category DELETE error:", error);

    return NextResponse.json(
      { message: "Unable to delete category." },
      { status: 500 }
    );
  }
}