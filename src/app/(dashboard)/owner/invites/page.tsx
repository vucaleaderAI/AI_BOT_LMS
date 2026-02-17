"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Loader2 } from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  role: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

const roleLabel: Record<string, string> = {
  INSTRUCTOR: "강사",
  STUDENT: "학생",
  PARENT: "학부모",
};

export default function OwnerInvitesPage() {
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  async function fetchInvites() {
    try {
      const res = await fetch("/api/invites");
      const data = await res.json();
      setInvites(data.invites || []);
    } finally {
      setLoading(false);
    }
  }

  async function createInvite(role: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, maxUses: 20, expiresInDays: 30 }),
      });
      if (res.ok) {
        await fetchInvites();
      }
    } finally {
      setCreating(false);
    }
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">초대코드 관리</h1>
        <p className="text-muted-foreground">강사, 학생, 학부모를 학원에 초대하세요</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["INSTRUCTOR", "STUDENT", "PARENT"] as const).map((role) => (
          <Button
            key={role}
            variant="outline"
            onClick={() => createInvite(role)}
            disabled={creating}
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {roleLabel[role]} 초대코드 생성
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">초대코드 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 초대코드가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <code className="rounded bg-slate-100 px-2 py-1 text-sm font-mono font-bold">
                      {invite.code}
                    </code>
                    <Badge variant="secondary">{roleLabel[invite.role]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {invite.usedCount}/{invite.maxUses} 사용
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(invite.code, invite.id)}
                  >
                    <Copy className="h-4 w-4" />
                    {copiedId === invite.id ? "복사됨!" : "복사"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
