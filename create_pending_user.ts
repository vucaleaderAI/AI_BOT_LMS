
import { createClient } from "@supabase/supabase-js";
import { PrismaClient, UserRole } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const prisma = new PrismaClient();

async function main() {
    const email = "pending@test.com";
    const password = "password123";
    const name = "나대기";
    const role = UserRole.STUDENT;

    // 1. Create Auth User
    let authUserId = "";
    const { data: authUser, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role },
    });

    if (error) {
        if (error.message.includes("already been registered")) {
            console.log("User already registered in Auth");
            const { data: { users } } = await supabase.auth.admin.listUsers();
            authUserId = users.find((u) => u.email === email)?.id!;
        } else {
            throw error;
        }
    } else {
        authUserId = authUser.user.id;
        console.log("Created Auth User");
    }

    // 2. Find Academy
    const academy = await prisma.academy.findUnique({
        where: { code: "TESTCODE" },
    });

    if (!academy) {
        throw new Error("Academy TESTCODE not found");
    }

    // 3. Create Pending User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            authId: authUserId,
            status: "PENDING",
            academyId: academy.id,
        },
        create: {
            authId: authUserId,
            email,
            name,
            role,
            status: "PENDING",
            academyId: academy.id,
        },
    });

    console.log(`Created Pending User: ${user.name} (${user.status})`);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
