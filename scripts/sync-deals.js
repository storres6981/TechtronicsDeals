const { PrismaClient } = require('@prisma/client');
const { syncDeals } = require('../src/lib/services/dealService');

async function main() {
  try {
    console.log('Starting deal synchronization...');
    await syncDeals();
    console.log('Deal synchronization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during deal synchronization:', error);
    process.exit(1);
  }
}

main();