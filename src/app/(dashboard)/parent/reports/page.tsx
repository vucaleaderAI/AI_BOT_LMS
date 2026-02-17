import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function ParentReportsPage() {
  const user = await requireUser(["PARENT"]);

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
  });

  const reports = await prisma.weeklyReport.findMany({
    where: { studentId: { in: children.map((c) => c.id) } },
    orderBy: { weekStart: "desc" },
    include: { student: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">주간 리포트</h1>
        <p className="text-muted-foreground">AI가 작성한 자녀의 학습 리포트를 확인하세요</p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">아직 주간 리포트가 없습니다. 자녀가 AI 튜터를 사용하면 매주 자동으로 생성됩니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const content = report.content as Record<string, string>;
            return (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.student.name}의 주간 리포트</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(report.weekStart).toLocaleDateString("ko-KR")} 주차
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed">{report.summary}</p>
                  {content.highlights && (
                    <div>
                      <h4 className="mb-1 text-sm font-semibold">이번 주 잘한 점</h4>
                      <p className="text-sm text-muted-foreground">{content.highlights}</p>
                    </div>
                  )}
                  {content.improvements && (
                    <div>
                      <h4 className="mb-1 text-sm font-semibold">개선 방향</h4>
                      <p className="text-sm text-muted-foreground">{content.improvements}</p>
                    </div>
                  )}
                  {content.parentTips && (
                    <div>
                      <h4 className="mb-1 text-sm font-semibold">가정에서 도와줄 수 있는 팁</h4>
                      <p className="text-sm text-muted-foreground">{content.parentTips}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
