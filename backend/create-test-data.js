// Quick test data creation script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('Creating test data...');

    // Create a company
    const company = await prisma.company.create({
      data: {
        name: 'Test Company',
      },
    });
    console.log('Created company:', company);

    // Create interview flow
    const interviewFlow = await prisma.interviewFlow.create({
      data: {
        description: 'Standard interview process',
      },
    });
    console.log('Created interview flow:', interviewFlow);

    // Create interview types first
    const interviewType1 = await prisma.interviewType.create({
      data: {
        name: 'Standard Interview',
      },
    });

    const interviewType2 = await prisma.interviewType.create({
      data: {
        name: 'Technical Interview',
      },
    });

    // Create interview steps
    const step1 = await prisma.interviewStep.create({
      data: {
        name: 'Initial Interview',
        orderIndex: 1,
        interviewFlowId: interviewFlow.id,
        interviewTypeId: interviewType1.id,
      },
    });

    const step2 = await prisma.interviewStep.create({
      data: {
        name: 'Technical Interview',
        orderIndex: 2,
        interviewFlowId: interviewFlow.id,
        interviewTypeId: interviewType2.id,
      },
    });

    const step3 = await prisma.interviewStep.create({
      data: {
        name: 'Final Interview',
        orderIndex: 3,
        interviewFlowId: interviewFlow.id,
        interviewTypeId: interviewType1.id,
      },
    });
    console.log('Created interview steps');

    // Create a position
    const position = await prisma.position.create({
      data: {
        title: 'Software Engineer',
        description: 'Test position for kanban',
        status: 'Open',
        isVisible: true,
        location: 'Remote',
        jobDescription: 'Test job',
        companyId: company.id,
        interviewFlowId: interviewFlow.id,
        salaryMin: 50000,
        salaryMax: 80000,
        employmentType: 'Full-time',
        benefits: 'Health insurance',
        contactInfo: 'test@example.com',
        requirements: 'Test requirements',
        responsibilities: 'Test responsibilities',
        companyDescription: 'Test company description',
        applicationDeadline: new Date('2024-12-31')
      },
    });
    console.log('Created position:', position);

    // Create candidates
    const candidate1 = await prisma.candidate.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0001',
      },
    });

    const candidate2 = await prisma.candidate.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-0002',
      },
    });
    console.log('Created candidates');

    // Create applications
    const application1 = await prisma.application.create({
      data: {
        applicationDate: new Date(),
        status: 'In Progress',
        positionId: position.id,
        candidateId: candidate1.id,
        currentInterviewStep: step1.id,
      },
    });

    const application2 = await prisma.application.create({
      data: {
        applicationDate: new Date(),
        status: 'In Progress',
        positionId: position.id,
        candidateId: candidate2.id,
        currentInterviewStep: step2.id,
      },
    });
    console.log('Created applications');

    // Create some interview scores
    await prisma.interview.create({
      data: {
        interviewDate: new Date(),
        score: 8.5,
        notes: 'Good performance',
        applicationId: application1.id,
        employeeId: null,
        interviewTypeId: null,
      },
    });

    await prisma.interview.create({
      data: {
        interviewDate: new Date(),
        score: 7.0,
        notes: 'Average performance',
        applicationId: application1.id,
        employeeId: null,
        interviewTypeId: null,
      },
    });

    await prisma.interview.create({
      data: {
        interviewDate: new Date(),
        score: 9.0,
        notes: 'Excellent performance',
        applicationId: application2.id,
        employeeId: null,
        interviewTypeId: null,
      },
    });
    console.log('Created interview scores');

    console.log('Test data created successfully!');
    console.log(`Position ID: ${position.id}`);
    console.log(`Candidate 1 ID: ${candidate1.id}`);
    console.log(`Candidate 2 ID: ${candidate2.id}`);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
