
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Check, X, Loader2 } from "lucide-react";

interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "PENDING" | "ACTIVE" | "REJECTED";
    createdAt: string;
}

export default function MemberApprovalPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    async function fetchMembers() {
        try {
            const response = await fetch("/api/academy/members");
            if (response.ok) {
                const data = await response.json();
                setMembers(data.members);
            } else {
                console.error("Failed to fetch members");
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAction(userId: string, action: "APPROVE" | "REJECT") {
        try {
            const response = await fetch("/api/academy/members/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action }),
            });

            if (response.ok) {
                setMembers((prev) =>
                    prev.map((m) =>
                        m.id === userId
                            ? { ...m, status: action === "APPROVE" ? "ACTIVE" : "REJECTED" }
                            : m
                    )
                );
                alert(action === "APPROVE" ? "승인 완료되었습니다." : "거절 완료되었습니다.");
            } else {
                alert("요청을 처리하는 중 오류가 발생했습니다.");
            }
        } catch (error) {
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    }

    const pendingMembers = members.filter((m) => m.status === "PENDING");
    const activeMembers = members.filter((m) => m.status === "ACTIVE");
    const rejectedMembers = members.filter((m) => m.status === "REJECTED");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">멤버 관리</h1>
                <p className="text-muted-foreground">학원 멤버 가입 승인 및 관리</p>
            </div>

            {/* 승인 대기 목록 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-yellow-600" />
                        승인 대기 ({pendingMembers.length})
                    </CardTitle>
                    <CardDescription>가입 승인을 기다리는 사용자입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">승인 대기 중인 사용자가 없습니다.</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                        <Badge variant="outline">{member.role === 'INSTRUCTOR' ? '강사' : member.role === 'STUDENT' ? '학생' : '학부모'}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleAction(member.id, "APPROVE")}
                                        >
                                            <Check className="mr-1 h-4 w-4" /> 승인
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleAction(member.id, "REJECT")}
                                        >
                                            <X className="mr-1 h-4 w-4" /> 거절
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 활성 멤버 목록 */}
            <Card>
                <CardHeader>
                    <CardTitle>활성 멤버 ({activeMembers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {activeMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">멤버가 없습니다.</p>
                    ) : (
                        <div className="rounded-md border">
                            <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b bg-muted/50 text-sm">
                                <div>이름</div>
                                <div>이메일</div>
                                <div>역할</div>
                                <div>가입일</div>
                            </div>
                            {activeMembers.map((member) => (
                                <div key={member.id} className="grid grid-cols-4 gap-4 p-4 text-sm border-b last:border-0 items-center">
                                    <div>{member.name}</div>
                                    <div className="truncate">{member.email}</div>
                                    <div>
                                        <Badge variant="outline" className="bg-slate-50">
                                            {member.role === 'INSTRUCTOR' ? '강사' : member.role === 'STUDENT' ? '학생' : '학부모'}
                                        </Badge>
                                    </div>
                                    <div className="text-muted-foreground">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 거절된 멤버 목록 (Optional, maybe hidden or collapsed) */}
            {rejectedMembers.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>거절됨 ({rejectedMembers.length})</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {rejectedMembers.map(m => (
                                <div key={m.id} className="flex justify-between p-2 border rounded bg-slate-50 text-slate-500">
                                    <span>{m.name} ({m.email})</span>
                                    <span className="text-xs">거절됨</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
