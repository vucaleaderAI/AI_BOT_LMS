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

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const studentId = searchParams.get("studentId");

    // 강사/원장은 학생의 감정 데이터 조회 가능
    const targetUserId =
      (dbUser.role === "INSTRUCTOR" || dbUser.role === "OWNER") && studentId
        ? studentId
        : dbUser.id;

    const where = sessionId
      ? { message: { session: { id: sessionId, userId: targetUserId } } }
      : { message: { session: { userId: targetUserId } } };

    const emotions = await prisma.emotionAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        message: {
          select: { content: true, createdAt: true, role: true },
        },
      },
    });

    return NextResponse.json({ emotions });
  } catch (error) {
    console.error("Emotion fetch error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
