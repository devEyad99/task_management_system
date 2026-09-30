# API Reference

Base path: `/api`

Send access tokens as `Authorization: Bearer <access-token>`.

| Method | Path | Authentication | Roles | Purpose |
|---|---|---|---|---|
| POST | `/auth/signup` | Public | — | Register an employee and return an access/refresh token pair |
| POST | `/auth/login` | Public | — | Authenticate and return tokens plus the public user |
| POST | `/auth/refreshToken` | Public (refresh token body) | — | Rotate a valid refresh token |
| GET | `/user/getAllUsers` | Bearer | Admin, Manager | Paginated user directory for administration and assignment |
| GET | `/user/getUserById/:id` | Bearer | Admin, Manager | Get one public user profile |
| GET | `/user/getMe` | Bearer | Any | Get the current user and all assigned tasks |
| PATCH | `/user/updateUser/:id` | Bearer | Admin | Update a user's name, email, or role |
| DELETE | `/user/deleteUser/:id` | Bearer | Admin | Delete a user who has no assigned tasks |
| GET | `/user/my-tasks` | Bearer | Any | List the current user's assigned tasks |
| PATCH | `/user/updateStatus/:id` | Bearer | Assigned user only | Change an assigned task's status |
| POST | `/user/profile/upload` | Bearer | Any | Upload the current user's profile image |
| POST | `/task/createTask` | Bearer | Admin, Manager | Create and assign a task |
| GET | `/task/getAllTasks` | Bearer | Admin, Manager | Query the global task list |
| GET | `/task/summary` | Bearer | Any | Get a role-scoped task summary |
| GET | `/task/getTask/:id` | Bearer | Admin, Manager; assigned employee | Get one task |
| PATCH | `/task/updateTask/:id` | Bearer | Admin, Manager | Partially update or reassign a task |
| DELETE | `/task/deleteTask/:id` | Bearer | Admin, Manager | Permanently delete a task |

Successful create, update, detail, and list response examples are documented in [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md). Errors use `{ "message": string, "details"?: unknown }`.

