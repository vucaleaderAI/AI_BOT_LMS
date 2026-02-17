import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingDown, MessageSquare } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* 배경 그라데이션 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-purple-100/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* 뱃지 */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-sm font-medium shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 기반 코딩 학원 관리 시스템
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            학생이 포기하기 전에
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI가 먼저 알아챕니다
            </span>
          </h1>

          {/* 서브 헤드라인 */}
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
            소크라테스식 AI 튜터가 학생의 감정을 실시간 분석하고,
            <br className="hidden sm:block" />
            이탈 위험을 예측하여 학원 매출을 지켜드립니다.
          </p>

          {/* CTA 버튼 */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="xl" asChild>
              <Link href="/signup">
                무료로 시작하기
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="#how-it-works">데모 보기</Link>
            </Button>
          </div>

          {/* 신뢰 지표 */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              AI 1:1 맞춤 튜터링
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              이탈률 30% 감소 목표
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              학부모 주간 AI 리포트
            </div>
          </div>
        </div>

        {/* 데모 스크린샷 플레이스홀더 */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-50 to-white shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-muted-foreground">AI 코딩 튜터 - 대시보드</span>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              {/* 챗봇 미리보기 */}
              <div className="col-span-2 rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm font-semibold text-muted-foreground">AI 튜터 대화</div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">AI</div>
                    <div className="rounded-xl rounded-tl-none bg-slate-50 px-4 py-2.5 text-sm">
                      안녕! for 반복문에서 어떤 부분이 헷갈려? 한번 같이 살펴보자 🤔
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <div className="rounded-xl rounded-tr-none bg-primary px-4 py-2.5 text-sm text-white">
                      range() 함수가 잘 이해가 안 돼요...
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">AI</div>
                    <div className="rounded-xl rounded-tl-none bg-slate-50 px-4 py-2.5 text-sm">
                      좋은 질문이야! range(5)를 실행하면 어떤 숫자들이 나올 것 같아?
                    </div>
                  </div>
                </div>
              </div>
              {/* 감정 분석 미리보기 */}
              <div className="space-y-4">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="mb-2 text-sm font-semibold text-muted-foreground">감정 분석</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🤔</span>
                    <div>
                      <div className="text-sm font-medium">혼란</div>
                      <div className="text-xs text-muted-foreground">신뢰도 85%</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="mb-2 text-sm font-semibold text-muted-foreground">학습 진도</div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>파이썬 기초</span>
                    <span className="font-medium text-primary">64%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[64%] rounded-full bg-primary" />
                  </div>
                </div>
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="mb-2 text-sm font-semibold text-muted-foreground">획득 뱃지</div>
                  <div className="flex gap-2 text-2xl">
                    <span title="첫 대화">💬</span>
                    <span title="연속 3일">🔥</span>
                    <span title="문제 해결">⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
