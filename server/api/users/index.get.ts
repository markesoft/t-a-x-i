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

    // Only admin can get all users
    if (session.user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Forbidden'
      });
    }

    // Get query parameters for pagination
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await prisma.user.findMany({
      skip,
      take: limit,
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

    // Get total count for pagination
    const total = await prisma.user.count();

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error retrieving users'
    });
  }
});