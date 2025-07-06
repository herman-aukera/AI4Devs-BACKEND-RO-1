import request from 'supertest';
import { app } from '../../src/index';
import { CandidateNotFoundError, InvalidStageNameError, PositionNotFoundError } from '../../src/types/errors';

// Mock the kanban service module
jest.mock('../../src/application/services/kanbanService', () => ({
  getPositionCandidates: jest.fn(),
  updateCandidateStage: jest.fn(),
}));

// Import the mocked functions
import { getPositionCandidates, updateCandidateStage } from '../../src/application/services/kanbanService';

const mockGetPositionCandidates = getPositionCandidates as jest.MockedFunction<typeof getPositionCandidates>;
const mockUpdateCandidateStage = updateCandidateStage as jest.MockedFunction<typeof updateCandidateStage>;

describe('Kanban Controllers Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Ensure server is properly closed to prevent port conflicts
    if (app.listen) {
      const server = app.listen();
      server.close();
    }
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

      mockGetPositionCandidates.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResponse);
      expect(mockGetPositionCandidates).toHaveBeenCalledWith(positionId);
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
      mockGetPositionCandidates.mockRejectedValue(new PositionNotFoundError(positionId));

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Position not found: 999');
    });

    test('should return empty candidates array for position with no applications', async () => {
      // Arrange
      const positionId = 1;
      const mockResponse = { candidates: [] };
      mockGetPositionCandidates.mockResolvedValue(mockResponse);

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
      mockGetPositionCandidates.mockRejectedValue('Unexpected error');

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

      mockUpdateCandidateStage.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(requestBody)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResponse);
      expect(mockUpdateCandidateStage).toHaveBeenCalledWith(candidateId, 'Technical Interview');
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

    test('should return 400 for non-string stage value', async () => {
      // Act
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ stage: 123 }) // Sending a number instead of string
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Stage must be a string');
    });

    test('should return 404 when service throws candidate not found error', async () => {
      // Arrange
      const candidateId = 999;
      const requestBody = { stage: 'Technical Interview' };
      mockUpdateCandidateStage.mockRejectedValue(new CandidateNotFoundError(candidateId));

      // Act
      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(requestBody)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Candidate application not found: 999');
    });

    test('should return 400 when service throws invalid stage error', async () => {
      // Arrange
      const candidateId = 1;
      const requestBody = { stage: 'Invalid Stage' };
      mockUpdateCandidateStage.mockRejectedValue(new InvalidStageNameError('Invalid Stage'));

      // Act
      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(requestBody)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid stage name: Invalid Stage');
    });

    test('should return 500 for unexpected service errors', async () => {
      // Arrange
      const candidateId = 1;
      const requestBody = { stage: 'Technical Interview' };
      // Simulate unexpected non-Error object
      mockUpdateCandidateStage.mockRejectedValue('Unexpected error');

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
