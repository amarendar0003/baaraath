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

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            Service: true,
          },
        },
        Service: {
          select: {
            id: true,
            title: true,
            active: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        createdAt: category.createdAt.toISOString(),
        serviceCount: category._count.Service,
        services: category.Service,
      },
    });
  } catch (error) {
    console.error("Admin category GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load category.",
      },
      { status: 500 }
    );
  }
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

    const existing = await prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            Service: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    const data: {
      name?: string;
      slug?: string;
    } = {};

    if (body.name !== undefined) {
      const name = cleanText(body.name);

      if (!name) {
        return NextResponse.json(
          {
            message: "Category name is required.",
          },
          { status: 400 }
        );
      }

      const duplicateName = await prisma.category.findFirst({
        where: {
          name,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          {
            message: "Another category already uses this name.",
          },
          { status: 409 }
        );
      }

      data.name = name;
    }

    if (body.slug !== undefined || body.name !== undefined) {
      const requestedSlug =
        body.slug !== undefined
          ? cleanText(body.slug)
          : data.name || existing.name;

      const slug = createSlug(requestedSlug);

      if (!slug) {
        return NextResponse.json(
          {
            message: "Enter a valid category slug.",
          },
          { status: 400 }
        );
      }

      const duplicateSlug = await prisma.category.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          {
            message: "Another category already uses this slug.",
          },
          { status: 409 }
        );
      }

      data.slug = slug;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          message: "No changes supplied.",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: {
        id,
      },
      data,
      include: {
        _count: {
          select: {
            Service: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Category updated successfully.",
      category: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        createdAt: updated.createdAt.toISOString(),
        serviceCount: updated._count.Service,
      },
    });
  } catch (error) {
    console.error("Admin category PATCH error:", error);

    return NextResponse.json(
      {
        message: "Unable to update category.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();

    if (authError) {
      return authError;
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            Service: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    if (category._count.Service > 0) {
      return NextResponse.json(
        {
          message:
            "This category cannot be deleted because services are using it. Move those services to another category first.",
          serviceCount: category._count.Service,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Admin category DELETE error:", error);

    return NextResponse.json(
      {
        message: "Unable to delete category.",
      },
      { status: 500 }
    );
  }
}
