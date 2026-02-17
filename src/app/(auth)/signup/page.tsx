"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const roles = [
  { value: "OWNER", label: "원장", description: "학원을 새로 등록합니다" },
  { value: "INSTRUCTOR", label: "강사", description: "초대코드로 학원에 합류합니다" },
  { value: "STUDENT", label: "학생", description: "초대코드로 학원에 합류합니다" },
  { value: "PARENT", label: "학부모", description: "초대코드로 학원에 합류합니다" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "STUDENT" as string,
    inviteCode: "",
    academyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const needsInviteCode = form.role !== "OWNER";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            role: form.role,
            invite_code: form.inviteCode || undefined,
            academy_name: form.academyName || undefined,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // 세션이 없으면 이메일 인증이 필요한 상태임
      if (!data.session) {
        setError("회원가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.");
        return;
      }

      // 회원가입 후 프로필 생성 API 호출
      const res = await fetch("/api/auth/setup-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          inviteCode: form.inviteCode || undefined,
          academyName: form.academyName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "프로필 생성에 실패했습니다.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>AI 코딩 튜터를 시작하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* 역할 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">역할 선택</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${form.role === role.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-slate-50"
                      }`}
                  >
                    <div className="font-medium">{role.label}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">이름</label>
              <Input
                id="name"
                placeholder="홍길동"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-medium">이메일</label>
              <Input
                id="signup-email"
                type="email"
                placeholder="example@academy.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="text-sm font-medium">비밀번호</label>
              <Input
                id="signup-password"
                type="password"
                placeholder="6자 이상"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {/* 원장: 학원명 입력 */}
            {form.role === "OWNER" && (
              <div className="space-y-2">
                <label htmlFor="academy-name" className="text-sm font-medium">학원명</label>
                <Input
                  id="academy-name"
                  placeholder="코딩학원"
                  value={form.academyName}
                  onChange={(e) => setForm({ ...form, academyName: e.target.value })}
                  required
                />
              </div>
            )}

            {/* 강사/학생/학부모: 초대코드 입력 */}
            {needsInviteCode && (
              <div className="space-y-2">
                <label htmlFor="invite-code" className="text-sm font-medium">초대코드</label>
                <Input
                  id="invite-code"
                  placeholder="원장님에게 받은 코드"
                  value={form.inviteCode}
                  onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              회원가입
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
