"use client";

import { useState, useEffect } from "react";
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

export default function CompleteProfilePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        role: "STUDENT" as string,
        inviteCode: "",
        academyName: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login"); // 세션이 없으면 로그인 페이지로
            } else {
                setPageLoading(false);
            }
        }
        checkSession();
    }, [router]);

    const needsInviteCode = form.role !== "OWNER";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/setup-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    role: form.role,
                    academyCode: form.inviteCode || undefined,
                    academyName: form.academyName || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "프로필 생성에 실패했습니다.");
                return;
            }

            // 성공 시 대시보드로 이동 (미들웨어가 역할에 맞게 리다이렉트 해줄 것임)
            router.push("/dashboard");
            router.refresh();
        } catch {
            setError("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    }

    if (pageLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">프로필 완성하기</CardTitle>
                    <CardDescription>서비스 이용을 위해 추가 정보를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        {/* 강사/학생/학부모: 학원 코드 입력 */}
                        {needsInviteCode && (
                            <div className="space-y-2">
                                <label htmlFor="invite-code" className="text-sm font-medium">학원 코드</label>
                                <Input
                                    id="invite-code"
                                    placeholder="원장님에게 받은 8자리 코드"
                                    value={form.inviteCode}
                                    onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    * 학원 코드를 모르면 가입할 수 없습니다.
                                </p>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            시작하기
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
