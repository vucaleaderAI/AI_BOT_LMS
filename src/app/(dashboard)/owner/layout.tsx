import { requireUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["OWNER"]);

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
