import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Heart, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

const emotionEmoji: Record<string, string> = {
  FRUSTRATED: "😤", CONFUSED: "🤔", NEUTRAL: "😐",
  INTERESTED: "🧐", CONFIDENT: "😎", EXCITED: "🤩",
};
const emotionLabel: Record<string, string> = {
  FRUSTRATED: "좌절", CONFUSED: "혼란", NEUTRAL: "평범",
  INTERESTED: "흥미", CONFIDENT: "자신감", EXCITED: "신남",
};

export default async function ParentDashboard() {
  const user = await requireUser(["PARENT"]);

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
  });

  const childrenData = await Promise.all(
    children.map(async (child) => {
      const [sessions, latestEmotions, reports] = await Promise.all([
        prisma.chatSession.findMany({
          where: { userId: child.id },
          include: { _count: { select: { messages: true } } },
        }),
        prisma.emotionAnalysis.findMany({
          where: { message: { session: { userId: child.id } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.weeklyReport.findMany({
          where: { studentId: child.id },
          orderBy: { weekStart: "desc" },
          take: 4,
        }),
      ]);

      const totalMessages = sessions.reduce((sum, s) => sum + s._count.messages, 0);
      const emotionCounts: Record<string, number> = {};
      latestEmotions.forEach((e) => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
      });
      const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

      return { child, sessions, totalMessages, topEmotion, reports, latestEmotions };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">학부모 대시보드</h1>
        <p className="text-muted-foreground">자녀의 학습 현황과 감정 상태를 확인하세요</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Heart className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">연결된 자녀가 없습니다. 학원에 문의해주세요.</p>
          </CardContent>
        </Card>
      ) : (
        childrenData.map(({ child, sessions, totalMessages, topEmotion, reports }) => (
          <Card key={child.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {child.name.charAt(0)}
                </div>
                {child.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 통계 카드 */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <MessageSquare className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                  <p className="text-xl font-bold">{sessions.length}</p>
                  <p className="text-xs text-muted-foreground">대화 수</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <TrendingUp className="mx-auto mb-1 h-5 w-5 text-green-500" />
                  <p className="text-xl font-bold">{totalMessages}</p>
                  <p className="text-xs text-muted-foreground">메시지 수</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <Heart className="mx-auto mb-1 h-5 w-5 text-pink-500" />
                  <p className="text-xl font-bold">{topEmotion ? emotionEmoji[topEmotion] : "—"}</p>
                  <p className="text-xs text-muted-foreground">{topEmotion ? emotionLabel[topEmotion] : "데이터 없음"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <FileText className="mx-auto mb-1 h-5 w-5 text-purple-500" />
                  <p className="text-xl font-bold">{reports.length}</p>
                  <p className="text-xs text-muted-foreground">주간 리포트</p>
                </div>
              </div>

              {/* 최근 리포트 */}
              {reports.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">최근 주간 리포트</h4>
                  <div className="rounded-lg border bg-white p-4">
                    <p className="text-sm">{reports[0].summary}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(reports[0].weekStart).toLocaleDateString("ko-KR")} 주차
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
