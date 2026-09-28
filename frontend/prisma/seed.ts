import {
  PrismaClient,
  UserRole,
  BookingStatus,
} from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear dependent records first so the seed can be safely rerun.
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const customer = await prisma.user.create({
    data: {
      name: "Demo Customer",
      email: "customer.demo@baaraath.test",
      phone: "+910000000001",
      role: UserRole.CUSTOMER,
    },
  });

  const vendorUser = await prisma.user.create({
    data: {
      name: "Demo Vendor",
      email: "vendor.demo@baaraath.test",
      phone: "+910000000002",
      role: UserRole.VENDOR,
    },
  });

  const vendor = await prisma.vendor.create({
    data: {
      userId: vendorUser.id,
      businessName: "Royal Garden Events",
      description: "Sample venue profile for development and UI testing.",
      city: "Hyderabad",
      address: "Demo Road, Hyderabad",
      isVerified: true,
    },
  });

  const banquetCategory = await prisma.category.create({
    data: {
      name: "Banquet Halls",
      slug: "banquet-hall",
    },
  });

  const cateringCategory = await prisma.category.create({
    data: {
      name: "Catering",
      slug: "catering",
    },
  });

  const banquetService = await prisma.service.create({
    data: {
      vendorId: vendor.id,
      categoryId: banquetCategory.id,
      name: "Royal Garden Banquet Hall",
      description: "Sample banquet hall listing for the development site.",
      city: "Hyderabad",
      price: "45000.00",
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      vendorId: vendor.id,
      categoryId: cateringCategory.id,
      name: "Celebration Catering Package",
      description: "Sample catering listing with a dummy price.",
      city: "Hyderabad",
      price: "850.00",
      isActive: true,
    },
  });

  await prisma.booking.create({
    data: {
      customerId: customer.id,
      serviceId: banquetService.id,
      eventDate: new Date("2027-02-14T12:00:00.000Z"),
      guestCount: 150,
      status: BookingStatus.PENDING,
      totalAmount: "45000.00",
    },
  });

  console.log("Baaraath dummy data inserted.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });