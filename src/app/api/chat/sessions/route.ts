import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Sessions error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
