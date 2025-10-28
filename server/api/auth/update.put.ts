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

    const body = await readBody(event)
    const { name, phone } = body

    // Update user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined
      }
    })

    // Remove sensitive data from response
    const { passwordHash: _, ...userWithoutPassword } = user

    return userWithoutPassword
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error updating user'
    })
  }
})