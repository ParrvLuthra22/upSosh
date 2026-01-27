const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Database ready for production use.');
        console.log('No seed data - all events and bookings will be created by real users.');
        
        
        const userCount = await prisma.user.count();
        console.log(`Current users in database: ${userCount}`);
        
        
        const eventCount = await prisma.event.count();
        console.log(`Current events in database: ${eventCount}`);
        
        
        const hostCount = await prisma.host.count();
        console.log(`Current hosts in database: ${hostCount}`);

        console.log('\n✅ Production database is ready!');
        console.log('📝 Users can now:');
        console.log('   - Sign up and create accounts');
        console.log('   - Enable host mode to create events');
        console.log('   - Book tickets with real payments');
        console.log('   - View their bookings and tickets');
        
    } catch (e) {
        console.error('Database check failed:', e);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
