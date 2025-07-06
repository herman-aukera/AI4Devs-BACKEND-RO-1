import { Request, Response } from 'express';
import { getPositionCandidates, updateCandidateStage } from '../../application/services/kanbanService';
import {
  isKanbanError
} from '../../types/errors';

/**
 * Controller for GET /positions/:id/candidates
 * Retrieves all candidates for a specific position in kanban format
 */
export const getPositionCandidatesController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate position ID parameter
    const positionId = parseInt(req.params.id, 10);
    if (isNaN(positionId) || positionId <= 0) {
      res.status(400).json({ error: 'Invalid position ID format' });
      return;
    }

    // Call service to get candidates
    const result = await getPositionCandidates(positionId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPositionCandidatesController:', error);

    if (isKanbanError(error)) {
      switch (error.code) {
        case 'INVALID_POSITION_ID':
          res.status(400).json({ error: error.message });
          break;
        case 'POSITION_NOT_FOUND':
          res.status(404).json({ error: error.message });
          break;
        default:
          res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Controller for PUT /candidates/:id/stage
 * Updates a candidate's current interview stage
 */
export const updateCandidateStageController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate candidate ID parameter
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId) || candidateId <= 0) {
      res.status(400).json({ error: 'Invalid candidate ID format' });
      return;
    }

    // Validate request body
    const { stage } = req.body;
    if (stage === undefined || stage === null) {
      res.status(400).json({ error: 'Stage is required' });
      return;
    }

    if (typeof stage !== 'string') {
      res.status(400).json({ error: 'Stage must be a string' });
      return;
    }

    if (stage.trim() === '') {
      res.status(400).json({ error: 'Stage cannot be empty' });
      return;
    }

    // Call service to update candidate stage
    const result = await updateCandidateStage(candidateId, stage);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updateCandidateStageController:', error);

    if (isKanbanError(error)) {
      switch (error.code) {
        case 'INVALID_CANDIDATE_ID':
        case 'INVALID_STAGE_NAME':
          res.status(400).json({ error: error.message });
          break;
        case 'CANDIDATE_NOT_FOUND':
          res.status(404).json({ error: error.message });
          break;
        default:
          res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
