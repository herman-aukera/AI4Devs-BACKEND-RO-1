const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('📊 POSITIONS:');
  const positions = await prisma.position.findMany({
    select: { id: true, title: true, status: true }
  });
  console.log(positions);

  console.log('\n📊 INTERVIEW STEPS:');
  const interviewSteps = await prisma.interviewStep.findMany({
    select: { id: true, name: true, orderIndex: true }
  });
  console.log(interviewSteps);

  console.log('\n📊 APPLICATIONS:');
  const applications = await prisma.application.findMany({
    select: {
      id: true,
      positionId: true,
      candidateId: true,
      currentInterviewStep: true
    }
  });
  console.log(applications);

  console.log('\n📊 CANDIDATES:');
  const candidates = await prisma.candidate.findMany({
    select: { id: true, firstName: true, lastName: true }
  });
  console.log(candidates);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
