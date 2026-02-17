import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";

export default async function OwnerChurnPage() {
  const user = await requireUser(["OWNER"]);

  const predictions = user.academyId
    ? await prisma.churnPrediction.findMany({
        where: { student: { academyId: user.academyId } },
        orderBy: { riskScore: "desc" },
        include: { student: true },
      })
    : [];

  const high = predictions.filter((p) => p.riskScore >= 0.8);
  const medium = predictions.filter((p) => p.riskScore >= 0.5 && p.riskScore < 0.8);
  const low = predictions.filter((p) => p.riskScore < 0.5);

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">이탈 예측</h1>
          <p className="text-muted-foreground">학습 패턴과 감정 데이터를 기반으로 이탈 위험도를 분석합니다</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="border-red-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{high.length}</p>
              <p className="text-sm text-muted-foreground">고위험 (80%+)</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{medium.length}</p>
              <p className="text-sm text-muted-foreground">중위험 (50-80%)</p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{low.length}</p>
              <p className="text-sm text-muted-foreground">저위험 (50% 미만)</p>
            </CardContent>
          </Card>
        </div>

        {predictions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <TrendingDown className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">이탈 예측 데이터가 없습니다. 학생들이 AI 튜터를 사용하면 자동으로 생성됩니다.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">전체 이탈 위험 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {predictions.map((pred) => (
                  <div key={pred.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${pred.riskScore >= 0.8 ? "text-red-500" : pred.riskScore >= 0.5 ? "text-yellow-500" : "text-green-500"}`} />
                      <div>
                        <p className="font-medium">{pred.student.name}</p>
                        {pred.explanation && <p className="text-xs text-muted-foreground">{pred.explanation}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${pred.riskScore >= 0.8 ? "bg-red-500" : pred.riskScore >= 0.5 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${pred.riskScore * 100}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant={pred.riskScore >= 0.8 ? "destructive" : pred.riskScore >= 0.5 ? "warning" : "success"}>
                        {Math.round(pred.riskScore * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
