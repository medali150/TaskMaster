import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash passwords
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash('password123', saltRounds)

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'USER',
      isActive: true
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'USER',
      isActive: true
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log('✅ Users created:', { 
    user1: user1.id, 
    user2: user2.id, 
    admin: admin.id 
  })

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'project-1' },
    update: {},
    create: {
      id: 'project-1',
      title: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
      ownerId: user1.id
    }
  })

  const project2 = await prisma.project.upsert({
    where: { id: 'project-2' },
    update: {},
    create: {
      id: 'project-2',
      title: 'Mobile App Development',
      description: 'Develop a new mobile application for iOS and Android',
      ownerId: user2.id
    }
  })

  console.log('✅ Projects created:', { 
    project1: project1.id, 
    project2: project2.id 
  })

  // Create sample tasks
  const task1 = await prisma.task.upsert({
    where: { id: 'task-1' },
    update: {},
    create: {
      id: 'task-1',
      title: 'Design Homepage Layout',
      description: 'Create wireframes and mockups for the new homepage',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      deadline: new Date('2024-12-31'),
      projectId: project1.id,
      assigneeId: user1.id
    }
  })

  const task2 = await prisma.task.upsert({
    where: { id: 'task-2' },
    update: {},
    create: {
      id: 'task-2',
      title: 'Set up Development Environment',
      description: 'Configure development tools and dependencies',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      projectId: project2.id,
      assigneeId: user2.id
    }
  })

  const task3 = await prisma.task.upsert({
    where: { id: 'task-3' },
    update: {},
    create: {
      id: 'task-3',
      title: 'API Documentation',
      description: 'Write comprehensive API documentation',
      status: 'TODO',
      priority: 'LOW',
      deadline: new Date('2025-01-15'),
      projectId: project1.id,
      assigneeId: user2.id
    }
  })

  console.log('✅ Tasks created:', { 
    task1: task1.id, 
    task2: task2.id, 
    task3: task3.id 
  })

  console.log('🎉 Database seeding completed successfully!')
  console.log('📝 Test Credentials:')
  console.log('  User: john@example.com / password123')
  console.log('  User: jane@example.com / password123')
  console.log('  Admin: admin@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
