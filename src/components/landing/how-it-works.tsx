import { UserPlus, MessageCircle, BarChart2, FileCheck } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "학원 등록",
    description: "원장님이 학원을 등록하고, 초대코드를 생성하여 강사/학생/학부모를 초대합니다.",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "AI 튜터와 학습",
    description: "학생이 AI 코딩 튜터와 1:1 대화하며 학습합니다. 답을 알려주지 않고 스스로 생각하도록 유도합니다.",
  },
  {
    step: "03",
    icon: BarChart2,
    title: "실시간 감정 분석",
    description: "AI가 대화 중 학생의 감정을 분석합니다. 좌절감이 감지되면 강사에게 즉시 알림을 보냅니다.",
  },
  {
    step: "04",
    icon: FileCheck,
    title: "리포트 & 이탈 예측",
    description: "학부모에게 주간 AI 리포트가 자동 전송되고, 원장은 이탈 위험 학생을 사전에 파악합니다.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            이렇게 작동합니다
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            가입부터 리포트까지, 4단계로 완성되는 AI 학습 관리
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* 연결선 */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/30 to-transparent lg:block" />
              )}
              <div className="relative rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary/20">
                    {item.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
