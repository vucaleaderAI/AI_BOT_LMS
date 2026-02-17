import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={cn("flex gap-3", !isAssistant && "justify-end")}>
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isAssistant
            ? "rounded-tl-none bg-slate-100 text-foreground"
            : "rounded-tr-none bg-primary text-white"
        )}
      >
        {content ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-40" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-40" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current opacity-40" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
