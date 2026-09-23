# Codex Project Audit, Completion, Fixing, and Refactoring Instructions

You are acting as a **senior backend engineer** reviewing and improving this entire codebase.

Your goal is to:

- inspect the project thoroughly;
- understand its architecture and business logic;
- identify missing or incomplete features;
- find bugs and architectural problems;
- improve code quality, security, type safety, maintainability, and performance;
- complete missing functionality when the intended behavior is clearly supported by the existing codebase;
- avoid unnecessary breaking changes.

> **Important:** Do not immediately start rewriting large parts of the project.  
> First inspect and understand the repository.

---

# 1. Understand the Project

Analyze the complete repository, including:

- folder structure;
- application architecture;
- modules;
- routes;
- controllers;
- use cases / services;
- repositories;
- dependency injection;
- DTOs;
- interfaces;
- models;
- validation schemas;
- middlewares;
- authentication;
- authorization;
- error handling;
- database configuration;
- environment configuration;
- Docker/deployment files;
- tests, if available.

Trace important application flows from:

```text
Request
  ↓
Router
  ↓
Middleware
  ↓
Validation
  ↓
Controller
  ↓
Use Case / Service
  ↓
Repository
  ↓
Database
  ↓
Response
```

Do not assume how something works without checking the implementation.

---

# 2. Identify Problems

Search the entire codebase for:

## Incomplete Code

Look for:

- TODOs;
- FIXMEs;
- placeholder implementations;
- commented-out unfinished code;
- partially implemented features;
- referenced features that are missing.

## Dead or Unnecessary Code

Look for:

- unused files;
- unused functions;
- unused imports;
- unreachable code;
- duplicated logic;
- obsolete helpers.

## TypeScript Problems

Look for:

- incorrect types;
- excessive use of `any`;
- unsafe type casting;
- DTO/interface mismatches;
- repository return type mismatches;
- model/interface mismatches;
- enum inconsistencies;
- incorrect generic usage;
- TypeScript compiler errors.

Do not hide typing problems using unsafe casts.

Fix the underlying issue whenever possible.

## Architecture Problems

Look for:

- business logic inside controllers;
- database access outside repositories when repositories are part of the architecture;
- incorrect dependency injection;
- duplicated business logic;
- poor separation of responsibilities;
- circular dependencies;
- inconsistent module structure.

## Validation Problems

Look for:

- missing validation;
- incorrect Zod validation;
- schemas that do not match DTOs/models;
- fields that should be immutable but can be updated;
- internal fields exposed to clients;
- incomplete update schemas;
- invalid enum validation;
- missing ID validation.

## Database Problems

Look for:

- incorrect Mongoose schemas;
- missing indexes;
- duplicate indexes;
- unnecessary indexes;
- incorrect references;
- incorrect `populate()` usage;
- missing `runValidators`;
- unsafe updates;
- incorrect ObjectId typing;
- inefficient MongoDB queries;
- N+1 query patterns;
- duplicate queries;
- unnecessary collection scans.

## API Problems

Look for:

- inconsistent responses;
- incorrect HTTP status codes;
- missing pagination;
- inconsistent filtering/sorting;
- inconsistent request body formats;
- missing input validation;
- sensitive fields exposed in API responses.

## Error Handling Problems

Look for:

- unhandled asynchronous errors;
- error handlers that can crash;
- incorrect Mongoose error handling;
- incorrect Zod error handling;
- unsafe access to properties such as `err.errors`;
- inconsistent error responses;
- duplicate error handling logic.

## Authentication and Authorization Problems

Look for:

- authentication bypasses;
- authorization bypasses;
- missing route protection;
- incorrect role checks;
- incorrect permission checks;
- optional authentication bugs;
- password exposure;
- insecure JWT handling;
- incorrect public/private endpoint behavior.

## Deployment and Configuration Problems

Look for:

- broken Docker configuration;
- bad environment variable handling;
- hardcoded secrets;
- missing runtime configuration;
- incorrect build scripts;
- broken imports;
- production-only failures.

---

# 3. Find Missing Features

Determine which features appear intended by the current architecture but are:

- partially implemented;
- referenced but missing;
- implemented in one layer but missing from another;
- missing routes;
- missing controllers;
- missing use cases;
- missing repository methods;
- missing validation;
- missing authorization;
- missing error handling;
- missing DTOs;
- missing interfaces;
- missing database indexes;
- missing tests.

## Important Rule

Infer intended functionality **only when there is strong evidence in the existing project**.

Strong evidence can include:

- route definitions;
- interfaces;
- repository contracts;
- TODO comments;
- frontend/API expectations;
- existing neighboring modules;
- incomplete implementations;
- tests describing expected behavior.

Do **not** invent unrelated product features.

If something is ambiguous, preserve existing behavior instead of guessing.

---

# 4. Architecture Review

Evaluate whether the existing architecture is followed consistently.

If the project already follows a layered architecture, maintain roughly this structure:

```text
Router
  ↓
Middleware / Validation
  ↓
Controller
  ↓
Use Case / Service
  ↓
Repository
  ↓
Model / Database
```

## Router Responsibilities

Routers should primarily handle:

- route definitions;
- middleware composition;
- authentication middleware;
- authorization middleware;
- validation middleware.

Avoid putting business logic inside routers.

## Controller Responsibilities

Controllers should handle HTTP-specific concerns:

- request parsing;
- response formatting;
- status codes;
- calling use cases/services.

Controllers should contain minimal business logic.

## Use Case / Service Responsibilities

Use cases/services should contain:

- business rules;
- application logic;
- workflow orchestration;
- authorization rules that belong to business behavior.

## Repository Responsibilities

Repositories should contain:

- database access;
- persistence logic;
- queries;
- updates;
- deletes;
- database projections.

## Model Responsibilities

Models should contain:

- database schema;
- database-level constraints;
- indexes;
- defaults;
- immutable fields;
- relationships.

## DTO / Interface Responsibilities

DTOs and interfaces should provide clear contracts between layers.

## Validation Responsibilities

Validate user-controlled/external data before it reaches business logic.

Do not introduce unnecessary abstractions or patterns simply for the sake of refactoring.

---

# 5. Refactor Carefully

Refactor when it meaningfully improves:

- readability;
- maintainability;
- type safety;
- consistency;
- separation of concerns;
- security;
- reliability;
- performance;
- testability.

Prefer:

- small changes;
- focused improvements;
- existing project conventions;
- backward-compatible improvements.

Avoid:

- massive rewrites;
- overengineering;
- unnecessary abstractions;
- unnecessary generic helpers;
- unnecessary new libraries;
- redesigning working APIs;
- renaming everything for style reasons.

Preserve existing endpoint contracts unless they are clearly incorrect, unsafe, or inconsistent.

---

# 6. TypeScript

Use strict and meaningful TypeScript.

Avoid `any` whenever practical.

Verify type consistency across:

```text
Mongoose Model
  ↓
Repository
  ↓
Use Case
  ↓
Controller
  ↓
API Response
```

Pay special attention to mismatches between:

- Mongoose documents;
- lean query results;
- domain interfaces;
- DTOs;
- repository interfaces;
- repository implementations;
- enums;
- Zod-inferred types.

Do not solve type errors by blindly adding:

```ts
as any
```

or unsafe casts.

Fix the actual contract mismatch.

---

# 7. Validation

Review all request validation.

Ensure:

- create schemas validate required fields;
- update schemas only allow fields that should be editable;
- immutable/internal fields cannot be changed through public APIs;
- MongoDB ObjectIds are validated where needed;
- UUIDs use proper library validation when available;
- enums match application enums;
- optional fields are handled consistently;
- numeric ranges are sensible;
- string constraints are appropriate;
- unwanted properties are handled safely.

Avoid duplicating validation unnecessarily.

Database-level validation may still be appropriate for important invariants.

---

# 8. MongoDB / Mongoose

Review all models and queries.

Check:

- required fields;
- defaults;
- enums;
- immutable fields;
- unique constraints;
- indexes;
- timestamps;
- references;
- `populate()` usage;
- ObjectId typing;
- `.lean()` usage;
- projections;
- sensitive field exclusion;
- update validators;
- atomic updates;
- geospatial indexes;
- duplicate indexes.

## Geospatial Data

If geospatial fields exist, verify:

- valid GeoJSON structure;
- correct coordinate order;
- valid latitude/longitude ranges;
- correct `2dsphere` index usage;
- correct geospatial query behavior.

Do not add indexes without a clear query/use-case reason.

---

# 9. Authentication and Authorization

Review the full authentication and authorization flow.

Check:

- JWT creation;
- JWT verification;
- token expiration;
- password hashing;
- password comparison;
- password storage;
- password exposure;
- protected routes;
- public routes;
- role checks;
- permissions;
- optional authentication;
- admin-only functionality;
- user-specific functionality;
- broker-specific functionality if present.

Verify that authenticated and unauthenticated flows cannot accidentally bypass permissions.

Never expose:

- password hashes;
- tokens unnecessarily;
- internal authentication fields;
- sensitive security information.

---

# 10. Error Handling

Review global error handling carefully.

It should safely handle:

- application errors;
- validation errors;
- Zod errors;
- Mongoose validation errors;
- `CastError`;
- MongoDB duplicate-key errors;
- authentication errors;
- authorization errors;
- unknown/unexpected errors.

The error handler itself must never crash while processing another error.

For example, avoid blindly doing:

```ts
Object.values(err.errors)
```

without first verifying that:

```ts
err.errors
```

actually exists and is an object.

Maintain consistent API error responses.

---

# 11. API Consistency

Review endpoints for consistency in:

- request bodies;
- path parameters;
- query parameters;
- pagination;
- filtering;
- sorting;
- search;
- response structure;
- error structure;
- status codes.

Do not redesign APIs unnecessarily.

Only change contracts when required for:

- correctness;
- security;
- consistency;
- clearly documented business requirements.

---

# 12. Performance

Look for practical performance improvements such as:

- appropriate MongoDB indexes;
- `.lean()` for read-only queries;
- selecting only required fields;
- reducing unnecessary `populate()` calls;
- avoiding repeated queries;
- avoiding collection-wide reads;
- adding pagination to large collections;
- avoiding CPU-heavy synchronous operations in request handlers;
- reducing unnecessary database round trips.

Do not perform premature optimization.

---

# 13. Security

Look for security issues including:

- missing authentication;
- missing authorization;
- mass-assignment vulnerabilities;
- client-controlled internal fields;
- insecure JWT handling;
- password leakage;
- sensitive information in logs;
- unsafe MongoDB query construction;
- NoSQL injection risks;
- missing request-size protections where appropriate;
- overly permissive CORS;
- secrets committed to the repository;
- unsafe production defaults.

Do not expose, print, or modify secrets unnecessarily.

---

# 14. Dependencies

Inspect `package.json`.

Determine whether dependencies are:

- unused;
- duplicated;
- incorrectly imported;
- used inconsistently;
- unnecessary because equivalent functionality already exists in the project.

Do not upgrade dependency versions unless there is a clear reason.

Do not introduce new dependencies if the project already has an appropriate solution.

---

# 15. Testing and Verification

After making changes:

1. run the TypeScript compiler/typecheck;
2. run linting if configured;
3. run existing tests;
4. run the build;
5. inspect failures;
6. fix regressions caused by your changes.

Do not consider the work complete while errors introduced by your changes remain.

If tests do not exist, do not automatically create a huge testing framework.

If a testing setup already exists, add focused tests for important logic that you modify.

---

# 16. Working Strategy

Work in phases.

---

## Phase 1 — Repository Analysis

Inspect the project before making substantial changes.

Build an understanding of:

- architecture;
- modules;
- dependencies;
- database relationships;
- authentication flow;
- authorization flow;
- important request flows;
- deployment setup.

Do not start with broad rewrites.

---

## Phase 2 — Findings

Identify issues and roughly classify them as:

### Critical

Examples:

- security vulnerabilities;
- broken authentication;
- authorization bypass;
- data corruption risk;
- application crashes;
- broken production behavior.

### Important

Examples:

- incomplete features;
- incorrect validation;
- incorrect typing;
- broken repository contracts;
- inefficient database behavior;
- architecture inconsistencies.

### Improvement

Examples:

- naming consistency;
- small refactors;
- code duplication;
- maintainability improvements;
- cleanup.

Prioritize fixes in approximately this order:

1. bugs;
2. security issues;
3. broken/incomplete features;
4. type problems;
5. architectural inconsistencies;
6. maintainability;
7. cosmetic cleanup.

---

## Phase 3 — Implementation

Fix the highest-value issues first.

Make related changes together.

Before modifying shared infrastructure, check all modules depending on it.

Examples of shared infrastructure:

- error middleware;
- authentication middleware;
- validation middleware;
- base repository behavior;
- common DTOs;
- shared interfaces;
- dependency injection;
- configuration utilities.

---

## Phase 4 — Verification

Run all available project checks.

Fix regressions.

Do not suppress legitimate errors just to make checks pass.

---

## Phase 5 — Final Review

Inspect changed code again for:

- accidental breaking changes;
- unused imports;
- incorrect types;
- duplicated logic;
- security regressions;
- naming inconsistencies;
- incomplete implementation;
- unnecessary changes.

---

# 17. Important Rules

## DO NOT

- rewrite the whole application unnecessarily;
- change business behavior without evidence;
- remove working features;
- casually change API contracts;
- replace the architecture just because another architecture is possible;
- add unnecessary libraries;
- add abstractions with no practical benefit;
- hide TypeScript problems using `any`;
- disable validation just to make code compile;
- suppress errors instead of fixing them;
- delete code unless you verify it is unused;
- modify environment secrets;
- expose credentials;
- commit secrets;
- invent missing product requirements;
- assume behavior when the repository can answer the question.

## DO

- inspect before modifying;
- understand dependencies between modules;
- follow existing conventions when they are reasonable;
- improve weak conventions when there is clear benefit;
- preserve backward compatibility;
- prioritize security and correctness;
- keep code simple;
- use existing project utilities;
- keep TypeScript strict;
- make production-quality changes.

---

# 18. Expected Final Report

After completing the work, provide a concise but useful report.

Use this structure:

## Problems Found

Explain the important problems discovered.

Separate them approximately into:

- Critical;
- Important;
- Improvements.

## Changes Made

List significant modifications and why they were needed.

## Missing Features Completed

Describe incomplete functionality that was finished.

Only include features supported by evidence in the existing project.

## Refactoring Performed

Explain meaningful architectural and code-quality improvements.

## Security Improvements

Describe security-related fixes.

## Database Improvements

Describe:

- schema changes;
- indexes;
- query improvements;
- relationships;
- projections;
- validation changes.

## API Improvements

Describe any endpoint, validation, response, or error-handling improvements.

## Remaining Concerns

List anything that:

- requires manual review;
- requires business clarification;
- could not safely be inferred;
- should be handled later.

## Verification

Report the actual result of:

```text
TypeScript / typecheck:
Lint:
Tests:
Build:
```

Do not report something as successful unless you actually ran it successfully.

---

# 19. Starting Instruction

Begin by inspecting the repository and understanding the architecture.

Do not make substantial modifications until you understand:

- how requests flow through the application;
- how authentication works;
- how authorization works;
- how repositories interact with MongoDB;
- how DTOs/interfaces/models relate;
- how validation is implemented;
- how errors are handled.

After the initial inspection, proceed with the highest-priority fixes while preserving existing intended behavior.
