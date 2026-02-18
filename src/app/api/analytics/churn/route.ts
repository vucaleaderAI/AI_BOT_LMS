import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ai } from "@/lib/ai/gemini-client";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser || dbUser.role !== "OWNER" || !dbUser.academyId) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
    }

    const students = await prisma.user.findMany({
      where: { academyId: dbUser.academyId, role: "STUDENT" },
    });

    const predictions = [];

    for (const student of students) {
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // 최근 2주 활동 데이터
      const [recentSessions, recentEmotions] = await Promise.all([
        prisma.chatSession.findMany({
          where: { userId: student.id, updatedAt: { gte: twoWeeksAgo } },
        }),
        prisma.emotionAnalysis.findMany({
          where: {
            message: { session: { userId: student.id } },
            createdAt: { gte: twoWeeksAgo },
          },
        }),
      ]);

      // 규칙 기반 위험 점수 계산
      let riskScore = 0;
      const factors: string[] = [];

      // 활동 없음
      if (recentSessions.length === 0) {
        riskScore += 0.4;
        factors.push("최근 2주간 활동 없음");
      } else if (recentSessions.length < 2) {
        riskScore += 0.2;
        factors.push("활동 빈도 매우 낮음");
      }

      // 좌절감 비율
      const frustCount = recentEmotions.filter((e) => e.emotion === "FRUSTRATED").length;
      if (recentEmotions.length > 0) {
        const frustRatio = frustCount / recentEmotions.length;
        if (frustRatio > 0.5) {
          riskScore += 0.3;
          factors.push("좌절감 비율 높음 (" + Math.round(frustRatio * 100) + "%)");
        } else if (frustRatio > 0.3) {
          riskScore += 0.15;
          factors.push("좌절감 감지");
        }
      }

      // 혼란 비율
      const confusedCount = recentEmotions.filter((e) => e.emotion === "CONFUSED").length;
      if (recentEmotions.length > 0 && confusedCount / recentEmotions.length > 0.4) {
        riskScore += 0.15;
        factors.push("혼란 빈도 높음");
      }

      riskScore = Math.min(1, riskScore);

      // AI 설명 생성 (위험 학생만)
      let explanation = null;
      if (riskScore >= 0.5) {
        try {
          const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
              maxOutputTokens: 100,
            },
            contents: `학생 "${student.name}"의 이탈 위험 요인: ${factors.join(", ")}. 원장에게 한 줄로 요약해주세요. 한국어로.`,
          });
          explanation = res.text ?? null;
        } catch {
          explanation = factors.join(", ");
        }
      }

      const prediction = await prisma.churnPrediction.create({
        data: {
          studentId: student.id,
          riskScore,
          factors,
          explanation,
        },
      });

      predictions.push(prediction);
    }

    return NextResponse.json({ predictions, count: predictions.length });
  } catch (error) {
    console.error("Churn prediction error:", error);
    return NextResponse.json({ error: "이탈 예측 중 오류" }, { status: 500 });
  }
}
