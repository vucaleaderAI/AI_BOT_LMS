
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { academy: true, ownedAcademy: true },
    });

    console.log("Users:");
    users.forEach((u) => {
        console.log(`- ${u.name} (${u.role}): Status=${u.status}, Academy=${u.academy?.name} (${u.academy?.code}), Owned=${u.ownedAcademy?.name}`);
    });
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
