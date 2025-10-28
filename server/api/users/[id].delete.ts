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

    // Only admin can delete other users, users can delete themselves
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Forbidden'
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return { message: 'User deleted successfully' };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error deleting user'
    });
  }
});