const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('--- Database Users ---');
    if (users.length === 0) {
        console.log('No users found in the database.');
    } else {
        users.forEach(user => {
            console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, CreatedAt: ${user.createdAt}`);
        });
    }
    console.log('----------------------');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
