import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, AlertTriangle, Building2 } from "lucide-react";

export default async function OwnerDashboard() {
  const user = await requireUser(["OWNER"]);

  if (!user.academyId) {
    return <p>학원 정보가 없습니다.</p>;
  }

  const [academy, students, instructors, classes, recentEmotions, churnPredictions] = await Promise.all([
    prisma.academy.findUnique({ where: { id: user.academyId } }),
    prisma.user.findMany({ where: { academyId: user.academyId, role: "STUDENT" } }),
    prisma.user.findMany({ where: { academyId: user.academyId, role: "INSTRUCTOR" } }),
    prisma.class.findMany({ where: { academyId: user.academyId }, include: { _count: { select: { enrollments: true } } } }),
    prisma.emotionAnalysis.findMany({
      where: { message: { session: { user: { academyId: user.academyId } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.churnPrediction.findMany({
      where: { student: { academyId: user.academyId }, riskScore: { gte: 0.6 } },
      orderBy: { riskScore: "desc" },
      take: 10,
      include: { student: true },
    }),
  ]);

  const emotionCounts: Record<string, number> = {};
  recentEmotions.forEach((e) => {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
  });

  const highRiskCount = churnPredictions.filter((c) => c.riskScore >= 0.8).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{academy?.name} 대시보드</h1>
          <Badge variant="outline" className="text-sm px-3 py-1 border-primary text-primary">
            학원 코드: {academy?.code}
          </Badge>
        </div>
        <p className="text-muted-foreground">학원 전체 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">학생 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instructors.length}</p>
                <p className="text-xs text-muted-foreground">강사 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-xs text-muted-foreground">수업 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highRiskCount}</p>
                <p className="text-xs text-muted-foreground">이탈 위험</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">감정 분포 (최근 100건)</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmotions.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 감정 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {[
                  { key: "EXCITED", emoji: "🤩", label: "신남", color: "bg-green-500" },
                  { key: "CONFIDENT", emoji: "😎", label: "자신감", color: "bg-blue-500" },
                  { key: "INTERESTED", emoji: "🧐", label: "흥미", color: "bg-cyan-500" },
                  { key: "NEUTRAL", emoji: "😐", label: "평범", color: "bg-gray-400" },
                  { key: "CONFUSED", emoji: "🤔", label: "혼란", color: "bg-yellow-500" },
                  { key: "FRUSTRATED", emoji: "😤", label: "좌절", color: "bg-red-500" },
                ].map(({ key, emoji, label, color }) => {
                  const count = emotionCounts[key] || 0;
                  const pct = recentEmotions.length > 0 ? (count / recentEmotions.length) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-6 text-center">{emoji}</span>
                      <span className="w-16 text-sm">{label}</span>
                      <div className="flex-1">
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="w-12 text-right text-sm text-muted-foreground">{count}건</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              이탈 위험 학생
            </CardTitle>
          </CardHeader>
          <CardContent>
            {churnPredictions.length === 0 ? (
              <p className="text-sm text-muted-foreground">이탈 위험 학생이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {churnPredictions.map((pred) => (
                  <div key={pred.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                        {pred.student.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{pred.student.name}</span>
                        {pred.explanation && (
                          <p className="text-xs text-muted-foreground">{pred.explanation}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={pred.riskScore >= 0.8 ? "destructive" : "warning"}>
                      {Math.round(pred.riskScore * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
