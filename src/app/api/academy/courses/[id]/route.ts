
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: String } }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "OWNER" || !user.academyId) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const { id } = params;
        const body = await request.json();
        const { name, description, instructorId } = body;

        const course = await prisma.class.update({
            where: { id: id as string, academyId: user.academyId }, // Ensure update is limited to owner's academy
            data: {
                name: name || undefined,
                description: description || undefined,
                instructorId: instructorId || undefined,
            },
        });

        return NextResponse.json({ course });
    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: String } }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "OWNER" || !user.academyId) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const { id } = params;

        await prisma.class.delete({
            where: { id: id as string, academyId: user.academyId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting course:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
