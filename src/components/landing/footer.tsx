import Link from "next/link";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">AI 코딩튜터</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">기능</a>
            <a href="#pricing" className="hover:text-foreground">가격</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <Link href="/login" className="hover:text-foreground">로그인</Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; 2026 AI 코딩튜터. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
