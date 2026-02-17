import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export default async function StudentHistoryPage() {
  const user = await requireUser(["STUDENT"]);

  const sessions = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">학습 기록</h1>
          <p className="text-muted-foreground">AI 튜터와의 대화 기록을 확인하세요</p>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">아직 대화 기록이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">{session.title || "대화"}</h3>
                      {session.messages[0] && (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {session.messages[0].content}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant="secondary">{session._count.messages}개 메시지</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.updatedAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
