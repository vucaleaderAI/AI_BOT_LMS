import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

const emotionEmoji: Record<string, string> = {
  FRUSTRATED: "😤", CONFUSED: "🤔", NEUTRAL: "😐",
  INTERESTED: "🧐", CONFIDENT: "😎", EXCITED: "🤩",
};
const emotionLabel: Record<string, string> = {
  FRUSTRATED: "좌절", CONFUSED: "혼란", NEUTRAL: "평범",
  INTERESTED: "흥미", CONFIDENT: "자신감", EXCITED: "신남",
};

export default async function ParentChildrenPage() {
  const user = await requireUser(["PARENT"]);

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
    include: {
      enrollments: { include: { class: true } },
      badges: { include: { badge: true } },
    },
  });

  const childrenWithEmotions = await Promise.all(
    children.map(async (child) => {
      const emotions = await prisma.emotionAnalysis.findMany({
        where: { message: { session: { userId: child.id } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return { child, emotions };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">자녀 현황</h1>
        <p className="text-muted-foreground">자녀의 수강 정보와 감정 트렌드를 확인하세요</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <UserCircle className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">연결된 자녀가 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        childrenWithEmotions.map(({ child, emotions }) => {
          const emotionCounts: Record<string, number> = {};
          emotions.forEach((e) => {
            emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
          });

          return (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {child.name.charAt(0)}
                  </div>
                  {child.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 수강 정보 */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold">수강 중인 수업</h4>
                  {child.enrollments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">수강 중인 수업이 없습니다.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {child.enrollments.map((e) => (
                        <Badge key={e.id} variant="secondary">{e.class.name}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 감정 트렌드 */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold">최근 감정 (20건)</h4>
                  {emotions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">감정 데이터가 없습니다.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {emotions.map((e) => (
                        <span
                          key={e.id}
                          className="text-xl"
                          title={`${emotionLabel[e.emotion]} (${Math.round(e.confidence * 100)}%)`}
                        >
                          {emotionEmoji[e.emotion]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 뱃지 */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold">획득 뱃지</h4>
                  {child.badges.length === 0 ? (
                    <p className="text-sm text-muted-foreground">아직 뱃지가 없습니다.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {child.badges.map((sb) => (
                        <div key={sb.id} className="flex items-center gap-1 rounded-full border px-3 py-1">
                          <span>{sb.badge.icon}</span>
                          <span className="text-xs font-medium">{sb.badge.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
