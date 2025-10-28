import { auth } from "~/lib/auth";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, password, phone, role } = body

    // Validate required fields
    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Name, email and password are required'
      })
    }

    // Create user with better-auth
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      }
    });

    // If user was created successfully, update additional fields
    if (response.user) {
      await prisma.user.update({
        where: { id: response.user.id },
        data: {
          phone,
          role: role || 'PASSENGER'
        }
      });

      // Get updated user without password
      const updatedUser = await prisma.user.findUnique({
        where: { id: response.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        user: updatedUser,
        session: response.session
      };
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create user'
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error creating user'
    })
  }
})