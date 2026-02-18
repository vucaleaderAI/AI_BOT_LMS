import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ai } from "@/lib/ai/gemini-client";
import { WEEKLY_REPORT_PROMPT } from "@/lib/ai/prompts/tutor";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser || (dbUser.role !== "OWNER" && dbUser.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
    }

    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: "studentId 필요" }, { status: 400 });
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // 이번 주 대화 내역
    const messages = await prisma.chatMessage.findMany({
      where: {
        session: { userId: studentId },
        createdAt: { gte: weekStart, lt: weekEnd },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // 이번 주 감정 분석
    const emotions = await prisma.emotionAnalysis.findMany({
      where: {
        message: {
          session: { userId: studentId },
          createdAt: { gte: weekStart, lt: weekEnd },
        },
      },
    });

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "학생을 찾을 수 없습니다" }, { status: 404 });
    }

    const emotionSummary = emotions.reduce((acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const prompt = `${WEEKLY_REPORT_PROMPT}

## 학생 정보
- 이름: ${student.name}
- 이번 주 대화 수: ${messages.length}개 메시지
- 감정 분포: ${JSON.stringify(emotionSummary)}

## 이번 주 대화 내용 (최근 20개)
${messages.slice(-20).map((m) => `[${m.role}]: ${m.content.substring(0, 200)}`).join("\n")}

위 데이터를 바탕으로 학부모용 주간 리포트를 JSON 형식으로 작성하세요:
{"summary": "전체 요약 2-3문장", "highlights": "잘한 점", "improvements": "개선 방향", "parentTips": "가정 학습 팁", "emotionTrend": "감정 트렌드 요약"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        maxOutputTokens: 1024,
      },
      contents: prompt,
    });

    const text = response.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    let content = {
      summary: "이번 주 리포트를 생성할 수 없습니다.",
      highlights: "",
      improvements: "",
      parentTips: "",
      emotionTrend: "",
    };

    if (jsonMatch) {
      try {
        content = JSON.parse(jsonMatch[0]);
      } catch {
        content.summary = text.substring(0, 500);
      }
    }

    const report = await prisma.weeklyReport.upsert({
      where: {
        studentId_weekStart: {
          studentId,
          weekStart,
        },
      },
      update: { content, summary: content.summary },
      create: {
        studentId,
        weekStart,
        content,
        summary: content.summary,
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "리포트 생성 중 오류" }, { status: 500 });
  }
}
