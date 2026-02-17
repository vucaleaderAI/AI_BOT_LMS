
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

    for (const u of users) {
        try {
            console.log(`Processing ${u.email} (${u.role})...`);

            // 1. Create Supabase Auth User
            let authUserId = '';
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { name: u.name, role: u.role }
            });

            if (authError) {
                if (authError.message.includes('already been registered')) {
                    console.log(` -> Auth user already exists. Fetching ID...`);
                    const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
                    const existingUser = existingUsers.find(user => user.email === u.email);
                    if (existingUser) authUserId = existingUser.id;
                    else throw new Error('Could not find existing user ID');
                } else {
                    throw authError;
                }
            } else {
                authUserId = authUser.user.id;
                console.log(` -> Auth user created: ${authUserId}`);
            }

            // 2. Create/Update Prisma User
            const user = await prisma.user.upsert({
                where: { email: u.email },
                update: {
                    authId: authUserId,
                    name: u.name,
                    role: u.role,
                },
                create: {
                    authId: authUserId,
                    email: u.email,
                    name: u.name,
                    role: u.role,
                },
            });

            console.log(` -> Prisma profile upserted: ${user.name} (${user.role})`);

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
