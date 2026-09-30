# Backend Architecture

## Overview

The application is a modular Express REST API backed by PostgreSQL through Sequelize. Auth, user, and task modules follow a lightweight layered design:

```text
HTTP request
  → Express router
  → authentication / role middleware
  → controller
  → service validation and business rules
  → repository
  → Sequelize model / PostgreSQL
  → JSON response or centralized error handler
```

Dependency construction is explicit in each router. There is no dependency-injection framework.

## Source layout

| Path | Responsibility |
|---|---|
| `src/app.ts` | Express configuration, CORS, parsers, static uploads, routes, errors |
| `src/server.ts` | Database connectivity and HTTP server startup |
| `src/(auth)` | Signup, login, refresh-token flow, password hashing repository |
| `src/(user)` | User administration, current profile, assigned tasks, employee status changes |
| `src/(task)` | Task CRUD, lifecycle, querying, and summary aggregation |
| `src/models` | Sequelize models, enums, associations, and model indexes |
| `src/middlewares` | Authentication, role authorization, 404 and error responses |
| `src/helper/validation.ts` | Shared runtime validation and pagination rules |
| `src/utiles` | JWT and profile upload infrastructure |
| `migrations` | Ordered PostgreSQL schema changes |
| `test` | Node test-runner unit/contract tests |

## Authentication and authorization

Access tokens expire after one hour; refresh tokens expire after one day. Both use HS256 with different required secrets. Production secrets must be at least 32 characters.

Authentication verifies the access token, loads the user by primary key, and builds `req.currentUser` from current database values. Consequently, deleted users lose access and role changes take effect without waiting for an old token to expire.

Public signup can create employees only. Admin and manager capabilities are enforced by route middleware, with resource-level checks in services where assignment ownership matters.

## Data model

```text
User 1 ─── * Task (assigned_to, RESTRICT on delete)
User 1 ─── * Task (created_by, SET NULL on delete)
```

`User` contains identity, credentials, role, and an optional profile image path. Default queries exclude password hashes.

`Task` contains title, description, status, priority, deadline, assignee, optional creator attribution, completion timestamp, and Sequelize timestamps. Status values are `pending`, `in-progress`, and `completed`; priority values are `low`, `medium`, `high`, and `urgent`.

The database restricts deleting an assigned user. The service converts that constraint into an explicit business conflict before deletion. Creator attribution may become null when a creator is deleted.

## Query design

The global manager/admin task list supports exact enum filters, case-insensitive title/description search, deadline ranges, overdue selection, assignee aliases, allowlisted sorting, and bounded page-based pagination. The repository builds Sequelize conditions rather than accepting raw client query objects.

Task summary uses one PostgreSQL aggregate query with filtered counts. Employee scope is applied inside the SQL query; managers and admins receive organization-wide counts.

## Validation and errors

Services treat request input as `unknown`, require object bodies, reject unknown properties, normalize strings/emails, validate enums and IDs, and cap pagination at 100 records. System-controlled fields such as `createdBy` and `completedAt` cannot be mass-assigned.

Expected failures throw `AppError`. The global handler also translates Sequelize unique/validation/foreign-key failures, JWT errors, Multer errors, and malformed JSON. Unexpected errors return HTTP 500 without exposing internals in production.

## Migrations and startup

SQL files in `migrations/` are the production schema history and must be applied in filename order. Runtime startup authenticates the database connection; it does not call `sequelize.sync()`, so deployments must run migrations separately.

## Testing strategy

`npm test` compiles the TypeScript source and executes focused tests with Node's built-in test runner. Current coverage emphasizes validation, role restrictions, task ownership, completion/reopening behavior, query parsing, repository condition building, pagination contracts, and summary scoping. The suite mocks persistence and does not yet replace PostgreSQL-backed integration or end-to-end HTTP tests.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Rebuild and restart on TypeScript changes |
| `npm run typecheck` | Strict type check without emitting files |
| `npm test` | Build and run the test suite |
| `npm run build` | Compile into ignored `build/` output |
| `npm start` | Run the compiled server |

