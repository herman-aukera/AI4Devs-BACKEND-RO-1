// Check existing data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    const companies = await prisma.company.findMany();
    console.log('Companies:', companies);

    const positions = await prisma.position.findMany();
    console.log('Positions:', positions);

    const candidates = await prisma.candidate.findMany();
    console.log('Candidates:', candidates);

    const applications = await prisma.application.findMany();
    console.log('Applications:', applications);

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
