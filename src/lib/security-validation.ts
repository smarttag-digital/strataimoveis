import { z } from "zod";

export function safeHttpsUrl(input: unknown): string | null {
  if (typeof input !== "string" || input.length > 4096) return null;
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export const newLeadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(40).optional(),
  email: z.union([z.string().trim().email().max(320), z.literal("")]).optional(),
  message: z.string().trim().max(4000).optional(),
  property_interest: z.string().trim().max(200).optional(),
  source: z.string().trim().max(60).optional(),
});
export const crmQuerySchema = z.object({
  since: z.string().datetime({ offset: true }).nullable(),
  limit: z.coerce.number().int().min(1).max(500),
});
export function imageFileKind(bytes: Uint8Array): "jpg" | "png" | "webp" | "gif" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if ([137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b)) return "png";
  const text = new TextDecoder().decode(bytes);
  if (text.startsWith("RIFF") && text.slice(8,12) === "WEBP") return "webp";
  if (text.startsWith("GIF87a") || text.startsWith("GIF89a")) return "gif";
  return null;
}