
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'vucaleader@naver.com'
    console.log(`Checking profile for ${email}...`)

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (user) {
        console.log('Profile FOUND:', user)
    } else {
        console.log('Profile NOT FOUND. This explains the blank screen if the app expects a profile.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
