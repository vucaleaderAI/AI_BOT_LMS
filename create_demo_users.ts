
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { PrismaClient, UserRole } from '@prisma/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Key is missing in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const prisma = new PrismaClient();

const users = [
    { email: 'owner@test.com', password: 'password123', name: '김원장', role: UserRole.OWNER },
    { email: 'instructor@test.com', password: 'password123', name: '이강사', role: UserRole.INSTRUCTOR },
    { email: 'student@test.com', password: 'password123', name: '박학생', role: UserRole.STUDENT },
    { email: 'parent@test.com', password: 'password123', name: '최학부모', role: UserRole.PARENT },
];

async function main() {
    console.log('Creating demo users for each role...');

    // 0. Ensure an Academy exists for testing
    let academy = await prisma.academy.findFirst({ where: { name: '테스트 학원' } });
    if (!academy) {
        // Generate a test code
    }

    // Checking for existing owner to create academy

    for (const u of users) {
        try {
            console.log(`Processing ${u.email} (${u.role})...`);

            // 1. Supabase Auth (Keep existing logic)
            let authUserId = '';
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { name: u.name, role: u.role }
            });

            if (authError) {
                if (authError.message.includes('already been registered')) {
                    const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
                    const existingUser = existingUsers.find(user => user.email === u.email);
                    if (existingUser) authUserId = existingUser.id;
                    else throw new Error('Could not find existing user ID');
                } else {
                    throw authError; // Rethrow other errors
                }
            } else {
                authUserId = authUser.user.id;
            }

            // 2. Create/Update Prisma User
            let academyId = null;

            // If OWNER, we might need to create an academy later or now. 
            // The constraint is Academy.ownerId is required.
            // So we must create User first, then Academy, then update User with academyId.

            const user = await prisma.user.upsert({
                where: { email: u.email },
                update: {
                    authId: authUserId,
                    name: u.name,
                    role: u.role,
                    status: 'ACTIVE', // Force active for demo
                },
                create: {
                    authId: authUserId,
                    email: u.email,
                    name: u.name,
                    role: u.role,
                    status: 'ACTIVE', // Force active for demo
                },
            });

            if (u.role === 'OWNER') {
                // Ensure Academy exists for this owner
                const code = "TESTCODE";
                const academy = await prisma.academy.upsert({
                    where: { ownerId: user.id },
                    update: {},
                    create: {
                        name: '테스트 학원',
                        code: code,
                        ownerId: user.id,
                    }
                });

                // Update owner's academyId and ownedAcademy relation is auto
                await prisma.user.update({
                    where: { id: user.id },
                    data: { academyId: academy.id }
                });
                console.log(` -> Academy created/verified: ${academy.name} (${academy.code})`);
            } else {
                // For others, assign to the '테스트 학원' if it exists
                // We rely on the fact that OWNER is processed first in the array? 
                // The array order is Owner, Instructor, Student, Parent. So yes.
                const ownerUser = await prisma.user.findUnique({ where: { email: 'owner@test.com' } });
                if (ownerUser?.academyId) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { academyId: ownerUser.academyId }
                    });
                }
            }

            console.log(` -> Prisma profile upserted: ${user.name} (${user.role}) - ACTIVE`);

        } catch (error) {
            console.error(`Error processing ${u.email}:`, error);
        }
    }

    console.log('\n✅ All users created/verified successfully!');
    console.log('\n--- Credentials ---');
    users.forEach(u => {
        console.log(`Role: ${u.role}\nEmail: ${u.email}\nPassword: ${u.password}\n-------------------`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
