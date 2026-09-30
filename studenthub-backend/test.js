import bcrypt from "bcrypt";
import { prisma } from "./src2/src/config/prisma.js";

const email = "aionmalla14@gmail.com";
const newPassword = "Test@1234";

const passwordHash = await bcrypt.hash(
  newPassword,
  12
);

const user = await prisma.user.update({
  where: {
    email,
  },
  data: {
    passwordHash,
  },
});

console.log("Password updated for:", user.email);
console.log("New password:", newPassword);

await prisma.$disconnect();