
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.academyId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const courses = await prisma.class.findMany({
            where: { academyId: user.academyId },
            include: {
                instructor: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: { enrollments: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "OWNER" || !user.academyId) {
            return NextResponse.json({ error: "Authorized Access Only" }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, subject, instructorId } = body;

        if (!name || !subject) {
            return NextResponse.json(
                { error: "Name and Subject are required" },
                { status: 400 }
            );
        }

        const course = await prisma.class.create({
            data: {
                name,
                description,
                subject,
                academyId: user.academyId,
                instructorId: instructorId || undefined,
            },
        });

        return NextResponse.json({ course });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
