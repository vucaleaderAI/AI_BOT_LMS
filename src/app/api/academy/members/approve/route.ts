
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, action } = await request.json(); // action: APPROVE | REJECT

        // Validate request
        if (!userId || !["APPROVE", "REJECT"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Check if requester is owner of the academy
        const requester = await prisma.user.findUnique({
            where: { authId: user.id },
            include: { ownedAcademy: true },
        });

        if (!requester || requester.role !== "OWNER" || !requester.ownedAcademy) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Find target user and verify they belong to same academy
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (targetUser.academyId !== requester.ownedAcademy.id) {
            return NextResponse.json({ error: "User does not belong to your academy" }, { status: 403 });
        }

        // Perform action
        const newStatus = action === "APPROVE" ? "ACTIVE" : "REJECTED";

        await prisma.user.update({
            where: { id: userId },
            data: { status: newStatus },
        });

        return NextResponse.json({ status: newStatus });

    } catch (error) {
        console.error("Error updating member status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
