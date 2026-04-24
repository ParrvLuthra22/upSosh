const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    console.log(`✓ User ${email} is now an admin`);
    console.log(user);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email: node make-admin.js your@email.com');
  process.exit(1);
}

makeAdmin(email);
