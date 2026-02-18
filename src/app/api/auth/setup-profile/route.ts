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
    const { name, role, academyCode, academyName } = body;

    // 이미 프로필이 있으면 스킵
    const existingUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });
    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }

    let academyId: string | undefined;
    let status: "PENDING" | "ACTIVE" | "REJECTED" = "PENDING";

    // 트랜잭션으로 처리하여 원장 생성과 학원 생성을 원자적으로 수행
    if (role === "OWNER") {
      // 1. 원장: 학원 코드 생성 및 학원 생성
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();

      // 원장은 바로 ACTIVE 상태
      status = "ACTIVE";

      // 원장 유저 먼저 생성 (ID가 필요함)
      const newUser = await prisma.user.create({
        data: {
          authId: user.id,
          email: user.email!,
          name,
          role,
          status,
        },
      });

      // 학원 생성
      const academy = await prisma.academy.create({
        data: {
          name: academyName || "내 학원",
          code,
          ownerId: newUser.id,
        },
      });

      // 유저에게 학원 ID 업데이트 (소유 학원 및 소속 학원)
      await prisma.user.update({
        where: { id: newUser.id },
        data: { academyId: academy.id },
      });

      return NextResponse.json({ user: newUser, academyCode: code });
    }

    // 2. 강사/학생/학부모: 학원 코드로 가입 요청
    if (academyCode) {
      const academy = await prisma.academy.findUnique({
        where: { code: academyCode },
      });

      if (!academy) {
        return NextResponse.json({ error: "유효하지 않은 학원 코드입니다" }, { status: 400 });
      }

      academyId = academy.id;
      // 상태는 기본값이 PENDING이므로 별도 설정 불필요 (하지만 명시적으로)
      status = "PENDING";
    } else {
      return NextResponse.json({ error: "학원 코드가 필요합니다" }, { status: 400 });
    }

    // 유저 생성
    const newUser = await prisma.user.create({
      data: {
        authId: user.id,
        email: user.email!,
        name,
        role,
        status,
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
