# Database Schema Overview

## Entity Relationships

```
User (1) ←→ (Many) Project (1) ←→ (Many) Task
  ↑                                    ↑
  └────────── (Many) ←→ (1) ──────────┘
```

## User Entity

**Purpose**: Represents application users with role-based access control

**Fields**:
- `id`: Unique identifier (CUID)
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password (should be hashed in production)
- `role`: User role (USER, ADMIN, MANAGER)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:
- **Owned Projects**: One user can own multiple projects
- **Assigned Tasks**: One user can be assigned multiple tasks

**Role Hierarchy**:
- `USER`: Basic user, can be assigned tasks
- `MANAGER`: Can manage projects and assign tasks
- `ADMIN`: Full system access

## Project Entity

**Purpose**: Organizes tasks into logical groups with ownership

**Fields**:
- `id`: Unique identifier (CUID)
- `title`: Project name/title
- `description`: Optional project description
- `createdAt`: Project creation timestamp
- `updatedAt`: Last update timestamp
- `ownerId`: Foreign key to User (project owner)

**Relationships**:
- **Owner**: Each project has exactly one owner (User)
- **Tasks**: One project can contain multiple tasks

**Business Rules**:
- Projects must have an owner
- Deleting a project cascades to delete all associated tasks

## Task Entity

**Purpose**: Individual work items with status tracking and assignment

**Fields**:
- `id`: Unique identifier (CUID)
- `title`: Task name/title
- `description`: Optional task description
- `status`: Current task status (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority`: Task priority level (LOW, MEDIUM, HIGH, URGENT)
- `deadline`: Optional due date
- `createdAt`: Task creation timestamp
- `updatedAt`: Last update timestamp
- `projectId`: Foreign key to Project (required)
- `assigneeId`: Foreign key to User (optional)

**Relationships**:
- **Project**: Each task belongs to exactly one project
- **Assignee**: Each task can be assigned to one user (optional)

**Business Rules**:
- Tasks must belong to a project
- Tasks can optionally be assigned to users
- Deleting a project cascades to delete all associated tasks
- Unassigning a user sets assigneeId to null (doesn't delete the user)

## Database Constraints

### Foreign Key Constraints
- `Project.ownerId` → `User.id` (CASCADE on delete)
- `Task.projectId` → `Project.id` (CASCADE on delete)
- `Task.assigneeId` → `User.id` (SET NULL on delete)

### Unique Constraints
- `User.email` must be unique across all users

### Required Fields
- All entities require `id`, `title` (for Project/Task), `name`, `email`, `password` (for User)
- `Project.ownerId` and `Task.projectId` are required for proper relationships

## Data Flow Examples

### Creating a New Project
1. User must exist first
2. Create project with valid `ownerId`
3. Project is automatically linked to owner

### Creating a New Task
1. Project must exist first
2. Create task with valid `projectId`
3. Optionally assign to existing user via `assigneeId`
4. Task is automatically linked to project and assignee

### User Deletion Scenarios
- **User owns projects**: All owned projects and their tasks are deleted (CASCADE)
- **User is assigned tasks**: Tasks remain but `assigneeId` becomes null (SET NULL)

## API Endpoints

### Users
- `GET /api/users` - List all users with project/task counts
- `POST /api/users` - Create new user

### Projects
- `GET /api/projects` - List all projects with owner and task counts
- `POST /api/projects` - Create new project (requires valid ownerId)

### Tasks
- `GET /api/tasks` - List all tasks with project and assignee details
- `POST /api/tasks` - Create new task (requires valid projectId)

## Sample Data

The application includes a seed script (`npm run seed`) that creates:
- 3 sample users (User, Manager, Admin)
- 2 sample projects
- 3 sample tasks with different statuses and priorities

## Migration Strategy

When running `npx prisma migrate dev --name init`:
1. Creates all tables with proper constraints
2. Establishes foreign key relationships
3. Sets up indexes for performance
4. Applies all business rules and validations
