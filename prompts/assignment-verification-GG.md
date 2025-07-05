# 🎯 LTI Kanban Endpoints Assignment Verification Prompt

## Mission Statement
**Execute comprehensive validation to confirm the LTI kanban endpoints assignment is 100% complete, functional, and meets all requirements. Use Chain-of-Thought reasoning for every verification step.**

---

## 🧠 Chain-of-Thought Verification Framework

**Apply systematic reasoning at each step. Think step-by-step, validate assumptions, and provide evidence for every conclusion.**

### Phase 1: Assignment Requirements Analysis
```
CoT Process:
1. "I'm analyzing the original assignment requirements..."
2. "The first endpoint GET /positions/:id/candidates must return..."
3. "The second endpoint PUT /candidates/:id/stage must accomplish..."
4. "The deliverables specified are..."
5. "Success criteria include..."
```

### Phase 2: Implementation Discovery
```
CoT Process:
1. "I'm examining the file structure to locate implementation files..."
2. "The routing configuration should be in..."
3. "The controller logic should handle..."
4. "The service layer should implement..."
5. "The database queries should perform..."
```

### Phase 3: Functional Validation
```
CoT Process:
1. "I'm testing the GET endpoint with a real position ID..."
2. "The response schema should match..."
3. "I'm testing the PUT endpoint with a valid stage update..."
4. "Error scenarios should return proper HTTP codes because..."
5. "Performance characteristics should meet..."
```

---

## 🔍 Systematic Verification Checklist

### ✅ **Requirement 1: GET /positions/:id/candidates**

**Expected Behavior:**
- Retrieve all candidates for a specific position
- Return full name (firstName + lastName)
- Include current interview step name
- Calculate and return average interview score

**Verification Steps:**
1. **Code Inspection:**
   - [ ] Route defined: `GET /positions/:id/candidates`
   - [ ] Controller handles request properly
   - [ ] Service implements business logic
   - [ ] Database query joins Position → Application → Candidate
   - [ ] Score aggregation logic implemented

2. **Functional Testing:**
   - [ ] Endpoint returns 200 OK for valid position ID
   - [ ] Response contains `candidates` array
   - [ ] Each candidate has: `id`, `fullName`, `currentInterviewStep`, `averageScore`
   - [ ] Full name concatenates firstName + lastName correctly
   - [ ] Average score calculated from Interview.score values
   - [ ] Current interview step shows InterviewStep.name

3. **Error Handling:**
   - [ ] Returns 400 for invalid position ID format
   - [ ] Returns 404 for non-existent position ID
   - [ ] Returns 500 for database errors
   - [ ] Error messages are descriptive

**Test Commands:**
```bash
# Test valid request
curl -X GET http://localhost:3010/positions/1/candidates

# Test invalid ID
curl -X GET http://localhost:3010/positions/invalid/candidates

# Test non-existent ID
curl -X GET http://localhost:3010/positions/999999/candidates
```

### ✅ **Requirement 2: PUT /candidates/:id/stage**

**Expected Behavior:**
- Update candidate's interview stage
- Validate stage exists in InterviewStep table
- Update Application.currentInterviewStep

**Verification Steps:**
1. **Code Inspection:**
   - [ ] Route defined: `PUT /candidates/:id/stage`
   - [ ] Controller validates request body
   - [ ] Service validates stage name exists
   - [ ] Database update targets Application table

2. **Functional Testing:**
   - [ ] Endpoint returns 200 OK for valid update
   - [ ] Response confirms success with updated details
   - [ ] Database record actually updated
   - [ ] Stage name validation works correctly

3. **Error Handling:**
   - [ ] Returns 400 for invalid candidate ID
   - [ ] Returns 400 for missing/empty stage
   - [ ] Returns 400 for invalid stage name
   - [ ] Returns 404 for non-existent candidate
   - [ ] Returns 500 for database errors

**Test Commands:**
```bash
# Test valid update
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"stage": "Technical Interview"}'

# Test invalid stage
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"stage": "Invalid Stage"}'

# Test missing body
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{}'
```

### ✅ **Deliverable 1: Backend Implementation**

**File Structure Verification:**
```bash
# Check required files exist
ls -la backend/src/routes/kanbanRoutes.ts
ls -la backend/src/presentation/controllers/kanbanController.ts
ls -la backend/src/application/services/kanbanService.ts
ls -la backend/src/types/kanban.ts
```

**Code Quality Checks:**
```bash
# TypeScript compilation
cd backend && npm run build

# Test execution
cd backend && npm test

# Linting (if configured)
cd backend && npm run lint
```

### ✅ **Deliverable 2: Git Repository Management**

**Branch Verification:**
```bash
# Check current branch name includes "GG"
git branch --show-current | grep -i "gg"

# Check commit history
git log --oneline -5

# Check remote tracking
git status
```

**Pull Request Verification:**
```bash
# Check if PR exists (if using GitHub CLI)
gh pr list

# Or check remote branches
git ls-remote origin | grep -i "gg"
```

### ✅ **Deliverable 3: Documentation**

**Prompt Documentation Check:**
```bash
# Verify prompts-GG.md exists
ls -la prompts/prompts-GG.md

# Check content includes prompt evolution
cat prompts/prompts-GG.md | head -20
```

**API Documentation Check:**
```bash
# Check if API docs exist
ls -la backend/docs/

# Verify JSDoc comments in code
grep -r "@api" backend/src/ || grep -r "/**" backend/src/
```

---

## 🧪 Comprehensive Testing Protocol

### **Database Schema Validation**
```sql
-- Verify required tables and relationships exist
SELECT
  table_name
FROM information_schema.tables
WHERE table_name IN ('Position', 'Application', 'Candidate', 'Interview', 'InterviewStep');

-- Test the actual join query
SELECT
  c.id,
  CONCAT(c.firstName, ' ', c.lastName) as fullName,
  ist.name as currentInterviewStep,
  AVG(i.score) as averageScore
FROM Position p
JOIN Application a ON p.id = a.positionId
JOIN Candidate c ON a.candidateId = c.id
JOIN InterviewStep ist ON a.currentInterviewStep = ist.id
LEFT JOIN Interview i ON a.id = i.applicationId
WHERE p.id = 1
GROUP BY c.id, c.firstName, c.lastName, ist.name;
```

### **Performance Testing**
```bash
# Test response times
time curl -X GET http://localhost:3010/positions/1/candidates

# Test with multiple requests
for i in {1..10}; do
  curl -w "%{time_total}\n" -o /dev/null -s http://localhost:3010/positions/1/candidates
done
```

### **Load Testing (Optional)**
```bash
# Using Apache Bench if available
ab -n 100 -c 10 http://localhost:3010/positions/1/candidates
```

---

## 🎯 Final Verification Command Sequence

**Execute this exact sequence to validate everything:**

```bash
# 1. Navigate to project
cd /path/to/AI4Devs-BACKEND-RO-1

# 2. Check branch name
echo "Current branch: $(git branch --show-current)"
git branch --show-current | grep -i "gg" && echo "✅ Branch name includes GG" || echo "❌ Branch name missing GG"

# 3. Check file structure
echo "📁 Checking file structure..."
ls -la backend/src/routes/kanbanRoutes.ts 2>/dev/null && echo "✅ Routes file exists" || echo "❌ Routes file missing"
ls -la backend/src/presentation/controllers/kanbanController.ts 2>/dev/null && echo "✅ Controller file exists" || echo "❌ Controller file missing"
ls -la backend/src/application/services/kanbanService.ts 2>/dev/null && echo "✅ Service file exists" || echo "❌ Service file missing"
ls -la prompts/prompts-GG.md 2>/dev/null && echo "✅ Prompts documentation exists" || echo "❌ Prompts documentation missing"

# 4. Test compilation
echo "🔧 Testing TypeScript compilation..."
cd backend && npm run build && echo "✅ Compilation successful" || echo "❌ Compilation failed"

# 5. Run tests
echo "🧪 Running tests..."
npm test 2>&1 | tail -10

# 6. Start server in background for endpoint testing
echo "🚀 Starting server..."
npm run dev &
SERVER_PID=$!
sleep 5

# 7. Test endpoints
echo "🔍 Testing GET endpoint..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3010/positions/1/candidates | grep 200 && echo "✅ GET endpoint working" || echo "❌ GET endpoint failed"

echo "🔍 Testing PUT endpoint..."
curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://localhost:3010/candidates/1/stage -H "Content-Type: application/json" -d '{"stage": "Technical Interview"}' | grep 200 && echo "✅ PUT endpoint working" || echo "❌ PUT endpoint failed"

# 8. Stop server
kill $SERVER_PID 2>/dev/null

# 9. Check git status
echo "📋 Git status:"
git status --porcelain

# 10. Check if ready for PR
echo "🎯 Assignment completion status:"
echo "✅ All checks completed. Review output above for any ❌ indicators."
```

---

## 🏆 Success Criteria Summary

**Assignment is COMPLETE when ALL of these are true:**

### 🔧 **Technical Implementation**
- [ ] GET /positions/:id/candidates returns correct data format
- [ ] PUT /candidates/:id/stage successfully updates stages
- [ ] Error handling covers all edge cases
- [ ] TypeScript compiles without errors
- [ ] Tests pass and provide good coverage
- [ ] Database queries are optimized

### 📦 **Deliverables**
- [ ] Code in /backend folder
- [ ] Branch named with "GG" initials
- [ ] Pull request created and functional
- [ ] prompts-GG.md in /prompts folder
- [ ] Documentation tracks prompt evolution

### 🎯 **Quality Standards**
- [ ] Clean architecture patterns followed
- [ ] Proper separation of concerns
- [ ] Comprehensive error handling
- [ ] Performance meets expectations
- [ ] Code is maintainable and readable

---

## 🚨 Common Issues to Check

1. **Missing Files**: Ensure all required files exist in correct locations
2. **Branch Naming**: Verify branch includes "GG" initials exactly as specified
3. **Endpoint Paths**: Confirm routes match specification exactly
4. **Response Format**: Verify JSON structure matches requirements
5. **Error Codes**: Ensure proper HTTP status codes for all scenarios
6. **Database Queries**: Check for proper joins and aggregation
7. **TypeScript Errors**: Fix all compilation issues
8. **Test Coverage**: Ensure comprehensive test suite
9. **Documentation**: Verify prompt evolution is tracked
10. **Performance**: Check response times and query optimization

---

**Execute this verification protocol systematically. Report findings with evidence and specific remediation steps for any issues discovered.**
