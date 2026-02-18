
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "INSTRUCTOR") {
            return NextResponse.json({ error: "Authorized Access Only" }, { status: 403 });
        }

        const courses = await prisma.class.findMany({
            where: {
                academyId: user.academyId!,
                instructorId: user.id
            },
            include: {
                _count: {
                    select: { enrollments: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ courses });
    } catch (error) {
        console.error("Error fetching instructor courses:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
