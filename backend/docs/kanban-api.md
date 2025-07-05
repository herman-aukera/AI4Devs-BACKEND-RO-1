/**
 * @fileoverview Kanban API Endpoints Documentation
 * @author GG
 * @version 1.0.0
 */

/**
 * @api {get} /positions/:id/candidates Get Position Candidates
 * @apiName GetPositionCandidates
 * @apiGroup Kanban
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieves all candidates in process for a specific position for kanban interface display
 * 
 * @apiParam {Number} id Position ID
 * 
 * @apiSuccess {Object[]} candidates Array of candidate objects
 * @apiSuccess {Number} candidates.id Candidate ID
 * @apiSuccess {String} candidates.fullName Candidate's full name (firstName + lastName)
 * @apiSuccess {String} candidates.currentInterviewStep Current interview step name
 * @apiSuccess {Number} candidates.averageScore Average score from all interviews (0 if no interviews)
 * 
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "candidates": [
 *     {
 *       "id": 1,
 *       "fullName": "John Doe",
 *       "currentInterviewStep": "Technical Interview",
 *       "averageScore": 85.5
 *     },
 *     {
 *       "id": 2,
 *       "fullName": "Jane Smith", 
 *       "currentInterviewStep": "HR Interview",
 *       "averageScore": 92.0
 *     }
 *   ]
 * }
 * 
 * @apiError (400) InvalidPositionID Position ID is invalid or not a number
 * @apiError (404) PositionNotFound Position with given ID was not found
 * @apiError (500) InternalServerError Unexpected server error
 * 
 * @apiErrorExample {json} Invalid Position ID:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": "Invalid position ID format"
 * }
 * 
 * @apiErrorExample {json} Position Not Found:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": "Position not found"
 * }
 */

/**
 * @api {put} /candidates/:id/stage Update Candidate Stage
 * @apiName UpdateCandidateStage
 * @apiGroup Kanban
 * @apiVersion 1.0.0
 * 
 * @apiDescription Updates a candidate's current interview stage/step
 * 
 * @apiParam {Number} id Candidate ID
 * @apiParam {String} stage New interview stage name (must match existing InterviewStep.name)
 * 
 * @apiParamExample {json} Request Body:
 * {
 *   "stage": "Technical Interview"
 * }
 * 
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Number} candidateId Updated candidate ID
 * @apiSuccess {String} newStage New stage name that was set
 * 
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "candidateId": 1,
 *   "newStage": "Technical Interview"
 * }
 * 
 * @apiError (400) InvalidCandidateID Candidate ID is invalid or not a number
 * @apiError (400) InvalidStage Stage name is invalid, empty, or doesn't exist
 * @apiError (400) MissingStage Stage field is missing from request body
 * @apiError (404) CandidateNotFound Candidate application was not found
 * @apiError (500) InternalServerError Unexpected server error
 * 
 * @apiErrorExample {json} Invalid Candidate ID:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": "Invalid candidate ID format"
 * }
 * 
 * @apiErrorExample {json} Missing Stage:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": "Stage is required"
 * }
 * 
 * @apiErrorExample {json} Empty Stage:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": "Stage cannot be empty"
 * }
 * 
 * @apiErrorExample {json} Invalid Stage Name:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": "Invalid stage name"
 * }
 * 
 * @apiErrorExample {json} Candidate Not Found:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": "Candidate application not found"
 * }
 */
