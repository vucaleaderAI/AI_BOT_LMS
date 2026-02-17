import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 코딩 튜터 - 학원 맞춤 AI 학습 관리 시스템",
  description:
    "AI 기반 소크라테스식 코딩 튜터로 학생 이탈을 방지하고, 학부모에게 주간 AI 리포트를 제공하는 학원 전용 LMS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
