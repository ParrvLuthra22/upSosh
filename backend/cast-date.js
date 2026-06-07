const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Altering Event.date to timestamp...");
    await prisma.$executeRawUnsafe('ALTER TABLE "Event" ALTER COLUMN date TYPE timestamp(3) without time zone USING date::timestamp(3);');
    console.log("Success.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
