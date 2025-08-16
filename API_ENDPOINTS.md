# API Endpoints Documentation

This document describes all available API endpoints for the Task Manager App.

## Authentication

All endpoints (except auth endpoints) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Auth Endpoints

### User Registration
```
POST /api/auth/signup
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Note:** All new users are automatically assigned the `USER` role. Admin users must be created directly in the database or by existing admins.

### User Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get User Profile
```
GET /api/auth/profile
```
**Access:** Authenticated users (USER, ADMIN)

## Projects API

### List All Projects
```
GET /api/projects
```
**Access:** Authenticated users (USER, ADMIN)
**Response:** Array of projects with owner and task count

### Get Specific Project
```
GET /api/projects/{id}
```
**Access:** Authenticated users (USER, ADMIN)
**Response:** Project details with tasks and assignees

### Create Project
```
POST /api/projects
```
**Access:** Authenticated users (USER, ADMIN)
**Body:**
```json
{
  "title": "New Project",
  "description": "Project description"
}
```
**Note:** User automatically becomes project owner

### Update Project
```
PUT /api/projects/{id}
```
**Access:** Project owner or ADMIN
**Body:**
```json
{
  "title": "Updated Project Title",
  "description": "Updated description"
}
```

### Delete Project
```
DELETE /api/projects/{id}
```
**Access:** Project owner or ADMIN
**Note:** All associated tasks are automatically deleted (cascade)

## Tasks API

### List All Tasks
```
GET /api/tasks
```
**Access:** Authenticated users (USER, ADMIN)

**Query Parameters:**
- `projectId` - Filter by project
- `assigneeId` - Filter by assignee
- `status` - Filter by status (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)

**Examples:**
```
GET /api/tasks?projectId=123
GET /api/tasks?status=IN_PROGRESS&priority=HIGH
GET /api/tasks?assigneeId=456
```

### Get Specific Task
```
GET /api/tasks/{id}
```
**Access:** Authenticated users (USER, ADMIN)
**Response:** Task details with project and assignee information

### Create Task
```
POST /api/tasks
```
**Access:** Project owner or ADMIN
**Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "HIGH",
  "deadline": "2024-12-31T23:59:59.000Z",
  "projectId": "project-id",
  "assigneeId": "user-id" // Optional
}
```

### Update Task
```
PUT /api/tasks/{id}
```
**Access:** Task assignee, Project owner, or ADMIN
**Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "deadline": "2024-12-31T23:59:59.000Z",
  "assigneeId": "new-user-id"
}
```

### Delete Task
```
DELETE /api/tasks/{id}
```
**Access:** Project owner or ADMIN

## Users API (Admin Only)

### List All Users
```
GET /api/users
```
**Access:** ADMIN only
**Response:** Array of users with project and task counts

### Create User
```
POST /api/users
```
**Access:** ADMIN only
**Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER"
}
```

## Access Control Matrix

| Action | USER | ADMIN | Project Owner | Task Assignee |
|--------|------|-------|---------------|---------------|
| View Projects | ✅ | ✅ | ✅ | ✅ |
| Create Projects | ✅ | ✅ | ✅ | ✅ |
| Update Own Projects | ✅ | ✅ | ✅ | ❌ |
| Delete Own Projects | ✅ | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ | ✅ |
| Create Tasks | ❌ | ✅ | ✅ | ❌ |
| Update Assigned Tasks | ✅ | ✅ | ✅ | ✅ |
| Update Other Tasks | ❌ | ✅ | ✅ | ❌ |
| Delete Tasks | ❌ | ✅ | ✅ | ❌ |
| Manage Users | ❌ | ✅ | ❌ | ❌ |

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

## Example Usage

### Complete Workflow

1. **Login to get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

2. **Create a project:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Project","description":"A new project"}'
```

3. **Create a task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"First Task","projectId":"PROJECT_ID","priority":"HIGH"}'
```

4. **Update task status:**
```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Notes

- All endpoints require valid JWT tokens
- Passwords are hashed using bcrypt
- Role-based access control is enforced
- Input validation is performed on all endpoints
- SQL injection is prevented through Prisma ORM
