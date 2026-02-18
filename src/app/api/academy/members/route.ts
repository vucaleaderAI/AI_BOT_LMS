
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { authId: user.id },
        });

        if (!currentUser || !currentUser.academyId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let whereClause: any = {
            academyId: currentUser.academyId,
            id: { not: currentUser.id },
        };

        if (currentUser.role === "INSTRUCTOR") {
            whereClause.role = "STUDENT";
        } else if (currentUser.role !== "OWNER") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const members = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ members });
    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
