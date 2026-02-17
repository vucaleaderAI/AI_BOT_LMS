"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "AI 튜터가 정말 답을 안 알려주나요?",
    answer:
      "네, 소크라테스식 교수법을 기반으로 합니다. 직접적인 답 대신 힌트와 유도 질문을 통해 학생이 스스로 문제를 해결하도록 도와줍니다. 이 방법이 실제로 더 깊은 이해와 장기 기억에 효과적입니다.",
  },
  {
    question: "감정 분석은 어떻게 이루어지나요?",
    answer:
      "학생이 AI 튜터와 대화할 때, 메시지의 맥락과 어조를 AI가 분석합니다. 좌절, 혼란, 흥미, 자신감 등 6가지 감정 상태를 실시간으로 파악하여 학습 경험을 최적화합니다.",
  },
  {
    question: "이탈 예측은 정확한가요?",
    answer:
      "학습 빈도, 감정 트렌드, 대화 패턴 등 다양한 데이터를 종합하여 이탈 위험도를 산출합니다. 100% 정확하지는 않지만, 위험 신호를 조기에 감지하여 선제 대응할 수 있도록 돕습니다.",
  },
  {
    question: "학부모도 사용할 수 있나요?",
    answer:
      "물론입니다! 학부모 전용 대시보드에서 자녀의 학습 진도, 감정 트렌드, AI가 작성한 주간 리포트를 확인할 수 있습니다. 코딩을 모르는 학부모도 쉽게 이해할 수 있는 형태로 제공됩니다.",
  },
  {
    question: "어떤 프로그래밍 언어를 지원하나요?",
    answer:
      "Python, JavaScript, Scratch 등 K-12 코딩 교육에서 주로 사용하는 언어를 모두 지원합니다. AI 튜터는 학생의 수준에 맞춰 설명 방식을 자동으로 조절합니다.",
  },
  {
    question: "데이터 보안은 어떻게 되나요?",
    answer:
      "모든 데이터는 암호화되어 저장되며, 학원별로 완전히 격리됩니다. 대화 내용은 교육 목적으로만 사용되며, 외부에 공유되지 않습니다. GDPR 및 개인정보보호법을 준수합니다.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            자주 묻는 질문
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            궁금한 점이 있으시면 언제든 문의해주세요
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border bg-white"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-sm font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="border-t px-6 py-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
