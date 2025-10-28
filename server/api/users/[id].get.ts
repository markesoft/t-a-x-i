import { auth } from '~/lib/auth';

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: getHeaders(event)
    });

    if (!session?.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      });
    }

    // Get user ID from route params
    const { id } = getRouterParams(event);

    // Users can only access their own data unless they are admins
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Forbidden'
      });
    }

    // Get user by ID
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        image: true
      }
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      });
    }

    return user;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error retrieving user'
    });
  }
});