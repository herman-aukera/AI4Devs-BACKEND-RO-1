import { PrismaClient } from '@prisma/client';
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
      throw new Error('Invalid position ID');
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

      // Get all interviews for this position in a single query to avoid N+1
      const interviews = await prismaClient.interview.findMany({
        where: {
          application: {
            positionId: positionId,
          },
        },
        select: {
          applicationId: true,
          score: true,
        },
      });

      // Calculate average scores for each application
      const scoreMap: Record<number, number> = {};
      const scoresByApplication: Record<number, number[]> = {};

      // Group scores by application
      interviews.forEach((interview) => {
        if (interview.score !== null) {
          if (!scoresByApplication[interview.applicationId]) {
            scoresByApplication[interview.applicationId] = [];
          }
          scoresByApplication[interview.applicationId].push(interview.score);
        }
      });

      // Calculate averages
      Object.entries(scoresByApplication).forEach(([applicationId, scores]) => {
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        scoreMap[parseInt(applicationId)] = Math.round(avg * 100) / 100; // Round to 2 decimals
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
      throw new Error('Failed to retrieve candidates for position');
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
      throw new Error('Invalid candidate ID');
    }

    if (!newStage || newStage.trim() === '') {
      throw new Error('Invalid stage name');
    }

    try {
      // Find the interview step by name
      const interviewStep = await prismaClient.interviewStep.findFirst({
        where: {
          name: newStage.trim(),
        },
      });

      if (!interviewStep) {
        throw new Error('Invalid stage name');
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
        throw new Error('Candidate application not found');
      }

      return {
        success: true,
        candidateId: candidateId,
        newStage: newStage.trim(),
      };
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update candidate stage');
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
