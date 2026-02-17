import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (typeof window !== "undefined") {
      console.error("Supabase 환경 변수가 누락되었습니다. .env.local을 확인하고 서버를 재시작해주세요.");
    }
  }

  return createBrowserClient(
    supabaseUrl || "",
    supabaseKey || ""
  );
}
