import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createInviteSchema = z.object({
  role: z.enum(["INSTRUCTOR", "STUDENT", "PARENT"]),
  maxUses: z.number().min(1).max(100).default(10),
  expiresInDays: z.number().min(1).max(90).optional(),
});

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser || dbUser.role !== "OWNER" || !dbUser.academyId) {
      return NextResponse.json({ error: "원장만 초대코드를 생성할 수 있습니다" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createInviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
    }

    const { role, maxUses, expiresInDays } = parsed.data;

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const invite = await prisma.inviteCode.create({
      data: {
        code: generateCode(),
        role,
        maxUses,
        expiresAt,
        academyId: dbUser.academyId,
      },
    });

    return NextResponse.json({ invite });
  } catch (error) {
    console.error("Invite creation error:", error);
    return NextResponse.json({ error: "초대코드 생성 중 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser || dbUser.role !== "OWNER" || !dbUser.academyId) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
    }

    const invites = await prisma.inviteCode.findMany({
      where: { academyId: dbUser.academyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Invite list error:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
  }
}
