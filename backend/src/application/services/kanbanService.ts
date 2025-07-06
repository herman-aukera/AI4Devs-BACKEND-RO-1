import { PrismaClient } from '@prisma/client';
import {
  CandidateNotFoundError,
  InvalidCandidateIdError,
  InvalidPositionIdError,
  InvalidStageNameError,
  KanbanError,
  PositionNotFoundError
} from '../../types/errors';
import {
  CandidateKanbanData,
  PositionCandidatesResponse,
  UpdateCandidateStageResponse
} from '../../types/kanban';

// Export for dependency injection in tests
export const createKanbanService = (prismaClient: PrismaClient) => {
  /**
   * Retrieves all candidates for a specific position for kanban interface
   * @param positionId - The ID of the position
   * @returns Promise<PositionCandidatesResponse> - List of candidates with their data
   */
  const getPositionCandidates = async (positionId: number): Promise<PositionCandidatesResponse> => {
    // Validate input
    if (!positionId || positionId <= 0) {
      throw new InvalidPositionIdError(positionId);
    }

    try {
      // Get all applications for the position with candidate and interview step data
      const applications = await prismaClient.application.findMany({
        where: {
          positionId: positionId,
        },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          interviewStep: {
            select: {
              name: true,
            },
          },
        },
      });

      // If no applications found, verify the position exists
      if (applications.length === 0) {
        const position = await prismaClient.position.findUnique({
          where: { id: positionId },
        });

        if (!position) {
          throw new PositionNotFoundError(positionId);
        }
      }

      // Compute average scores for each application directly in the database
      const averageScores = await prismaClient.interview.groupBy({
        by: ['applicationId'],
        where: {
          application: {
            positionId: positionId,
          },
        },
        _avg: {
          score: true,
        },
      });

      // Map average scores to application IDs
      const scoreMap: Record<number, number> = {};
      averageScores.forEach((entry) => {
        scoreMap[entry.applicationId] = Math.round((entry._avg.score ?? 0) * 100) / 100; // Round to 2 decimals
      });

      // Map candidates with their scores
      const candidatesWithScores: CandidateKanbanData[] = applications.map((application) => ({
        id: application.candidate.id,
        fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        currentInterviewStep: application.interviewStep.name,
        averageScore: scoreMap[application.id] || 0,
      }));

      return {
        candidates: candidatesWithScores,
      };
    } catch (error) {
      console.error('Error fetching position candidates:', error);

      // Re-throw custom errors
      if (error instanceof KanbanError) {
        throw error;
      }

      // Wrap unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to retrieve candidates for position: ${errorMessage}`);
    }
  };

  /**
   * Updates a candidate's current interview stage
   * @param candidateId - The ID of the candidate
   * @param newStage - The new interview stage name
   * @returns Promise<UpdateCandidateStageResponse> - Success status and updated info
   */
  const updateCandidateStage = async (
    candidateId: number,
    newStage: string
  ): Promise<UpdateCandidateStageResponse> => {
    // Validate inputs
    if (!candidateId || candidateId <= 0) {
      throw new InvalidCandidateIdError(candidateId);
    }

    if (!newStage || newStage.trim() === '') {
      throw new InvalidStageNameError(newStage);
    }

    try {
      // Find the interview step by name
      const interviewStep = await prismaClient.interviewStep.findFirst({
        where: {
          name: newStage.trim(),
        },
      });

      if (!interviewStep) {
        throw new InvalidStageNameError(newStage.trim());
      }

      // Update the candidate's current interview step
      const updatedApplication = await prismaClient.application.updateMany({
        where: {
          candidateId: candidateId,
        },
        data: {
          currentInterviewStep: interviewStep.id,
        },
      });

      if (updatedApplication.count === 0) {
        throw new CandidateNotFoundError(candidateId);
      }

      return {
        success: true,
        candidateId: candidateId,
        newStage: newStage.trim(),
      };
    } catch (error) {
      console.error('Error updating candidate stage:', error);

      // Re-throw custom errors
      if (error instanceof KanbanError) {
        throw error;
      }

      // Wrap unexpected errors
      throw new Error('Failed to update candidate stage: Unknown error');
    }
  };

  return {
    getPositionCandidates,
    updateCandidateStage,
  };
};

// Default instance with real Prisma client
const prisma = new PrismaClient();
const kanbanService = createKanbanService(prisma);

export const getPositionCandidates = kanbanService.getPositionCandidates;
export const updateCandidateStage = kanbanService.updateCandidateStage;
