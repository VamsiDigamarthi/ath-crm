import 'dotenv/config';
import { prisma } from './src/config/db.js';

async function checkCount() {
  const count = await prisma.taxApplication.count();
  console.log(`Current Tax Applications in DB: ${count}`);
}

checkCount()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
