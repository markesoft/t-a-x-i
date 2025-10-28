import { auth } from "~/lib/auth";

export default defineEventHandler(async (event) => {
  try {
    const session = await auth.api.getSession({
      headers: getHeaders(event)
    });

    if (!session?.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return { message: 'User deleted successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error deleting user'
    })
  }
})