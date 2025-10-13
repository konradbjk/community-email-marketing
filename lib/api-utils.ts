/**
 * API utilities for extracting user information from middleware headers
 */

export interface AuthenticatedUser {
  merck_id: string
  email: string
  name: string
  surname: string
  image?: string
}

/**
 * Extract authenticated user information from request headers
 * User info is validated and injected by middleware
 *
 * @param request - The incoming request object
 * @returns AuthenticatedUser object or null if headers are missing
 */
export function getUserFromHeaders(request: Request): AuthenticatedUser | null {
  const merck_id = request.headers.get('x-user-merck-id')
  const email = request.headers.get('x-user-email')
  const name = request.headers.get('x-user-name')
  const surname = request.headers.get('x-user-surname')
  const image = request.headers.get('x-user-image')

  if (!merck_id || !email || !name || !surname) {
    return null
  }

  return {
    merck_id,
    email,
    name,
    surname,
    image: image || undefined,
  }
}
