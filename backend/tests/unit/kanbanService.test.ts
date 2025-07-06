import { createKanbanService } from '../../src/application/services/kanbanService';

// Mock Prisma client
const mockPrisma = {
  application: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  interview: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
  interviewStep: {
    findFirst: jest.fn(),
  },
  position: {
    findUnique: jest.fn(),
  },
} as any;

const kanbanService = createKanbanService(mockPrisma);
const { getPositionCandidates, updateCandidateStage } = kanbanService;

describe('KanbanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPositionCandidates', () => {
    test('should return candidates for a valid position ID', async () => {
      // Arrange
      const positionId = 1;
      const mockApplications = [
        {
          id: 1,
          candidateId: 1,
          candidate: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
          },
          interviewStep: {
            name: 'Technical Interview',
          },
        },
        {
          id: 2,
          candidateId: 2,
          candidate: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
          },
          interviewStep: {
            name: 'HR Interview',
          },
        },
      ];

      const mockScoreAggregates = [
        { applicationId: 1, _avg: { score: 85.5 } },
        { applicationId: 2, _avg: { score: 92.0 } },
      ];

      mockPrisma.application.findMany.mockResolvedValue(mockApplications);
      mockPrisma.interview.groupBy.mockResolvedValue(mockScoreAggregates);

      // Act
      const result = await getPositionCandidates(positionId);

      // Assert
      expect(result.candidates).toHaveLength(2);
      expect(result.candidates[0]).toEqual({
        id: 1,
        fullName: 'John Doe',
        currentInterviewStep: 'Technical Interview',
        averageScore: 85.5,
      });
      expect(result.candidates[1]).toEqual({
        id: 2,
        fullName: 'Jane Smith',
        currentInterviewStep: 'HR Interview',
        averageScore: 92.0,
      });
    });

    test('should return empty array for position with no applications', async () => {
      // Arrange
      const positionId = 999;
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.interview.groupBy.mockResolvedValue([]);
      mockPrisma.position.findUnique.mockResolvedValue({
        id: positionId,
        title: 'Test Position',
        // ... other position fields
      } as any);

      // Act
      const result = await getPositionCandidates(positionId);

      // Assert
      expect(result.candidates).toHaveLength(0);
    });

    test('should handle candidates with no interview scores', async () => {
      // Arrange
      const positionId = 1;
      const mockApplications = [
        {
          id: 1,
          candidateId: 1,
          candidate: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
          },
          interviewStep: {
            name: 'Initial Review',
          },
        },
      ];

      mockPrisma.application.findMany.mockResolvedValue(mockApplications);
      mockPrisma.interview.groupBy.mockResolvedValue([]); // No interview scores

      // Act
      const result = await getPositionCandidates(positionId);

      // Assert
      expect(result.candidates[0].averageScore).toBe(0);
    });

    test('should throw error for invalid position ID', async () => {
      // Arrange
      const invalidPositionId = -1;

      // Act & Assert
      await expect(getPositionCandidates(invalidPositionId)).rejects.toThrow('Invalid position ID');
    });
  });

  describe('updateCandidateStage', () => {
    test('should update candidate stage successfully', async () => {
      // Arrange
      const candidateId = 1;
      const newStage = 'Technical Interview';
      const mockInterviewStep = {
        id: 2,
        name: 'Technical Interview',
      };

      mockPrisma.interviewStep.findFirst.mockResolvedValue(mockInterviewStep);
      mockPrisma.application.updateMany.mockResolvedValue({ count: 1 });

      // Act
      const result = await updateCandidateStage(candidateId, newStage);

      // Assert
      expect(result.success).toBe(true);
      expect(result.candidateId).toBe(candidateId);
      expect(result.newStage).toBe(newStage);
    });

    test('should throw error for invalid candidate ID', async () => {
      // Arrange
      const invalidCandidateId = -1;
      const newStage = 'Technical Interview';

      // Act & Assert
      await expect(updateCandidateStage(invalidCandidateId, newStage)).rejects.toThrow('Invalid candidate ID');
    });

    test('should throw error for invalid stage name', async () => {
      // Arrange
      const candidateId = 1;
      const invalidStage = 'NonExistent Stage';

      mockPrisma.interviewStep.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(updateCandidateStage(candidateId, invalidStage)).rejects.toThrow('Invalid stage name');
    });

    test('should throw error when application not found', async () => {
      // Arrange
      const candidateId = 999;
      const newStage = 'Technical Interview';
      const mockInterviewStep = {
        id: 2,
        name: 'Technical Interview',
      };

      mockPrisma.interviewStep.findFirst.mockResolvedValue(mockInterviewStep);
      mockPrisma.application.updateMany.mockResolvedValue({ count: 0 });

      // Act & Assert
      await expect(updateCandidateStage(candidateId, newStage)).rejects.toThrow('Candidate application not found');
    });
  });
});
