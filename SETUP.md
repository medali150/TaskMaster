# Setup Guide

## Quick Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
# Copy the template below to .env file

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Start development server
npm run dev
```

## Environment Configuration

Create a `.env` file in the root directory with the following content:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager?schema=public"

# NextAuth (if using authentication)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Database configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="taskmanager"
DB_USER="username"
DB_PASSWORD="password"
```

**Important**: Replace the placeholder values with your actual PostgreSQL credentials:
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `taskmanager`: Your database name (create this database first)

## Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE taskmanager;
```

### 2. Run Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

## Verification

After setup, you should be able to:

1. Visit [http://localhost:3000](http://localhost:3000) and see the Task Manager App
2. Access API endpoints:
   - `GET /api/users` - Should return empty array `[]`
   - `POST /api/users` - Should create new users
   - `GET /api/projects` - Should return empty array `[]`
   - `POST /api/projects` - Should create new projects
   - `GET /api/tasks` - Should return empty array `[]`
   - `POST /api/tasks` - Should create new tasks

## Testing the API

### 1. Create a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "USER"
  }'
```

### 2. Create a Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Project",
    "description": "A sample project",
    "ownerId": "USER_ID_FROM_STEP_1"
  }'
```

### 3. Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete setup",
    "description": "Finish the project setup",
    "priority": "HIGH",
    "projectId": "PROJECT_ID_FROM_STEP_2",
    "assigneeId": "USER_ID_FROM_STEP_1"
  }'
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure PostgreSQL is running and credentials are correct
2. **Prisma Client Error**: Run `npx prisma generate` after schema changes
3. **Migration Errors**: Check if database exists and user has proper permissions
4. **Foreign Key Errors**: Ensure referenced entities exist before creating related records

### Useful Commands

```bash
# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Check Prisma status
npx prisma db pull

# Push schema changes without migrations
npx prisma db push

# View database schema
npx prisma format
```
