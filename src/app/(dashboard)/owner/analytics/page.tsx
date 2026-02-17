import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default async function OwnerAnalyticsPage() {
  const user = await requireUser(["OWNER"]);

  if (!user.academyId) {
    return <p>학원 정보가 없습니다.</p>;
  }

  const [totalStudents, totalSessions, totalMessages, emotionData] = await Promise.all([
    prisma.user.count({ where: { academyId: user.academyId, role: "STUDENT" } }),
    prisma.chatSession.count({ where: { user: { academyId: user.academyId } } }),
    prisma.chatMessage.count({ where: { session: { user: { academyId: user.academyId } } } }),
    prisma.emotionAnalysis.groupBy({
      by: ["emotion"],
      where: { message: { session: { user: { academyId: user.academyId } } } },
      _count: true,
    }),
  ]);

  const avgMessagesPerStudent = totalStudents > 0 ? Math.round(totalMessages / totalStudents) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">분석</h1>
        <p className="text-muted-foreground">학원 전체 이용 현황을 분석합니다</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">전체 학생</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{totalSessions}</p>
            <p className="text-sm text-muted-foreground">전체 대화 세션</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{totalMessages}</p>
            <p className="text-sm text-muted-foreground">전체 메시지</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{avgMessagesPerStudent}</p>
            <p className="text-sm text-muted-foreground">학생당 평균 메시지</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            감정 분석 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emotionData.length === 0 ? (
            <p className="text-sm text-muted-foreground">분석 데이터가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {emotionData
                .sort((a, b) => b._count - a._count)
                .map((item) => {
                  const total = emotionData.reduce((sum, d) => sum + d._count, 0);
                  const pct = total > 0 ? (item._count / total) * 100 : 0;
                  const emojiMap: Record<string, string> = {
                    FRUSTRATED: "😤", CONFUSED: "🤔", NEUTRAL: "😐",
                    INTERESTED: "🧐", CONFIDENT: "😎", EXCITED: "🤩",
                  };
                  const labelMap: Record<string, string> = {
                    FRUSTRATED: "좌절", CONFUSED: "혼란", NEUTRAL: "평범",
                    INTERESTED: "흥미", CONFIDENT: "자신감", EXCITED: "신남",
                  };
                  return (
                    <div key={item.emotion} className="flex items-center gap-3">
                      <span className="w-6 text-center">{emojiMap[item.emotion]}</span>
                      <span className="w-16 text-sm">{labelMap[item.emotion]}</span>
                      <div className="flex-1">
                        <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="w-20 text-right text-sm text-muted-foreground">
                        {item._count}건 ({Math.round(pct)}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
