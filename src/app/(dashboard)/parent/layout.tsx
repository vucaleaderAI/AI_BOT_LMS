import { requireUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["PARENT"]);

  return (
    <DashboardLayout
      role={user.role}
      userName={user.name}
      academyName={user.academy?.name}
    >
      {children}
    </DashboardLayout>
  );
}
