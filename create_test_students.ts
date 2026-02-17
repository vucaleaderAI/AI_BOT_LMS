

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

const students = [
    { email: 'student1@test.com', password: 'password123', name: '김학생1' },
    { email: 'student2@test.com', password: 'password123', name: '이학생2' },
    { email: 'student3@test.com', password: 'password123', name: '박학생3' },
];

async function main() {
    console.log('Creating test student accounts...');

    for (const student of students) {
        try {
            console.log(`Processing ${student.email}...`);

            // 1. Create Supabase Auth User
            let authUserId = '';
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: student.email,
                password: student.password,
                email_confirm: true,
                user_metadata: { name: student.name, role: 'STUDENT' }
            });

            if (authError) {
                if (authError.message.includes('already been registered')) {
                    console.log(` -> Auth user already exists. Fetching ID...`);
                    const { data: { users } } = await supabase.auth.admin.listUsers();
                    const existingUser = users.find(u => u.email === student.email);
                    if (existingUser) authUserId = existingUser.id;
                    else throw new Error('Could not find existing user ID');
                } else {
                    throw authError; // Rethrow other errors
                }
            } else {
                authUserId = authUser.user.id;
                console.log(` -> Auth user created: ${authUserId}`);
            }

            // 2. Create/Update Prisma User
            const user = await prisma.user.upsert({
                where: { email: student.email },
                update: {
                    authId: authUserId,
                    name: student.name,
                    role: UserRole.STUDENT,
                },
                create: {
                    authId: authUserId,
                    email: student.email,
                    name: student.name,
                    role: UserRole.STUDENT,
                },
            });

            console.log(` -> Prisma profile upserted: ${user.name} (${user.id})`);

        } catch (error) {
            console.error(`Error processing ${student.email}:`, error);
        }
    }

    console.log('\n--- Credentials ---');
    students.forEach(s => {
        console.log(`Email: ${s.email} | Password: ${s.password}`);
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
