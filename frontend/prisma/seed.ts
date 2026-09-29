import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  UserRole,
  BookingStatus,
} from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from your .env file.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting Baaraath demo seed...");

  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);
  const providerPasswordHash = await bcrypt.hash("Provider@123", 10);

  // Create or update the demo customer by unique email.
  const customer = await prisma.user.upsert({
    where: {
      email: "customer.demo@baaraath.test",
    },
    update: {
      fullName: "Baaraath Demo Customer",
      role: UserRole.CUSTOMER,
      passwordHash: customerPasswordHash,
    },
    create: {
      fullName: "Baaraath Demo Customer",
      email: "customer.demo@baaraath.test",
      role: UserRole.CUSTOMER,
      passwordHash: customerPasswordHash,
    },
  });

  // Create or update the demo provider by unique email.
  const providerUser = await prisma.user.upsert({
    where: {
      email: "provider.demo@baaraath.test",
    },
    update: {
      fullName: "Baaraath Demo Provider",
      role: UserRole.PROVIDER,
      passwordHash: providerPasswordHash,
    },
    create: {
      fullName: "Baaraath Demo Provider",
      email: "provider.demo@baaraath.test",
      role: UserRole.PROVIDER,
      passwordHash: providerPasswordHash,
    },
  });

  // Find or create the provider's vendor profile.
  let vendor = await prisma.vendor.findFirst({
    where: {
      ownerId: providerUser.id,
      name: "Royal Garden Events",
    },
  });

  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        ownerId: providerUser.id,
        name: "Royal Garden Events",
        description:
          "Sample venue profile for Baaraath development and UI testing.",
        city: "Hyderabad",
        address: "Demo Road, Hyderabad",
      },
    });
  }

  // Find or create the banquet category.
  let banquetCategory = await prisma.category.findFirst({
    where: {
      slug: "banquet-hall",
    },
  });

  if (!banquetCategory) {
    banquetCategory = await prisma.category.create({
      data: {
        name: "Banquet Halls",
        slug: "banquet-hall",
      },
    });
  }

  // Find or create the catering category.
  let cateringCategory = await prisma.category.findFirst({
    where: {
      slug: "catering",
    },
  });

  if (!cateringCategory) {
    cateringCategory = await prisma.category.create({
      data: {
        name: "Catering",
        slug: "catering",
      },
    });
  }

  // Find or create the music band category.
  let musicBandCategory = await prisma.category.findFirst({
    where: {
      slug: "music-band",
    },
  });

  if (!musicBandCategory) {
    musicBandCategory = await prisma.category.create({
      data: {
        name: "Music Band",
        slug: "music-band",
      },
    });
  }

  // Find or create the hotels category.
  let hotelsCategory = await prisma.category.findFirst({
    where: {
      slug: "hotels",
    },
  });

  if (!hotelsCategory) {
    hotelsCategory = await prisma.category.create({
      data: {
        name: "Hotels",
        slug: "hotels",
      },
    });
  }

  // Find or create the dancing category.
  let dancingCategory = await prisma.category.findFirst({
    where: {
      slug: "dancing",
    },
  });

  if (!dancingCategory) {
    dancingCategory = await prisma.category.create({
      data: {
        name: "Dancing",
        slug: "dancing",
      },
    });
  }

  // Find or create the priests category.
  let priestsCategory = await prisma.category.findFirst({
    where: {
      slug: "priests",
    },
  });

  if (!priestsCategory) {
    priestsCategory = await prisma.category.create({
      data: {
        name: "Priests",
        slug: "priests",
      },
    });
  }

  // Find or create the event management category.
  let eventManagementCategory = await prisma.category.findFirst({
    where: {
      slug: "event-management",
    },
  });

  if (!eventManagementCategory) {
    eventManagementCategory = await prisma.category.create({
      data: {
        name: "Event Management",
        slug: "event-management",
      },
    });
  }

  // Find or create the banquet service.
  let banquetService = await prisma.service.findFirst({
    where: {
      vendorId: vendor.id,
      title: "Royal Garden Banquet Hall",
    },
  });

  if (!banquetService) {
    banquetService = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        categoryId: banquetCategory.id,
        title: "Royal Garden Banquet Hall",
        description:
          "Sample banquet hall listing for development and UI testing.",
        price: "45000.00",
        active: true,
      },
    });
  }

  // Find or create the catering service.
  let cateringService = await prisma.service.findFirst({
    where: {
      vendorId: vendor.id,
      title: "Celebration Catering Package",
    },
  });

  if (!cateringService) {
    cateringService = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        categoryId: cateringCategory.id,
        title: "Celebration Catering Package",
        description: "Sample catering listing with a dummy price.",
        price: "850.00",
        active: true,
      },
    });
  }

  const extraServices = [
    {
      title: "Harmony Music Band",
      category: musicBandCategory.id,
      price: "50000.00",
      description: "Live music band for weddings and corporate events.",
    },
    {
      title: "Luxury Hotel Venue",
      category: hotelsCategory.id,
      price: "250000.00",
      description: "Premium hotel venue for grand celebrations.",
    },
    {
      title: "Classical Dance Performance",
      category: dancingCategory.id,
      price: "35000.00",
      description: "Traditional and classical dance performances.",
    },
    {
      title: "Traditional Pooja Services",
      category: priestsCategory.id,
      price: "5000.00",
      description: "Authentic pooja and ritual services.",
    },
    {
      title: "Elite Event Planners",
      category: eventManagementCategory.id,
      price: "120000.00",
      description: "Complete event planning and coordination.",
    },
  ];

  for (const s of extraServices) {
    const existing = await prisma.service.findFirst({
      where: { vendorId: vendor.id, title: s.title },
    });

    if (!existing) {
      await prisma.service.create({
        data: {
          vendorId: vendor.id,
          categoryId: s.category,
          title: s.title,
          description: s.description,
          price: s.price,
          active: true,
        },
      });
    }
  }

  // Create one demo booking if the matching booking does not exist.
  const bookingDate = new Date("2027-02-14T12:00:00.000Z");

  const existingBooking = await prisma.booking.findFirst({
    where: {
      customerId: customer.id,
      serviceId: banquetService.id,
      bookingDate,
    },
  });

  if (!existingBooking) {
    await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: banquetService.id,
        bookingDate,
        status: BookingStatus.PENDING,
        notes: "Demo booking for Baaraath development testing.",
      },
    });
  }

  console.log("Baaraath demo seed completed successfully.");
  console.log(`Customer: ${customer.email}`);
  console.log(`Provider: ${providerUser.email}`);
  console.log(`Vendor: ${vendor.name}`);
  console.log(`Banquet service: ${banquetService.title}`);
  console.log(`Catering service: ${cateringService.title}`);
}

main()
  .catch((error: unknown) => {
    console.error("Baaraath seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });