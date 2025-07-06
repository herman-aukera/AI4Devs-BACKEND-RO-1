import { Router } from 'express';
import {
  getPositionCandidatesController,
  updateCandidateStageController
} from '../presentation/controllers/kanbanController';

const router = Router();

/**
 * GET /positions/:id/candidates
 * Retrieves all candidates for a specific position for kanban interface
 */
router.get('/positions/:id/candidates', getPositionCandidatesController);

/**
 * PUT /candidates/:id/stage
 * Updates a candidate's current interview stage
 */
router.put('/candidates/:id/stage', updateCandidateStageController);

export default router;
