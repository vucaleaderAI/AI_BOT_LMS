import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  userName: string;
  academyName?: string;
}

export function DashboardLayout({
  children,
  role,
  userName,
  academyName,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} userName={userName} academyName={academyName} />
      <main className="pt-14 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
