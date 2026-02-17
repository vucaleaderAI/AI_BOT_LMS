import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default async function OwnerInstructorsPage() {
  const user = await requireUser(["OWNER"]);

  if (!user.academyId) {
    return <p>학원 정보가 없습니다.</p>;
  }

  const instructors = await prisma.user.findMany({
    where: { academyId: user.academyId, role: "INSTRUCTOR" },
    include: {
      instructorOf: {
        include: { _count: { select: { enrollments: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">강사 관리</h1>
        <p className="text-muted-foreground">학원 소속 강사를 관리합니다</p>
      </div>

      {instructors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">등록된 강사가 없습니다. 초대코드를 생성하여 강사를 초대하세요.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {instructors.map((instructor) => {
            const totalStudents = instructor.instructorOf.reduce(
              (sum, cls) => sum + cls._count.enrollments,
              0
            );
            return (
              <Card key={instructor.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {instructor.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{instructor.name}</h3>
                      <p className="text-xs text-muted-foreground">{instructor.email}</p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary">{instructor.instructorOf.length}개 수업</Badge>
                        <Badge variant="secondary">{totalStudents}명 학생</Badge>
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
  );
}
