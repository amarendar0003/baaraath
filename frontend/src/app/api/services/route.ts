import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const city = searchParams.get("city");
  const search = searchParams.get("q") || searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const where: Record<string, unknown> = { active: true };

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (category) {
      where.categoryId = category.id;
    }
  }

  if (city) {
    where.vendor = { city: { contains: city, mode: "insensitive" } };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const services = await prisma.service.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        vendor: { select: { name: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    let filtered = services;

    if (minPrice || maxPrice) {
      filtered = filtered.filter((s) => {
        const price = Number(s.price);
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;
        return true;
      });
    }

    const results = filtered.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.id,
      categoryName: s.category.name,
      categorySlug: s.category.slug,
      cityName: s.vendor.city,
      price: Number(s.price),
      priceUnit: "",
      rating: 0,
      averageRating: 0,
      reviewCount: 0,
      imageUrl: null,
      vendorName: s.vendor.name,
      description: s.description,
    }));

    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
