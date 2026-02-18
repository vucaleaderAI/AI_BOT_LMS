import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Trophy, TrendingUp, Clock, ArrowRight, BookOpen } from "lucide-react";

const emotionEmoji: Record<string, string> = {
  FRUSTRATED: "😤",
  CONFUSED: "🤔",
  NEUTRAL: "😐",
  INTERESTED: "🧐",
  CONFIDENT: "😎",
  EXCITED: "🤩",
};

const emotionLabel: Record<string, string> = {
  FRUSTRATED: "좌절",
  CONFUSED: "혼란",
  NEUTRAL: "평범",
  INTERESTED: "흥미",
  CONFIDENT: "자신감",
  EXCITED: "신남",
};

export default async function StudentDashboard() {
  const user = await requireUser(["STUDENT"]);

  const [sessions, badges, recentEmotions, enrollments] = await Promise.all([
    prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { messages: true } } },
    }),
    prisma.studentBadge.findMany({
      where: { studentId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.emotionAnalysis.findMany({
      where: { message: { session: { userId: user.id } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.classEnrollment.findMany({
      where: { studentId: user.id, isActive: true },
      include: { class: { include: { instructor: true } } },
    }),
  ]);

  const totalMessages = sessions.reduce((sum, s) => sum + s._count.messages, 0);
  const enrolledCoursesCount = enrollments.length;

  const dominantEmotion = recentEmotions.length > 0
    ? recentEmotions.reduce((acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
    : null;

  const topEmotion = dominantEmotion
    ? Object.entries(dominantEmotion).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">안녕하세요, {user.name}님!</h1>
        <p className="text-muted-foreground">오늘도 열심히 코딩해볼까요?</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">총 대화</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMessages}</p>
                <p className="text-xs text-muted-foreground">총 메시지</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
                <BookOpen className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrolledCoursesCount}</p>
                <p className="text-xs text-muted-foreground">수강 중인 과목</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{badges.length}</p>
                <p className="text-xs text-muted-foreground">획득 뱃지</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {topEmotion ? emotionEmoji[topEmotion] : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topEmotion ? emotionLabel[topEmotion] : "감정 데이터 없음"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 튜터 시작 CTA */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold">AI 튜터와 대화하기</h3>
            <p className="text-sm text-muted-foreground">
              코딩 질문이 있으면 AI 튜터에게 물어보세요!
            </p>
          </div>
          <Button asChild>
            <Link href="/student/chat">
              시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 수강 중인 과목 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">수강 중인 과목</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 수강 중인 과목이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.classId} className="border rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{enrollment.class.name}</h4>
                    <Badge variant="outline">{enrollment.class.subject}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{enrollment.class.description || "설명 없음"}</p>
                  <div className="text-xs mt-auto pt-2 border-t">
                    강사: {enrollment.class.instructor ? enrollment.class.instructor.name : "미배정"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 최근 대화 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">최근 대화</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 대화 내역이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {session.title || "대화"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        메시지 {session._count.messages}개
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(session.updatedAt).toLocaleDateString("ko-KR")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 획득 뱃지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">내 뱃지</CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                AI 튜터와 대화하면 뱃지를 획득할 수 있어요!
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.map((sb) => (
                  <div
                    key={sb.id}
                    className="flex flex-col items-center rounded-lg border p-3 text-center"
                  >
                    <span className="text-3xl">{sb.badge.icon}</span>
                    <span className="mt-1 text-xs font-medium">{sb.badge.name}</span>
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

