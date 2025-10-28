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

    const body = await readBody(event)
    const {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        address,
        city,
        country,
        bio,
        preferredLanguage
    } = body

    const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            firstName,
            lastName,
            phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            address,
            city,
            country,
            bio,
            preferredLanguage
        },
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

    return updatedUser
})