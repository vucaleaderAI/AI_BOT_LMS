import {
  MessageSquare,
  Brain,
  BarChart3,
  Shield,
  Users,
  FileText,
  TrendingUp,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "소크라테스식 AI 튜터",
    description:
      "답을 직접 알려주지 않고 힌트와 질문으로 학생이 스스로 사고하도록 유도합니다. 진짜 실력이 늡니다.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Brain,
    title: "실시간 감정 분석",
    description:
      "학생의 메시지를 AI가 분석하여 좌절, 혼란, 흥미, 자신감 등 감정 상태를 실시간으로 파악합니다.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "이탈 예측 시스템",
    description:
      "학습 패턴과 감정 데이터를 기반으로 이탈 위험 학생을 사전에 감지하여 선제 대응할 수 있습니다.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: FileText,
    title: "AI 주간 리포트",
    description:
      "학부모에게 매주 AI가 작성한 학습 요약 리포트를 자동 전송합니다. 신뢰도와 만족도가 높아집니다.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: BarChart3,
    title: "원장 대시보드",
    description:
      "전체 학원 현황, 매출 영향 분석, 강사별 성과, 감정 트렌드를 한눈에 파악할 수 있습니다.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Users,
    title: "학급 관리",
    description:
      "반별 학생 관리, 출석 현황, 학습 진도를 강사가 효율적으로 관리할 수 있습니다.",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: Shield,
    title: "역할 기반 접근 제어",
    description:
      "원장, 강사, 학생, 학부모 각 역할에 맞는 화면과 기능만 제공하여 보안을 유지합니다.",
    color: "bg-slate-100 text-slate-600",
  },
  {
    icon: Bell,
    title: "위험 알림 시스템",
    description:
      "학생의 감정 급변, 이탈 위험 감지 시 강사와 원장에게 즉시 알림을 보냅니다.",
    color: "bg-yellow-100 text-yellow-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            학원 운영의 모든 것을
            <br />
            AI가 함께합니다
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            단순 학습 관리를 넘어, 학생의 감정까지 케어하는 스마트 LMS
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-white p-6 transition-all hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
