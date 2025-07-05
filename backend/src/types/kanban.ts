/**
 * TypeScript interfaces for Kanban endpoints
 */

export interface CandidateKanbanData {
  id: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
}

export interface PositionCandidatesResponse {
  candidates: CandidateKanbanData[];
}

export interface UpdateCandidateStageRequest {
  stage: string;
}

export interface UpdateCandidateStageResponse {
  success: boolean;
  candidateId: number;
  newStage: string;
}
