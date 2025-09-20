# Task Manager App

A modern, AI-powered task management application built with Next.js 15, TypeScript, Tailwind CSS, and Prisma ORM with PostgreSQL. Features intelligent insights, role-based access control, and a beautiful responsive interface.

## ✨ Features

### 🎯 Core Functionality
- ⚡ **Next.js 15** with App Router for optimal performance
- 🔷 **TypeScript** for type safety and better development experience
- 🎨 **Modern UI/UX** with Tailwind CSS and glass morphism effects
- 🗄️ **PostgreSQL** with Prisma ORM for robust data management
- 🔐 **JWT Authentication** with role-based access control
- 👥 **User Management** with secure password hashing
- 📋 **Project Organization** with ownership and collaboration
- ✅ **Task Management** with assignments, priorities, and deadlines
- 📱 **Fully Responsive** design for all devices

### 🤖 AI Integration
- 🧠 **AI-Powered Insights** using OpenAI GPT-3.5-turbo
- 📊 **Smart Prioritization** - AI suggests top 3 tasks to focus on
- 📈 **Weekly Summaries** - Automated progress analysis
- ⚠️ **Risk Prediction** - AI identifies tasks at risk of being overdue
- 🔄 **Fallback System** - Works even when AI service is unavailable
- 💾 **Intelligent Caching** - Reduces API calls and improves performance

### 👨‍💼 Admin Features
- 👑 **Admin Dashboard** - Complete user management interface
- 👥 **User CRUD Operations** - Create, read, update, delete users
- 🔄 **Role Management** - Assign USER/ADMIN roles
- ✅ **User Status Toggle** - Activate/deactivate users
- 📊 **User Analytics** - View user's project and task counts

### 🎨 Modern Design
- 🌈 **Gradient Backgrounds** and modern color schemes
- ✨ **Glass Morphism** effects for premium feel
- 🎭 **Dark Mode Ready** with CSS variables
- 🔄 **Smooth Animations** and transitions
- 📱 **Mobile-First** responsive design
- 🎯 **Intuitive Navigation** with breadcrumbs

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, bcrypt for password hashing
- **AI Integration**: OpenAI GPT-3.5-turbo API
- **Development**: ESLint, Prettier, TypeScript strict mode

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js 18+** installed
- **PostgreSQL** database running
- **npm** or **yarn** package manager
- **OpenAI API Key** (optional, for AI features)

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd taskmanagerapp

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=

# JWT Configuration
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# OpenAI API (Optional - for AI insights)
OPENAI_API_KEY="your-openai-api-key-here"

# NextAuth (if using additional authentication)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Important**: 
- Replace the database credentials with your actual PostgreSQL credentials
- Change the JWT_SECRET to a strong, unique key in production
- OpenAI API key is optional - the app works without it using fallback insights

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🔐 Authentication System

The app includes a complete JWT authentication system with:

- **User Registration**: `POST /api/auth/signup` (automatically assigns USER role)
- **User Login**: `POST /api/auth/login`
- **Profile Access**: `GET /api/auth/profile`
- **Role-based Access**: USER and ADMIN roles
- **Protected Routes**: All API endpoints require authentication
- **Admin Management**: Admins can manage users via `/users` page

### Quick Authentication Test

```bash
# 1. Create a user (automatically assigned USER role)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. Use token for protected routes
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🧠 AI Integration

### Features
- **Smart Task Prioritization**: AI analyzes your tasks and suggests the top 3 to focus on
- **Weekly Progress Summary**: Automated 2-3 sentence summary of your productivity
- **Overdue Risk Prediction**: Identifies tasks likely to be overdue with reasons
- **Fallback System**: Works without OpenAI API using basic task analysis

### API Endpoint
```
GET /api/ai/insights
```
**Access**: Authenticated users only
**Response**: JSON with suggested priorities, weekly summary, and predicted overdue tasks

### Configuration
- **AI Model**: GPT-3.5-turbo (configurable)
- **Cache Duration**: 5 minutes (reduces API calls)
- **Fallback**: Basic task analysis when AI is unavailable

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Users (Admin Only)
- `GET /api/users` - List all users with analytics
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get specific user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `PATCH /api/users/[id]` - Toggle user status

### Projects
- `GET /api/projects` - List all projects (with filtering)
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get specific project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get specific task
- `PUT /api/tasks/[id]` - Update task (full update)
- `PATCH /api/tasks/[id]` - Update task status only
- `DELETE /api/tasks/[id]` - Delete task

### AI Insights
- `GET /api/ai/insights` - Get AI-powered task insights

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🗄️ Database Schema

### User Model
```typescript
{
  id: string
  name: string
  email: string
  password: string // Hashed with bcrypt
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  ownedProjects: Project[]
  assignedTasks: Task[]
}
```

### Project Model
```typescript
{
  id: string
  title: string
  description?: string
  createdAt: Date
  updatedAt: Date
  ownerId: string
  owner: User
  tasks: Task[]
}
```

### Task Model
```typescript
{
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  deadline?: Date
  createdAt: Date
  updatedAt: Date
  projectId: string
  project: Project
  assigneeId?: string
  assignee?: User
}
```

## 🔗 Relationships

- **User ↔ Project**: One-to-many (User owns multiple Projects)
- **User ↔ Task**: One-to-many (User can be assigned multiple Tasks)
- **Project ↔ Task**: One-to-many (Project contains multiple Tasks)

## 🎯 Access Control Matrix

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
| Access AI Insights | ✅ | ✅ | ✅ | ✅ |

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run migrations
npx prisma db push   # Push schema changes
npm run seed         # Seed database with sample data

# Testing
# Use the API endpoints above for testing functionality
```

## 📁 Project Structure

```
taskmanagerapp/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── users/      # User management (Admin)
│   │   │   ├── projects/   # Project endpoints
│   │   │   ├── tasks/      # Task endpoints
│   │   │   ├── ai/         # AI insights endpoints
│   │   │   └── dashboard/  # Dashboard statistics
│   │   ├── dashboard/      # Dashboard page
│   │   ├── users/          # User management pages
│   │   ├── projects/       # Project pages
│   │   ├── tasks/          # Task pages
│   │   └── page.tsx        # Home page
│   ├── lib/                # Utility libraries
│   │   ├── prisma.ts       # Prisma client
│   │   ├── jwt.ts          # JWT utilities
│   │   ├── auth.ts         # Authentication middleware
│   │   └── ai-insights.ts  # AI insights helpers
│   ├── components/         # React components
│   │   ├── Navigation.tsx  # Navigation component
│   │   └── ProtectedRoute.tsx # Route protection
│   └── contexts/           # React contexts
│       └── AuthContext.tsx # Authentication context
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding
├── README.md               # This file
└── package.json            # Dependencies and scripts
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: USER and ADMIN permissions
- **Input Validation**: Comprehensive request validation
- **Protected Routes**: All sensitive endpoints require authentication
- **API Rate Limiting**: Ready for production implementation

## 🎨 UI/UX Features

- **Modern Design**: Glass morphism, gradients, and animations
- **Responsive Layout**: Works perfectly on all devices
- **Intuitive Navigation**: Clear breadcrumbs and navigation
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation messages for actions

## 🚀 Performance Features

- **AI Caching**: 5-minute cache for AI insights
- **Optimized Queries**: Efficient database queries with Prisma
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Built-in Next.js image optimization
- **Bundle Analysis**: Ready for production optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review the [Prisma documentation](https://www.prisma.io/docs)
3. Check the [OpenAI API documentation](https://platform.openai.com/docs)
4. Open an issue in this repository

## 🔄 Recent Updates

### Latest Features (v2.0)
- ✅ **AI Integration** - Smart task insights and prioritization
- ✅ **Admin User Management** - Complete CRUD for users
- ✅ **Modern UI/UX** - Glass morphism and gradient designs
- ✅ **Status Update Fix** - Optimized task status updates with PATCH endpoint
- ✅ **Dashboard Enhancements** - AI insights and improved metrics
- ✅ **Fallback System** - Works without OpenAI API
- ✅ **Performance Optimizations** - Caching and efficient queries

---

**Built with ❤️ using Next.js, TypeScript, and AI**
