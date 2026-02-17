import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, AlertTriangle, TrendingUp } from "lucide-react";

const emotionEmoji: Record<string, string> = {
  FRUSTRATED: "😤", CONFUSED: "🤔", NEUTRAL: "😐",
  INTERESTED: "🧐", CONFIDENT: "😎", EXCITED: "🤩",
};

export default async function InstructorDashboard() {
  const user = await requireUser(["INSTRUCTOR"]);

  const classes = await prisma.class.findMany({
    where: { instructorId: user.id },
    include: {
      enrollments: {
        where: { isActive: true },
        include: { student: true },
      },
    },
  });

  const studentIds = classes.flatMap((c) => c.enrollments.map((e) => e.studentId));

  const recentEmotions = studentIds.length > 0
    ? await prisma.emotionAnalysis.findMany({
        where: { message: { session: { userId: { in: studentIds } } } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { message: { include: { session: { include: { user: true } } } } },
      })
    : [];

  const frustratedStudents = recentEmotions
    .filter((e) => e.emotion === "FRUSTRATED" && e.confidence > 0.7)
    .map((e) => e.message.session.user)
    .filter((v, i, arr) => arr.findIndex((u) => u.id === v.id) === i);

  const totalStudents = new Set(studentIds).size;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">강사 대시보드</h1>
          <p className="text-muted-foreground">학생들의 학습 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{classes.length}</p>
                  <p className="text-xs text-muted-foreground">내 수업</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-xs text-muted-foreground">총 학생</p>
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
                  <p className="text-2xl font-bold">{frustratedStudents.length}</p>
                  <p className="text-xs text-muted-foreground">주의 학생</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentEmotions.length}</p>
                  <p className="text-xs text-muted-foreground">최근 감정 데이터</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 주의 필요 학생 */}
        {frustratedStudents.length > 0 && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                <AlertTriangle className="h-5 w-5" />
                주의가 필요한 학생
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {frustratedStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <Badge variant="destructive">좌절감 감지</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 수업 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">내 수업</CardTitle>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 배정된 수업이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="font-medium">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">{cls.subject}</p>
                    </div>
                    <Badge variant="secondary">{cls.enrollments.length}명</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 감정 흐름 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">학생 감정 흐름 (최근)</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmotions.length === 0 ? (
              <p className="text-sm text-muted-foreground">감정 분석 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {recentEmotions.slice(0, 10).map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <span className="text-xl">{emotionEmoji[e.emotion] || "😐"}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium">{e.message.session.user.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{e.reasoning}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleString("ko-KR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
