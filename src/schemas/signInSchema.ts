import { z } from "zod";

export const signInSchema = z.object({
  // identifier or email or username
  identifier: z.string(),
  password: z.string(),
});
