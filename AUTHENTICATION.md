# JWT Authentication System

This document describes the JWT authentication implementation for the Task Manager App.

## Overview

The authentication system uses JWT (JSON Web Tokens) for secure user authentication and authorization. It includes:

- User registration and login
- JWT token generation and validation
- Role-based access control (USER, ADMIN)
- Protected API routes
- Password hashing with bcrypt

## Authentication Flow

### 1. User Registration
```
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Note:** All new users are automatically assigned the `USER` role. Admin users must be created directly in the database or by existing admins.

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. User Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

### 3. Using the Token
Include the JWT token in the Authorization header for protected routes:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Public Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Protected Endpoints
- `GET /api/auth/profile` - Get user profile (USER, ADMIN)
- `GET /api/users` - List all users (ADMIN only)
- `POST /api/users` - Create new user (ADMIN only)
- `GET /api/projects` - List all projects (USER, ADMIN)
- `POST /api/projects` - Create new project (USER, ADMIN)
- `GET /api/tasks` - List all tasks (USER, ADMIN)
- `POST /api/tasks` - Create new task (USER, ADMIN)

## Role-Based Access Control

### USER Role
- Can view and create projects
- Can view and create tasks (if project owner or admin)
- Can view their own profile
- Cannot manage other users

### ADMIN Role
- Has all USER permissions
- Can view all users
- Can create new users
- Can access all projects and tasks
- Full system access

## Middleware Functions

### requireAuth
Protects routes requiring authentication. Returns 401 if no valid token.

### requireRole(allowedRoles)
Protects routes requiring specific roles. Returns 403 if user lacks required role.

### requireAdmin
Protects admin-only routes. Only ADMIN users can access.

### requireUser
Protects user routes. Both USER and ADMIN can access.

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length: 6 characters
- Passwords are never stored in plain text

### JWT Security
- Tokens expire after 7 days (configurable)
- Secret key should be changed in production
- Tokens are validated on every request

### Input Validation
- Email format validation
- Required field validation
- Role validation (USER/ADMIN only)
- Password strength requirements

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Database (already configured)
DATABASE_URL="postgresql://postgres:dali2004@localhost:5432/taskapp"
```

## Usage Examples

### Creating a Protected Request
```javascript
// Login to get token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
})

const { token } = await loginResponse.json()

// Use token for protected requests
const projectsResponse = await fetch('/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Error Handling
```javascript
if (response.status === 401) {
  // Unauthorized - redirect to login
  console.log('Authentication required')
} else if (response.status === 403) {
  // Forbidden - insufficient permissions
  console.log('Insufficient permissions')
}
```

## Database Schema Updates

The authentication system adds these fields to the User model:

- `isActive`: Boolean flag for account status
- `password`: Hashed password (never plain text)
- `role`: User role (USER or ADMIN)

## Testing the Authentication

### 1. Create a Test User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login to Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Use Token for Protected Route
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Production Considerations

1. **Change JWT Secret**: Use a strong, unique secret key
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Expiration**: Consider shorter token lifetimes for security
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Logging**: Log authentication attempts and failures
6. **Password Policy**: Enforce stronger password requirements
7. **Account Lockout**: Implement account lockout after failed attempts

## Troubleshooting

### Common Issues

1. **"Authentication required" (401)**
   - Missing or invalid Authorization header
   - Expired token
   - Invalid token format

2. **"Insufficient permissions" (403)**
   - User role doesn't match required role
   - User account is inactive

3. **"User not found" (404)**
   - User was deleted or deactivated
   - Token contains invalid user ID

### Debug Steps

1. Check token expiration
2. Verify user exists and is active
3. Confirm user role matches requirements
4. Validate token format and signature
5. Check environment variables
