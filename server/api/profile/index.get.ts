import { auth } from '~/lib/auth';

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({
        headers: getHeaders(event)
    });
    if (!session) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            address: true,
            city: true,
            country: true,
            bio: true,
            image: true,
            preferredLanguage: true,
            role: true,
            createdAt: true
        }
    })

    if (!user) {
        throw createError({
            statusCode: 404,
            message: 'User not found'
        })
    }

    return user
})