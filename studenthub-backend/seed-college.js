// seed-college.js
import { prisma } from "./src/config/prisma.js";
import { passwordHash } from "./src/utils/password.js";

async function main() {
  const adminEmail = "admin@apexcollege.edu";
  const rawPassword = "password123";

  // 1. Hash password
  const hashedPassword = await passwordHash(rawPassword);

  // 2. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log(`⚠️ User with email ${adminEmail} already exists!`);
    return;
  }

  // 3. Create COLLEGE_ADMIN User + College Record
  const user = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: "COLLEGE_ADMIN",
      college: {
        create: {
          name: "Apex College",
          code: "APEX",
          email: adminEmail, // 👈 Added missing college email field!
        },
      },
    },
    include: {
      college: true,
    },
  });

  console.log("✅ Seed Successful!");
  console.log("-----------------------------------------");
  console.log(`User ID:    ${user.id}`);
  console.log(`Email:      ${user.email}`);
  console.log(`Password:   ${rawPassword}`);
  console.log(`College:    ${user.college?.name} (ID: ${user.college?.id})`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });