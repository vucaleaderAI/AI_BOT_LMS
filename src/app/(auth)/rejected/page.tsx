
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { XCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RejectedPage() {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">승인이 거절되었습니다</CardTitle>
                    <CardDescription>
                        학원 가입 요청이 거절되었습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg bg-slate-100 p-4">
                        <p className="text-sm text-muted-foreground">
                            학원 또는 관리자에게 문의해주세요.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
                            <LogOut className="mr-2 h-4 w-4" /> 로그아웃
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
