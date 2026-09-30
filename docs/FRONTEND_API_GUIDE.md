# Frontend API Guide

## Overview

This API supports a single-organization task workflow with three roles:

| Action | Admin | Manager | Employee |
|---|---:|---:|---:|
| Public signup | Yes, as employee | Yes, as employee | Yes |
| List users / read user by ID | Yes | Yes | No |
| Update roles or user data | Yes | No | No |
| Delete users | Yes | No | No |
| Create and assign tasks | Yes | Yes | No |
| View global task list | Yes | Yes | No |
| View task detail | Yes | Yes | Assigned only |
| Update/reassign/delete tasks | Yes | Yes | No |
| Change status through employee endpoint | If assigned | If assigned | If assigned |
| View summary | Global | Global | Own assigned tasks |
| View own assigned tasks / upload own image | Yes | Yes | Yes |

The default local base URL is:

```text
http://localhost:3001/api
```

All protected requests require:

```http
Authorization: Bearer <access-token>
```

JSON request bodies use `Content-Type: application/json`. Unknown body and query fields are normally rejected with HTTP 400.

## Common objects

### Public user

```json
{
  "id": 7,
  "name": "Amina Hassan",
  "email": "amina@example.com",
  "role": "employee",
  "profile_image": null,
  "createdAt": "2026-09-30T08:00:00.000Z",
  "updatedAt": "2026-09-30T08:00:00.000Z"
}
```

Roles: `admin`, `manager`, `employee`. Password hashes are excluded from public responses.

### Task

```json
{
  "id": 42,
  "title": "Prepare release notes",
  "description": "Summarize the current sprint changes.",
  "status": "in-progress",
  "priority": "high",
  "deadline": "2026-10-05T12:00:00.000Z",
  "assigned_to": 7,
  "createdBy": 2,
  "completedAt": null,
  "createdAt": "2026-09-30T08:00:00.000Z",
  "updatedAt": "2026-09-30T09:00:00.000Z"
}
```

| Field | Type | Nullable | Client editable | Notes |
|---|---|---:|---:|---|
| `id` | integer | No | No | Database identifier |
| `title` | string, 1–200 chars | No | Manager/Admin | Trimmed |
| `description` | string, 1–5000 chars | No | Manager/Admin | Trimmed |
| `status` | enum | No | Manager/Admin or assigned user | `pending`, `in-progress`, `completed` |
| `priority` | enum | No | Manager/Admin | `low`, `medium`, `high`, `urgent`; defaults to `medium` |
| `deadline` | ISO-compatible date string | No | Manager/Admin | Stored as a timestamp |
| `assigned_to` | positive user ID | No | Manager/Admin | Assignee must exist |
| `createdBy` | user ID | Yes | No | Authenticated creator; old/deleted creator may be null |
| `completedAt` | timestamp | Yes | No | Set/cleared by status transitions |
| `createdAt` | timestamp | No | No | Sequelize timestamp |
| `updatedAt` | timestamp | No | No | Sequelize timestamp |

When status first changes to `completed`, the API sets `completedAt`. Reopening a completed task clears it. Sending `completedAt`, `createdBy`, timestamps, or other unknown fields is rejected.

## Authentication

### Sign up

`POST /auth/signup` — public

```json
{
  "name": "Amina Hassan",
  "email": "amina@example.com",
  "password": "a-strong-password"
}
```

`role` may be omitted or set to `employee`. Any privileged role returns HTTP 403. Emails are lowercased. Passwords must contain at least 8 characters and fit bcrypt's 72-byte limit.

HTTP 201:

```json
{
  "message": "User created successfully",
  "token": "<access-token>",
  "refreshToken": "<refresh-token>",
  "user": {
    "id": 7,
    "name": "Amina Hassan",
    "email": "amina@example.com",
    "role": "employee",
    "profile_image": null,
    "createdAt": "2026-09-30T08:00:00.000Z",
    "updatedAt": "2026-09-30T08:00:00.000Z"
  }
}
```

Common failures: 400 invalid input, 403 privileged public role, 409 duplicate email.

### Log in

`POST /auth/login` — public

```json
{
  "email": "amina@example.com",
  "password": "a-strong-password"
}
```

HTTP 200 returns `message`, `token`, `refreshToken`, and `user` in the same general shape as signup. Invalid credentials return HTTP 401 with the same message for unknown email and wrong password.

### Refresh tokens

`POST /auth/refreshToken` — public endpoint requiring a valid refresh token in the body

```json
{
  "refreshToken": "<refresh-token>"
}
```

HTTP 200:

```json
{
  "message": "Refresh token generated successfully",
  "access_token": "<new-access-token>",
  "refresh_token": "<new-refresh-token>"
}
```

Note the existing naming difference: login/signup use `token` and `refreshToken`; refresh uses `access_token` and `refresh_token`. A deleted user cannot refresh. Current database email and role are placed in the new tokens.

Access tokens last one hour and refresh tokens last one day. On a 401, attempt refresh only when the client has a refresh token; otherwise return to login. A 403 means the authenticated user lacks permission and should not trigger token refresh. Choose token storage based on the frontend threat model; do not place tokens in URLs or logs.

## Task endpoints

### Create task

`POST /task/createTask` — Admin or Manager

```json
{
  "title": "Prepare release notes",
  "description": "Summarize the current sprint changes.",
  "status": "pending",
  "priority": "high",
  "deadline": "2026-10-05T12:00:00.000Z",
  "assigned_to": 7
}
```

`priority` is optional and defaults to `medium`. All other fields are required. Creating a completed task immediately records `completedAt`.

HTTP 201:

```json
{
  "task": {
    "id": 42,
    "title": "Prepare release notes",
    "description": "Summarize the current sprint changes.",
    "status": "pending",
    "priority": "high",
    "deadline": "2026-10-05T12:00:00.000Z",
    "assigned_to": 7,
    "createdBy": 2,
    "completedAt": null
  },
  "user": { "id": 7, "name": "Amina Hassan" },
  "message": "Task created",
  "status": "OK"
}
```

Common failures: 400 invalid/unknown fields, 404 assignee missing, 401/403 authentication or role failure.

### List and query all tasks

`GET /task/getAllTasks` — Admin or Manager

HTTP 200:

```json
{
  "page": 1,
  "limit": 5,
  "totalPages": 3,
  "totalTasks": 13,
  "result": 5,
  "tasks": []
}
```

All filters combine with AND. Within `search`, title and description combine with OR.

| Query | Type | Default | Behavior |
|---|---|---|---|
| `page` | positive integer | `1` | Page number |
| `limit` | positive integer, max 100 | `5` | Page size |
| `title` | non-empty string, max 200 | — | Case-insensitive title contains filter |
| `search` | non-empty string, max 200 | — | Case-insensitive title or description contains filter |
| `status` | status enum | — | Exact status filter |
| `priority` | priority enum | — | Exact priority filter |
| `assignee` | positive user ID | — | Exact assignee filter |
| `assigned_to` | positive user ID | — | Alias for `assignee`; do not send both |
| `deadlineFrom` | date string | — | Inclusive lower deadline bound |
| `deadlineTo` | date string | — | Inclusive upper deadline bound; cannot precede `deadlineFrom` |
| `overdue` | `true` or `false` | — | `true`: deadline is past and status is not completed; `false`: not overdue or completed |
| `sortBy` | allowlisted field | `createdAt` | `createdAt`, `updatedAt`, `deadline`, `title`, `priority` |
| `sortOrder` | `asc` or `desc` | `desc` | Case-insensitive input |

Sorting is deterministic: task `id` is a secondary sort using the same direction. Priority follows the database enum business order `low → medium → high → urgent` in ascending order.

Examples:

```http
GET /api/task/getAllTasks?status=in-progress&priority=high&page=1&limit=20
GET /api/task/getAllTasks?search=release&sortBy=deadline&sortOrder=asc
GET /api/task/getAllTasks?overdue=true&assignee=7
GET /api/task/getAllTasks?deadlineFrom=2026-10-01T00:00:00.000Z&deadlineTo=2026-10-31T23:59:59.999Z
```

Unsupported query names or invalid values return HTTP 400.

### Task detail

`GET /task/getTask/:id` — Admin, Manager, or the assigned Employee

Returns the Sequelize task object. An unassigned employee receives HTTP 403; a missing task returns 404.

### Update or reassign task

`PATCH /task/updateTask/:id` — Admin or Manager

Send at least one of `title`, `description`, `status`, `priority`, `deadline`, or `assigned_to`.

```json
{
  "assigned_to": 9,
  "priority": "urgent",
  "status": "in-progress"
}
```

Returns the updated Sequelize task object. The assignee must exist. Partial updates preserve omitted values.

### Update assigned task status

`PATCH /user/updateStatus/:id` — the currently assigned user only

```json
{ "status": "completed" }
```

Only `status` is accepted. This ownership rule applies regardless of role: using this endpoint requires the caller to be the task's current assignee. Managers/admins can instead use the general task update endpoint.

### Delete task

`DELETE /task/deleteTask/:id` — Admin or Manager

HTTP 200:

```json
{ "message": "Task deleted successfully" }
```

Deletion is permanent; task archiving is not implemented.

### Summary dashboard

`GET /task/summary` — any authenticated user; query parameters are not accepted

Employees receive counts only for tasks assigned to them. Managers/admins receive global counts.

```json
{
  "total": 12,
  "pending": 4,
  "in-progress": 3,
  "completed": 5,
  "overdue": 2,
  "priority": {
    "low": 1,
    "medium": 5,
    "high": 4,
    "urgent": 2
  }
}
```

`overdue` means `deadline < current server time` and status is not `completed`. Priority counts include all tasks in the caller's scope, including completed tasks. Empty scope returns zeros.

## User endpoints

### List users

`GET /user/getAllUsers` — Admin or Manager

Query parameters: `page` (default 1), `limit` (default 5, maximum 100), and optional case-insensitive `name` search.

```json
{
  "totalUsers": 8,
  "totalPages": 2,
  "results": 5,
  "allUsers": []
}
```

Use this endpoint to populate assignment controls. Users are ordered newest first.

### Get user by ID

`GET /user/getUserById/:id` — Admin or Manager

Returns one public user or HTTP 404.

### Current user and tasks

`GET /user/getMe` — any authenticated user

```json
{
  "user": { "id": 7, "name": "Amina Hassan", "email": "amina@example.com", "role": "employee", "profile_image": null },
  "tasks": []
}
```

This legacy convenience endpoint returns all assigned tasks without pagination. Prefer `/user/my-tasks?page=1&limit=20` for a scalable task screen.

### Assigned tasks

`GET /user/my-tasks` — any authenticated user

Without query parameters, the body is an unpaginated task array for backward compatibility. When `page` or `limit` is supplied, the body remains an array and pagination is sent in headers:

```text
X-Page
X-Limit
X-Total-Count
X-Total-Pages
```

These headers are exposed by CORS. Defaults apply to a partially specified pagination request: page 1 and limit 5; maximum limit is 100.

### Update user

`PATCH /user/updateUser/:id` — Admin only

Send one or more of `name`, `email`, or `role`:

```json
{ "role": "manager" }
```

This is the API path for promoting an existing employee. Passwords and internal fields are rejected.

### Delete user

`DELETE /user/deleteUser/:id` — Admin only

Returns `{ "message": "User deleted successfully" }`. A user with assigned tasks cannot be deleted and receives HTTP 409; reassign or delete those tasks first. Tasks created by the user may remain with `createdBy: null`.

### Upload profile image

`POST /user/profile/upload` — any authenticated user

Use `multipart/form-data` with exactly one file field named `profile_image`. Supported declared file types/extensions are JPEG (`.jpg`/`.jpeg`), PNG, and GIF. Maximum size is 1 MB.

```json
{
  "message": "Profile image updated successfully",
  "user": {
    "id": 7,
    "name": "Amina Hassan",
    "email": "amina@example.com",
    "role": "employee",
    "profile_image": "/uploads/<generated-filename>.jpg"
  }
}
```

Resolve the returned path against the server origin, not `/api`.

## Error contract

Most errors use:

```json
{ "message": "Human-readable message" }
```

Some validation errors also include `details`:

```json
{
  "message": "Validation failed",
  "details": ["field-specific message"]
}
```

| Status | Meaning |
|---:|---|
| 400 | Invalid body/query/ID, malformed JSON, validation or upload failure |
| 401 | Missing, invalid, or expired authentication; deleted token user |
| 403 | Authenticated but role/resource access is forbidden |
| 404 | Route, user, or task not found |
| 409 | Duplicate value or related-record conflict |
| 500 | Unexpected server error |

Frontend code should display `message`, optionally render `details`, and avoid depending on undocumented error text for control flow.

