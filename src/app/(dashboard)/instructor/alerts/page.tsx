import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell } from "lucide-react";

export default async function InstructorAlertsPage() {
  const user = await requireUser(["INSTRUCTOR"]);

  const classes = await prisma.class.findMany({
    where: { instructorId: user.id },
    include: { enrollments: { select: { studentId: true } } },
  });

  const studentIds = classes.flatMap((c) => c.enrollments.map((e) => e.studentId));

  const alerts = studentIds.length > 0
    ? await prisma.emotionAnalysis.findMany({
        where: {
          emotion: "FRUSTRATED",
          confidence: { gte: 0.7 },
          message: { session: { userId: { in: studentIds } } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          message: {
            include: { session: { include: { user: { select: { name: true, email: true } } } } },
          },
        },
      })
    : [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">알림</h1>
          {alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}건</Badge>
          )}
        </div>

        {alerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">현재 주의가 필요한 알림이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{alert.message.session.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleString("ko-KR")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        좌절감 감지 (신뢰도 {Math.round(alert.confidence * 100)}%)
                      </p>
                      {alert.reasoning && (
                        <p className="mt-1 text-xs text-muted-foreground">{alert.reasoning}</p>
                      )}
                      <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-muted-foreground">
                        &ldquo;{alert.message.content.substring(0, 100)}&rdquo;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
