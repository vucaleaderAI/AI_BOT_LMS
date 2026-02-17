"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Bot, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatWindow() {
  const { messages, isLoading, sendMessage, resetChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border bg-white shadow-sm lg:h-[calc(100vh-6rem)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">AI 코딩 튜터</div>
            <div className="text-xs text-muted-foreground">소크라테스식 학습법</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={resetChat} title="새 대화">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">안녕하세요!</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              저는 AI 코딩 튜터입니다. 코딩에 대한 질문이 있으면 물어보세요!
              답을 직접 알려주지는 않지만, 스스로 답을 찾을 수 있도록 도와드릴게요.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Python for 반복문이 뭐예요?",
                "변수란 뭔가요?",
                "함수를 만드는 방법을 알려주세요",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border bg-slate-50 px-4 py-2 text-xs transition-colors hover:bg-slate-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
      </div>

      {/* 입력 */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
