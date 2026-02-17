import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export const signupSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  role: z.enum(["OWNER", "INSTRUCTOR", "STUDENT", "PARENT"]),
  inviteCode: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
