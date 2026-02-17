import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-700 px-8 py-16 text-center text-white sm:px-16 sm:py-24">
          {/* 배경 장식 */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              지금 시작하면,
              <br />
              14일간 무료입니다
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
              카드 등록 없이 바로 시작하세요. AI 코딩 튜터가 학원의 경쟁력을 높여드립니다.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="xl"
                className="bg-white text-primary hover:bg-blue-50"
                asChild
              >
                <Link href="/signup">
                  무료 체험 시작하기
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
