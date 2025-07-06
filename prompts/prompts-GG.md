# Prompts Utilizados - Desarrollo de Endpoints Kanban LTI

## 📋 Índice de Prompts
1. [Prompt Principal de Implementación TDD](#prompt-principal-de-implementación-tdd)
2. [Prompt de Verificación Sistemática](#prompt-de-verificación-sistemática)
3. [Prompt Final de Validación y PR](#prompt-final-de-validación-y-pr)

---

## 🎯 Prompt Principal de Implementación TDD

### Prompt Utilizado para Construcción Completa
```markdown
# 🎯 Elite Backend Engineering: LTI Kanban Endpoints with TDD & Clean Architecture

## 🧠 Chain-of-Thought Framework
**Apply systematic reasoning at each step. Think step-by-step, validate assumptions, and explain your decision-making process throughout the implementation.**

---

## 🎭 Role & Expertise
You are **CodePiloto**, an elite technical copilot specializing in:
- **Backend Architecture**: Express.js, TypeScript, Prisma ORM, PostgreSQL
- **Clean Architecture**: Domain-driven design with hexagonal architecture
- **TDD Mastery**: Test-first development with Jest and comprehensive coverage
- **AI-Assisted Development**: GitHub Copilot workflows and prompt engineering

---

## 📋 Mission Brief
**Repository**: `git@github.com:herman-aukera/AI4Devs-BACKEND-RO-1.git`
**Branch Convention**: Must include "GG" initials (e.g., `backend-kanban-endpoints-GG`)
**Delivery**: Pull request with complete TDD implementation

**Core Objective**: Build production-ready kanban endpoints for LTI ATS candidate management using Test-Driven Development and clean architecture principles.

---

## 🎯 Target Endpoints

### 1. GET /positions/:id/candidates
**Purpose**: Retrieve all active candidates for kanban interface
**Response Schema**:
```typescript
{
  candidates: Array<{
    id: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
  }>
}
```

### 2. PUT /candidates/:id/stage
**Purpose**: Update candidate's interview stage
**Request Schema**:
```typescript
{
  stage: string; // Target interview step/stage
}
```

---

## 🧪 TDD Implementation Protocol

**Follow this exact sequence for each endpoint:**

### Phase 1: Red (Failing Tests)
1. **Unit Tests First**: Write failing tests for service layer logic
2. **Integration Tests**: Write failing controller tests
3. **Edge Case Tests**: Invalid IDs, missing data, malformed requests
4. **Validation Tests**: Schema validation and business rules

### Phase 2: Green (Minimal Implementation)
1. **Domain Models**: Define TypeScript interfaces and types
2. **Service Layer**: Implement business logic to pass unit tests
3. **Controller Layer**: Implement HTTP handling to pass integration tests
4. **Route Layer**: Wire up Express routes

### Phase 3: Refactor (Optimize & Clean)
1. **Performance**: Optimize Prisma queries and database access
2. **Architecture**: Ensure clean separation of concerns
3. **Error Handling**: Comprehensive error scenarios with proper HTTP codes
4. **Documentation**: JSDoc comments and type annotations

---

## 🔍 Chain-of-Thought Analysis Tasks

**Execute each step with explicit reasoning:**

### 1. Database Schema Analysis
```
CoT Process:
1. "I'm examining the Prisma schema to understand..."
2. "The relationship between Position → Application → Candidate is..."
3. "Interview stages are stored as... because..."
4. "Score calculation requires... due to..."
```

### 2. Architecture Planning
```
CoT Process:
1. "Based on clean architecture, I'll structure layers as..."
2. "The domain logic for average score calculation should..."
3. "Controller validation will handle... to prevent..."
4. "Error boundaries should be placed at... because..."
```

### 3. Test Strategy Design
```
CoT Process:
1. "I'll start with unit tests for... to isolate..."
2. "Integration tests will verify... through..."
3. "Mock strategies for Prisma will... to avoid..."
4. "Test coverage should focus on... because..."
```

---

## 📐 Technical Requirements

### Code Quality Standards
- **TypeScript**: Strict mode with comprehensive typing
- **SOLID Principles**: Single responsibility, dependency inversion
- **Clean Code**: Descriptive names, pure functions, minimal side effects
- **Error Handling**: Proper HTTP status codes (200, 400, 404, 500)

### Performance Targets
- **Database**: Optimized Prisma queries with proper joins
- **Response Time**: Sub-200ms for candidate list retrieval
- **Memory**: Efficient data transformation and aggregation

### Testing Standards
- **Coverage**: Minimum 90% line coverage
- **Test Types**: Unit, integration, edge cases
- **Mocking**: All external dependencies (Prisma, database)
- **Assertions**: Comprehensive validation of outputs

---

## 🎬 Implementation Workflow

### Step 1: Repository Setup
```bash
git checkout -b backend-kanban-endpoints-GG
```

### Step 2: TDD Cycle (Per Endpoint)
1. **Write failing test** for service function
2. **Implement minimal code** to pass test
3. **Refactor** for clean architecture
4. **Repeat** for controller layer
5. **Add integration tests**
6. **Optimize and document**

### Step 3: Deliverables Structure
```
/backend
  /src
    /routes         # Express route definitions
    /controllers    # HTTP request/response handling
    /services       # Business logic and data access
    /types          # TypeScript interfaces
  /tests
    /unit           # Service layer tests
    /integration    # Controller tests
/prompts
  prompts-GG.md     # Your prompt engineering documentation
```

---

## ✅ Success Criteria

### Functional Requirements
- [ ] GET endpoint returns properly formatted candidate data
- [ ] PUT endpoint successfully updates interview stages
- [ ] Average score calculation is mathematically correct
- [ ] All edge cases handled with appropriate error responses

### Quality Requirements
- [ ] 100% test coverage for business logic
- [ ] Zero TypeScript compilation errors
- [ ] Clean architecture pattern followed
- [ ] Optimized database queries with proper relationships

### Documentation Requirements
- [ ] Comprehensive JSDoc comments
- [ ] API endpoint documentation
- [ ] Test case explanations
- [ ] Architectural decision records

---

## 🚀 Execution Command

**Start with explicit Chain-of-Thought analysis:**

1. **"Let me first analyze the existing codebase structure..."**
2. **"I'll examine the Prisma schema to understand data relationships..."**
3. **"Based on this analysis, I'll design the test cases..."**
4. **"Then I'll implement following TDD red-green-refactor cycles..."**

**Begin implementation only after completing the analysis phase.**

---

## 🎯 Meta-Prompt for Future Use

```
Follow this exact pattern for any backend endpoint development:
1. Schema analysis with explicit reasoning
2. TDD red-green-refactor cycles
3. Clean architecture layer separation
4. Comprehensive error handling
5. Performance optimization
6. Documentation and testing
```

**Ready to execute? Start with codebase analysis and schema examination, then proceed with TDD implementation.**
```

---

## 🔍 Prompt de Verificación Sistemática

### Prompt para Validación Completa de Assignment
```markdown
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
```

---

## 🚀 Prompt Final de Validación y PR

### Prompt de Trigger para Completar Assignment
```markdown
docker is already installed, now you run the best prompt ever to detect all the meaningful errors or incompleteness, when you finish, using gh instead of git, add, commit and make a descriptive pull request to the original repository from the current branch to their main branch (https://github.com/LIDR-academy/AI4Devs-BACKEND-RO-1)
```

**Contexto de Ejecución:**
- Role: "Kanban Endpoint Testing Expert for LTI ATS Assignment Validation"
- Tools: `['read_file', 'run_in_terminal', 'file_search', 'grep_search', 'get_errors', 'semantic_search', 'get_changed_files', 'run_vs_code_task']`
- Objective: Complete verification and automated PR creation using GitHub CLI

---

## 📋 Resumen de Prompts Utilizados

### 1. **Prompt de Implementación TDD**
- **Propósito**: Construcción completa del sistema con TDD y Clean Architecture
- **Enfoque**: Chain-of-Thought reasoning step-by-step
- **Resultado**: Endpoints funcionales, tests pasando, arquitectura limpia

### 2. **Prompt de Verificación Sistemática**
- **Propósito**: Validación exhaustiva de todos los requisitos del assignment
- **Enfoque**: Verificación sistemática con evidencia
- **Resultado**: Confirmación de funcionalidad, calidad y compliance

### 3. **Prompt de Finalización y PR**
- **Propósito**: Detectar errores finales y crear pull request automático
- **Enfoque**: Análisis completo usando herramientas especializadas
- **Resultado**: Proyecto validado y PR creado en repositorio upstream

**Todos los prompts utilizan Chain-of-Thought reasoning para asegurar implementación y validación sistemática paso a paso.**
