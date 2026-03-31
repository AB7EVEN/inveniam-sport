import { z } from "zod";

export const authPayloadSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72)
});

export type AuthPayload = z.infer<typeof authPayloadSchema>;

export async function parseAuthPayload(request: Request) {
  const body = await request.json().catch(() => null);

  return authPayloadSchema.safeParse(body);
}

