import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  if (!dbUser) {
    redirect("/complete-profile");
  }

  // 승인 대기 또는 거절 상태 처리
  if (dbUser.role !== "OWNER") {
    if (dbUser.status === "PENDING") {
      redirect("/pending");
    }
    if (dbUser.status === "REJECTED") {
      redirect("/rejected");
    }
  }

  // 역할별 리다이렉트
  switch (dbUser.role) {
    case "OWNER":
      redirect("/owner");
    case "INSTRUCTOR":
      redirect("/instructor");
    case "STUDENT":
      redirect("/student");
    case "PARENT":
      redirect("/parent");
    default:
      redirect("/login");
  }
}
