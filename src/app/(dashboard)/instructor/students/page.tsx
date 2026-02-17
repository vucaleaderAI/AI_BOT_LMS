import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const emotionEmoji: Record<string, string> = {
  FRUSTRATED: "😤", CONFUSED: "🤔", NEUTRAL: "😐",
  INTERESTED: "🧐", CONFIDENT: "😎", EXCITED: "🤩",
};

const emotionLabel: Record<string, string> = {
  FRUSTRATED: "좌절", CONFUSED: "혼란", NEUTRAL: "평범",
  INTERESTED: "흥미", CONFIDENT: "자신감", EXCITED: "신남",
};

export default async function InstructorStudentsPage() {
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
  const uniqueStudentIds = [...new Set(studentIds)];

  const students = await Promise.all(
    uniqueStudentIds.map(async (studentId) => {
      const student = await prisma.user.findUnique({ where: { id: studentId } });
      const sessions = await prisma.chatSession.findMany({
        where: { userId: studentId },
        include: { _count: { select: { messages: true } } },
      });
      const latestEmotions = await prisma.emotionAnalysis.findMany({
        where: { message: { session: { userId: studentId } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      return { student, sessions, latestEmotions };
    })
  );

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">학생 모니터링</h1>

        {students.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              모니터링할 학생이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {students.map(({ student, sessions, latestEmotions }) => {
              if (!student) return null;
              const totalMessages = sessions.reduce((sum, s) => sum + s._count.messages, 0);
              const topEmotion = latestEmotions[0];

              return (
                <Card key={student.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="secondary">{sessions.length}개 대화</Badge>
                          <Badge variant="secondary">{totalMessages}개 메시지</Badge>
                          {topEmotion && (
                            <Badge
                              variant={topEmotion.emotion === "FRUSTRATED" ? "destructive" : "success"}
                            >
                              {emotionEmoji[topEmotion.emotion]} {emotionLabel[topEmotion.emotion]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
