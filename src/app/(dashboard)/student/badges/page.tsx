import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentBadgesPage() {
  const user = await requireUser(["STUDENT"]);

  const [earnedBadges, allBadges] = await Promise.all([
    prisma.studentBadge.findMany({
      where: { studentId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.badge.findMany(),
  ]);

  const earnedIds = new Set(earnedBadges.map((eb) => eb.badgeId));

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">내 뱃지</h1>
          <p className="text-muted-foreground">
            획득한 뱃지 {earnedBadges.length}개 / 전체 {allBadges.length}개
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">획득한 뱃지</CardTitle>
          </CardHeader>
          <CardContent>
            {earnedBadges.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 획득한 뱃지가 없습니다. AI 튜터와 대화해보세요!</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {earnedBadges.map((sb) => (
                  <div key={sb.id} className="flex flex-col items-center rounded-xl border bg-white p-4 text-center shadow-sm">
                    <span className="text-4xl">{sb.badge.icon}</span>
                    <span className="mt-2 text-sm font-semibold">{sb.badge.name}</span>
                    <span className="mt-1 text-xs text-muted-foreground">{sb.badge.description}</span>
                    <span className="mt-2 text-xs text-muted-foreground">
                      {new Date(sb.earnedAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">아직 못 얻은 뱃지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {allBadges
                .filter((b) => !earnedIds.has(b.id))
                .map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center rounded-xl border bg-slate-50 p-4 text-center opacity-50">
                    <span className="text-4xl grayscale">{badge.icon}</span>
                    <span className="mt-2 text-sm font-semibold">{badge.name}</span>
                    <span className="mt-1 text-xs text-muted-foreground">{badge.description}</span>
                    <span className="mt-2 text-xs text-primary">???</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
