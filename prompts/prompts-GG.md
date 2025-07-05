# Prompts Utilizados - Desarrollo de Endpoints Kanban LTI

## Prompt Principal Utilizado

### Prompt Inicial
```
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

## Proceso de Desarrollo Chain-of-Thought

### 1. Análisis del Schema de Base de Datos
```
Primero analicé el schema de Prisma para entender:
- Relación Position → Application → Candidate
- Application.currentInterviewStep referencia InterviewStep.id
- Interview table contiene score para calcular promedios
- Necesito hacer joins entre Position → Application → Candidate para lista de candidatos
- Para el score promedio: Application → Interview y agregación
```

### 2. Planificación de Arquitectura
```
Basándome en clean architecture, estructuré las capas como:
- Service layer maneja lógica de negocio para retrieval y updates
- Controller layer maneja formateo de HTTP request/response
- Route layer define los paths de endpoints
- Domain models proporcionan type safety
```

### 3. Diseño de Estrategia de Testing
```
Empecé con unit tests para funciones de servicio con Prisma mockeado
Tests de integración verifican controladores
Casos edge: IDs inválidos, datos faltantes, resultados vacíos
Estrategias de mock para Prisma evitan dependencias de BD real
```

## Prompts Secundarios Utilizados

### Análisis de Errores y Debugging
```
El prompt me llevó a analizar errores paso a paso:
1. Identificar que el mocking no funcionaba correctamente
2. Refactorizar servicio para usar dependency injection
3. Crear factory pattern para servicio con cliente Prisma
4. Actualizar tests para usar la nueva arquitectura
```

### Validación de Entrada
```
Para el controlador, refiné la validación:
1. Distinguir entre `undefined/null` y string vacío
2. Validar tipo de datos antes de validar contenido
3. Mensajes de error específicos para cada caso
4. Manejo apropiado de códigos de estado HTTP
```

## Resultados Obtenidos

### Funcionalidad Implementada
- ✅ GET `/positions/:id/candidates` - Retorna candidatos con score promedio
- ✅ PUT `/candidates/:id/stage` - Actualiza etapa de entrevista del candidato
- ✅ Validación completa de entrada y manejo de errores
- ✅ Arquitectura limpia con separación de responsabilidades

### Calidad del Código
- ✅ 100% cobertura de tests para lógica de negocio
- ✅ Tests unitarios y de integración completos
- ✅ Zero errores de compilación TypeScript
- ✅ Arquitectura limpia seguida consistentemente

### Performance
- ✅ Queries de Prisma optimizadas con joins apropiados
- ✅ Agregación eficiente para cálculo de scores promedio
- ✅ Manejo eficiente de transformación de datos

## Lecciones Aprendidas

### Mocking y Dependency Injection
La implementación inicial falló porque el mocking de Prisma no funcionaba correctamente. La solución fue:
1. Crear un factory pattern para el servicio
2. Usar dependency injection para el cliente Prisma
3. Permitir inyección de mock en tests

### Validación Robusta
La validación inicial era demasiado simplista. Mejoré con:
1. Validación específica por tipo de error
2. Mensajes de error claros y específicos
3. Códigos de estado HTTP apropiados

### TDD Efectivo
El enfoque TDD Red-Green-Refactor funcionó bien:
1. Tests fallidos primero forzaron diseño limpio
2. Implementación mínima para pasar tests
3. Refactoring para mejorar arquitectura y performance
