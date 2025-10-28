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

    // Users can only update their own data unless they are admins
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Forbidden'
      });
    }

    const body = await readBody(event);
    const { name, phone, role, emailVerified, image } = body;

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (image) updateData.image = image;

    // Only admin can update role and emailVerified status
    if (session.user.role === 'ADMIN') {
      if (role) updateData.role = role;
      if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return user;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error updating user'
    });
  }
});