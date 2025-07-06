import request from 'supertest';
import * as kanbanService from '../../src/application/services/kanbanService';
import { app } from '../../src/index';
import { CandidateNotFoundError, InvalidStageNameError, PositionNotFoundError } from '../../src/types/errors';

// Mock the kanban service
jest.mock('../../src/application/services/kanbanService');
const mockKanbanService = kanbanService as jest.Mocked<typeof kanbanService>;

describe('Kanban Controllers Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /positions/:id/candidates', () => {
    test('should return candidates for valid position ID', async () => {
      // Arrange
      const positionId = 1;
      const mockResponse = {
        candidates: [
          {
            id: 1,
            fullName: 'John Doe',
            currentInterviewStep: 'Technical Interview',
            averageScore: 85.5,
          },
          {
            id: 2,
            fullName: 'Jane Smith',
            currentInterviewStep: 'HR Interview',
            averageScore: 92.0,
          },
        ],
      };

      mockKanbanService.getPositionCandidates.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResponse);
      expect(mockKanbanService.getPositionCandidates).toHaveBeenCalledWith(positionId);
    });

    test('should return 400 for invalid position ID', async () => {
      // Act
      const response = await request(app)
        .get('/positions/invalid/candidates')
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid position ID format');
    });

    test('should return 404 when service throws error', async () => {
      // Arrange
      const positionId = 999;
      mockKanbanService.getPositionCandidates.mockRejectedValue(new PositionNotFoundError(positionId));

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('error');
    });

    test('should return empty candidates array for position with no applications', async () => {
      // Arrange
      const positionId = 1;
      const mockResponse = { candidates: [] };
      mockKanbanService.getPositionCandidates.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect(200);

      // Assert
      expect(response.body.candidates).toHaveLength(0);
    });

    test('should return 500 for unexpected service errors', async () => {
      // Arrange
      const positionId = 1;
      // Simulate unexpected non-Error object
      mockKanbanService.getPositionCandidates.mockRejectedValue('Unexpected error');

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('PUT /candidates/:id/stage', () => {
    test('should update candidate stage successfully', async () => {
      // Arrange
      const candidateId = 1;
      const requestBody = { stage: 'Technical Interview' };
      const mockResponse = {
        success: true,
        candidateId: candidateId,
        newStage: 'Technical Interview',
      };

      mockKanbanService.updateCandidateStage.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(requestBody)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResponse);
      expect(mockKanbanService.updateCandidateStage).toHaveBeenCalledWith(candidateId, 'Technical Interview');
    });

    test('should return 400 for invalid candidate ID', async () => {
      // Act
      const response = await request(app)
        .put('/candidates/invalid/stage')
        .send({ stage: 'Technical Interview' })
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid candidate ID format');
    });

    test('should return 400 for missing stage in request body', async () => {
      // Act
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({})
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Stage is required');
    });

    test('should return 400 for empty stage string', async () => {
      // Act
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ stage: '' })
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Stage cannot be empty');
    });

    test('should return 404 when service throws candidate not found error', async () => {
      // Arrange
      const candidateId = 999;
      const requestBody = { stage: 'Technical Interview' };
      mockKanbanService.updateCandidateStage.mockRejectedValue(new CandidateNotFoundError(candidateId));

      // Act
      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(requestBody)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 when service throws invalid stage error', async () => {
      // Arrange
      const candidateId = 1;
      const requestBody = { stage: 'Invalid Stage' };
      mockKanbanService.updateCandidateStage.mockRejectedValue(new InvalidStageNameError('Invalid Stage'));

      // Act
      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(requestBody)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
    });

    test('should return 500 for unexpected service errors', async () => {
      // Arrange
      const candidateId = 1;
      const requestBody = { stage: 'Technical Interview' };
      // Simulate unexpected non-Error object
      mockKanbanService.updateCandidateStage.mockRejectedValue('Unexpected error');

      // Act
      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(requestBody)
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });
  });
});
