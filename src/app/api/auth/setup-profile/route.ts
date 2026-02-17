import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, inviteCode, academyName } = body;

    // 이미 프로필이 있으면 스킵
    const existingUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });
    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }

    let academyId: string | undefined;

    if (role === "OWNER") {
      // 원장: 학원 생성
      const academy = await prisma.academy.create({
        data: { name: academyName || "내 학원" },
      });
      academyId = academy.id;
    } else if (inviteCode) {
      // 초대코드로 학원 연결
      const invite = await prisma.inviteCode.findUnique({
        where: { code: inviteCode },
      });

      if (!invite) {
        return NextResponse.json({ error: "유효하지 않은 초대코드입니다" }, { status: 400 });
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        return NextResponse.json({ error: "만료된 초대코드입니다" }, { status: 400 });
      }

      if (invite.usedCount >= invite.maxUses) {
        return NextResponse.json({ error: "사용 횟수가 초과된 초대코드입니다" }, { status: 400 });
      }

      if (invite.role !== role) {
        return NextResponse.json(
          { error: `이 초대코드는 ${invite.role} 역할 전용입니다` },
          { status: 400 }
        );
      }

      academyId = invite.academyId;

      // 사용 횟수 증가
      await prisma.inviteCode.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 유저 생성
    const newUser = await prisma.user.create({
      data: {
        authId: user.id,
        email: user.email!,
        name,
        role,
        academyId,
      },
    });

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error("Profile setup error:", error);
    return NextResponse.json(
      { error: "프로필 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
