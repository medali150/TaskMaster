import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt'
import { prisma } from './prisma'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export async function authenticateUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId,
        isActive: true
      },
      select: { id: true, email: true, role: true }
    })

    if (!user) {
      return null
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role
    }
  } catch (error) {
    return null
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user
    
    return handler(authenticatedRequest, context)
  }
}

export function requireRole(allowedRoles: string[]) {
  return (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) => {
    return requireAuth(async (request: AuthenticatedRequest, context?: any) => {
      const user = request.user!
      
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      
      return handler(request, context)
    })
  }
}

export function requireAdmin(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return requireRole(['ADMIN'])(handler)
}

export function requireUser(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return requireRole(['USER', 'ADMIN'])(handler)
}
