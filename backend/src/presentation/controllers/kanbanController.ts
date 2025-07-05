import { Request, Response } from 'express';
import { getPositionCandidates, updateCandidateStage } from '../../application/services/kanbanService';

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

    if (error instanceof Error) {
      if (error.message.includes('Invalid position ID')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
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

    if (error instanceof Error) {
      if (error.message.includes('Invalid candidate ID') || error.message.includes('Invalid stage name')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
