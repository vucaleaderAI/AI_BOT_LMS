import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "무료체험",
    price: "0",
    period: "14일간",
    description: "AI 코딩 튜터를 먼저 체험해보세요",
    features: [
      "학생 5명까지",
      "AI 튜터 채팅 (일 50회)",
      "기본 감정 분석",
      "학생 대시보드",
    ],
    cta: "무료 시작하기",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "베이직",
    price: "9.9",
    period: "만원/월",
    description: "소규모 학원에 딱 맞는 플랜",
    features: [
      "학생 30명까지",
      "AI 튜터 채팅 (무제한)",
      "실시간 감정 분석",
      "강사 대시보드",
      "학부모 주간 리포트",
      "이메일 알림",
    ],
    cta: "베이직 시작하기",
    href: "/signup?plan=basic",
    highlighted: true,
  },
  {
    name: "프로",
    price: "29.9",
    period: "만원/월",
    description: "성장하는 학원을 위한 프리미엄",
    features: [
      "학생 100명까지",
      "AI 튜터 채팅 (무제한)",
      "고급 감정 분석 + 트렌드",
      "원장 대시보드",
      "이탈 예측 시스템",
      "학부모 AI 리포트 (상세)",
      "실시간 알림 (카카오톡)",
      "우선 지원",
    ],
    cta: "프로 시작하기",
    href: "/signup?plan=pro",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            합리적인 가격,
            <br />
            확실한 효과
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            학생 이탈 1명만 방지해도 월 구독료의 수 배를 절약합니다
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-primary/[0.02] shadow-lg ring-1 ring-primary"
                  : "bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                  가장 인기
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
