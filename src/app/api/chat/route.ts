import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/ai/claude-client";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/ai/prompts/tutor";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return new Response("User not found", { status: 404 });
    }

    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string") {
      return new Response("Message is required", { status: 400 });
    }

    // 세션 가져오거나 새로 생성
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: dbUser.id },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: dbUser.id,
          title: message.substring(0, 50),
        },
        include: { messages: true },
      });
    }

    // 유저 메시지 저장
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message,
      },
    });

    // 대화 기록 구성
    const history = session.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    history.push({ role: "user", content: message });

    // Claude API 스트리밍 호출
    const stream = await anthropic.messages.stream({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: TUTOR_SYSTEM_PROMPT,
      messages: history,
    });

    // ReadableStream으로 변환
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }

          // 어시스턴트 메시지 저장
          const savedMessage = await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: "assistant",
              content: fullResponse,
            },
          });

          // 감정 분석 비동기 실행 (응답 블로킹하지 않음)
          analyzeEmotion(message, savedMessage.id).catch(console.error);

          // 세션 ID 전송
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, sessionId: session.id })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

async function analyzeEmotion(userMessage: string, messageId: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `다음 학생의 메시지를 분석하여 감정 상태를 JSON으로 반환하세요.

감정 유형: FRUSTRATED(좌절), CONFUSED(혼란), NEUTRAL(평범), INTERESTED(흥미), CONFIDENT(자신감), EXCITED(신남)

학생 메시지: "${userMessage}"

반드시 아래 JSON 형식으로만 응답하세요:
{"emotion": "EMOTION_TYPE", "confidence": 0.0~1.0, "reasoning": "판단 근거 한 줄"}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const parsed = JSON.parse(jsonMatch[0]);
    const validEmotions = ["FRUSTRATED", "CONFUSED", "NEUTRAL", "INTERESTED", "CONFIDENT", "EXCITED"];

    if (!validEmotions.includes(parsed.emotion)) return;

    await prisma.emotionAnalysis.create({
      data: {
        messageId,
        emotion: parsed.emotion,
        confidence: Math.min(1, Math.max(0, parsed.confidence)),
        reasoning: parsed.reasoning || null,
      },
    });
  } catch (error) {
    console.error("Emotion analysis error:", error);
  }
}
