"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  Users,
  BarChart3,
  FileText,
  Trophy,
  Settings,
  LogOut,
  Bell,
  UserCircle,
  GraduationCap,
  Menu,
  X,
  UserCheck,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<string, NavItem[]> = {
  STUDENT: [
    { label: "대시보드", href: "/student", icon: LayoutDashboard },
    { label: "AI 튜터", href: "/student/chat", icon: MessageSquare },
    { label: "내 뱃지", href: "/student/badges", icon: Trophy },
    { label: "학습 기록", href: "/student/history", icon: FileText },
  ],
  INSTRUCTOR: [
    { label: "대시보드", href: "/instructor", icon: LayoutDashboard },
    { label: "내 강좌", href: "/instructor/courses", icon: BookOpen },
    { label: "학급 관리", href: "/instructor/classes", icon: GraduationCap },
    { label: "학생 모니터링", href: "/instructor/students", icon: Users },
    { label: "알림", href: "/instructor/alerts", icon: Bell },
  ],
  OWNER: [
    { label: "대시보드", href: "/owner", icon: LayoutDashboard },
    { label: "과정 관리", href: "/owner/courses", icon: BookOpen },
    { label: "이탈 예측", href: "/owner/churn", icon: BarChart3 },
    { label: "강사 관리", href: "/owner/instructors", icon: Users },
    { label: "멤버 관리", href: "/owner/members", icon: UserCheck },
    { label: "초대코드", href: "/owner/invites", icon: Settings },
    { label: "분석", href: "/owner/analytics", icon: BarChart3 },
  ],
  PARENT: [
    { label: "대시보드", href: "/parent", icon: LayoutDashboard },
    { label: "주간 리포트", href: "/parent/reports", icon: FileText },
    { label: "자녀 현황", href: "/parent/children", icon: UserCircle },
  ],
};

interface SidebarProps {
  role: string;
  userName: string;
  academyName?: string;
}

export function Sidebar({ role, userName, academyName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = navByRole[role] || [];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      {/* 로고 */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">AI 코딩튜터</div>
          {academyName && (
            <div className="truncate text-xs text-muted-foreground">{academyName}</div>
          )}
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 유저 정보 + 로그아웃 */}
      <div className="border-t p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{userName}</div>
            <div className="text-xs text-muted-foreground">
              {role === "OWNER" ? "원장" : role === "INSTRUCTOR" ? "강사" : role === "STUDENT" ? "학생" : "학부모"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          로그아웃
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 모바일 토글 */}
      <div className="fixed top-0 z-40 flex h-14 w-full items-center border-b bg-white px-4 lg:hidden">
        <button onClick={() => setMobileOpen(true)} aria-label="메뉴 열기">
          <Menu className="h-6 w-6" />
        </button>
        <span className="ml-3 font-semibold">AI 코딩튜터</span>
      </div>

      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-64 flex-col bg-white">
            <button
              className="absolute right-3 top-4"
              onClick={() => setMobileOpen(false)}
              aria-label="메뉴 닫기"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* 데스크톱 사이드바 */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-white lg:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
