import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function InstructorClassesPage() {
  const user = await requireUser(["INSTRUCTOR"]);

  const classes = await prisma.class.findMany({
    where: { instructorId: user.id },
    include: {
      enrollments: {
        where: { isActive: true },
        include: {
          student: {
            include: {
              chatSessions: { orderBy: { updatedAt: "desc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">학급 관리</h1>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              배정된 수업이 없습니다.
            </CardContent>
          </Card>
        ) : (
          classes.map((cls) => (
            <Card key={cls.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                  <Badge variant="secondary">{cls.subject}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {cls.enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">수강생이 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {cls.enrollments.map((enrollment) => {
                      const lastActivity = enrollment.student.chatSessions[0]?.updatedAt;
                      return (
                        <div key={enrollment.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {enrollment.student.name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-sm font-medium">{enrollment.student.name}</span>
                              <p className="text-xs text-muted-foreground">{enrollment.student.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              마지막 활동: {lastActivity ? new Date(lastActivity).toLocaleDateString("ko-KR") : "없음"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
