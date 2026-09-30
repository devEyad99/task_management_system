# Task Management System Backend

A role-based task management REST API built with TypeScript, Express, PostgreSQL, and Sequelize. It supports secure employee registration, JWT authentication, user administration, task assignment, task lifecycle tracking, search/filter/sort, pagination, priority management, and dashboard summaries.

## Business model

- **Admins** manage users and have full task access.
- **Managers** can discover users, create tasks, assign or reassign them, update task details, view all tasks, and delete tasks.
- **Employees** see their assigned tasks, view their own task details, update status, and receive a personal dashboard summary.
- Completing a task records `completedAt`; reopening it clears that timestamp.
- Overdue state is derived from the deadline and status, so it cannot become stale.

This is intentionally a single-organization team task tracker. Projects, comments, notifications, and multi-tenant workspaces are not claimed as implemented features.

## Technical highlights

- Strict TypeScript with route → middleware → controller → service → repository → Sequelize layering
- Access and refresh JWTs with database-backed user/role checks on authenticated requests
- Password hashing with bcrypt and password exclusion from normal Sequelize queries
- Allowlisted task filters and sorting, bounded pagination, and strict unknown-field rejection
- PostgreSQL constraints, foreign keys, enums, query-oriented indexes, and versioned SQL migrations
- Role-aware aggregate dashboard computed in one database query
- Centralized application, Sequelize, JWT, upload, and malformed-JSON error handling
- Focused Node test suite for permissions, validation, lifecycle, queries, and summaries

## Quick start

Requirements: Node.js 18+ and PostgreSQL.

```bash
npm install
cp .env.example .env
```

Create the configured database, update `.env`, and apply every file in `migrations/` in filename order with your PostgreSQL migration tool or `psql`. Then run:

```bash
npm run dev
```

The default API base URL is `http://localhost:3001/api`.

Public signup always creates an `employee`. Bootstrap the first admin through a controlled database/seed process, then use the admin-only user update endpoint to manage roles. Do not expose an admin-registration route publicly.

## Commands

```bash
npm run typecheck
npm test
npm run build
npm start
```

No lint command is currently configured.

## Documentation

- [Frontend API guide](docs/FRONTEND_API_GUIDE.md)
- [API endpoint reference](docs/API_REFERENCE.md)
- [Backend architecture](docs/BACKEND_ARCHITECTURE.md)

## Portfolio summary

This project demonstrates backend API design, layered architecture, authentication and RBAC, relational data modeling, migration-driven PostgreSQL changes, defensive validation, task-domain business rules, aggregate reporting, and automated testing.

