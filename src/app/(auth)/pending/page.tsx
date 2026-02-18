
"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function PendingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const academyCode = searchParams.get("code");

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl">승인 대기 중</CardTitle>
                    <CardDescription>
                        학원 원장님의 가입 승인을 기다리고 있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg bg-slate-100 p-4">
                        <p className="text-sm text-muted-foreground mb-1">신청한 학원 정보</p>
                        {academyCode && (
                            <p className="font-semibold text-lg text-primary">학원 코드: {academyCode}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            승인이 완료되면 자동으로 대시보드로 이동할 수 있습니다.
                            <br />
                            오래 걸릴 경우 학원에 문의해주세요.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            상태 확인하기 (새로고침)
                        </Button>
                        <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
                            <LogOut className="mr-2 h-4 w-4" /> 로그아웃
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PendingApproval() {
    return (
        <Suspense>
            <PendingContent />
        </Suspense>
    );
}
