import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@flexiid.com" },
    update: {},
    create: {
      email: "admin@flexiid.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create sample employee for testing
  const sampleEmployee = await prisma.employee.upsert({
    where: { employeeId: "8009654" },
    update: {},
    create: {
      employeeId: "8009654",
      firstName: "Muhammad",
      lastName: "Talha",
      designation: "Graphic Designer",
      department: "Product",
      city: "Islamabad",
      contactNumber: "+92 345 778 9876",
      mobileNumber: "+92 321 456 7890",
      cnic: "31201-9822345-5",
      bloodGroup: "B-",
      emergencyContact: "+92 345 678 9900",
      dateOfBirth: new Date("1994-04-08"),
      dateOfJoining: new Date("2025-07-10"),
    },
  });

  console.log("Created sample employee:", sampleEmployee.firstName, sampleEmployee.lastName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
