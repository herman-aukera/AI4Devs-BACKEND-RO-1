/**
 * @fileoverview Custom Error Classes for Kanban Service
 * @author GG
 * @version 1.0.0
 */

/**
 * Base class for all Kanban-related errors
 */
export abstract class KanbanError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when an invalid position ID is provided
 */
export class InvalidPositionIdError extends KanbanError {
  readonly code = 'INVALID_POSITION_ID';

  constructor(positionId?: number | string) {
    super(positionId ? `Invalid position ID: ${positionId}` : 'Invalid position ID');
  }
}

/**
 * Thrown when a position is not found
 */
export class PositionNotFoundError extends KanbanError {
  readonly code = 'POSITION_NOT_FOUND';

  constructor(positionId: number) {
    super(`Position not found: ${positionId}`);
  }
}

/**
 * Thrown when an invalid candidate ID is provided
 */
export class InvalidCandidateIdError extends KanbanError {
  readonly code = 'INVALID_CANDIDATE_ID';

  constructor(candidateId?: number | string) {
    super(candidateId ? `Invalid candidate ID: ${candidateId}` : 'Invalid candidate ID');
  }
}

/**
 * Thrown when a candidate application is not found
 */
export class CandidateNotFoundError extends KanbanError {
  readonly code = 'CANDIDATE_NOT_FOUND';

  constructor(candidateId: number) {
    super(`Candidate application not found: ${candidateId}`);
  }
}

/**
 * Thrown when an invalid stage name is provided
 */
export class InvalidStageNameError extends KanbanError {
  readonly code = 'INVALID_STAGE_NAME';

  constructor(stageName?: string) {
    super(stageName ? `Invalid stage name: ${stageName}` : 'Invalid stage name');
  }
}

/**
 * Thrown when a required field is missing
 */
export class MissingFieldError extends KanbanError {
  readonly code = 'MISSING_FIELD';

  constructor(fieldName: string) {
    super(`${fieldName} is required`);
  }
}

/**
 * Type guard to check if an error is a KanbanError
 */
export function isKanbanError(error: unknown): error is KanbanError {
  return error instanceof KanbanError;
}
