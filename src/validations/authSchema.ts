import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please provide a valid administrative email"),
  password: z
    .string()
    .min(1, "Security password is required")
    .min(6, "Password must contain at least 6 characters"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
