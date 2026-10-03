import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function requireAdmin() {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  return null;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

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
        { error: "Category not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category,
    });
  } catch (error) {
    console.error("Admin category GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load category.",
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
  context: RouteContext
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    let body: {
      name?: unknown;
      slug?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Category slug is required." },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug can contain only lowercase letters, numbers and hyphens.",
        },
        { status: 400 }
      );
    }

    const existingCategory =
      await prisma.category.findUnique({
        where: { id },
      });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    const duplicateName =
      await prisma.category.findFirst({
        where: {
          name,
          NOT: { id },
        },
        select: { id: true },
      });

    if (duplicateName) {
      return NextResponse.json(
        {
          error:
            "Another category with this name already exists.",
        },
        { status: 409 }
      );
    }

    const duplicateSlug =
      await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id },
        },
        select: { id: true },
      });

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            "Another category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const updatedCategory =
      await prisma.category.update({
        where: { id },
        data: {
          name,
          slug,
        },
        include: {
          _count: {
            select: {
              Service: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Admin category PATCH error:", error);

    return NextResponse.json(
      {
        error: "Unable to update category.",
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
  context: RouteContext
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    const category =
      await prisma.category.findUnique({
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
        { error: "Category not found." },
        { status: 404 }
      );
    }

    if (category._count.Service > 0) {
      return NextResponse.json(
        {
          error:
            "This category cannot be deleted because services are using it.",
          serviceCount: category._count.Service,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Admin category DELETE error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete category.",
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