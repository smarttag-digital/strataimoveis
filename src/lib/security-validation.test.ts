import { describe, expect, test } from "bun:test";
import { crmQuerySchema, imageFileKind, newLeadSchema, safeHttpsUrl } from "./security-validation";
describe("security boundaries", () => {
  test("rejects active-content tours and preserves HTTPS", () => {
    expect(safeHttpsUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpsUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeHttpsUrl("https://my.matterport.com/show/?m=example")).toBe("https://my.matterport.com/show/?m=example");
  });
  test("validates email and lead name bounds", () => {
    expect(newLeadSchema.safeParse({ name:"Cliente", email:"invalid" }).success).toBe(false);
    expect(newLeadSchema.safeParse({ name:"x".repeat(201) }).success).toBe(false);
    expect(newLeadSchema.safeParse({ name:"Cliente", email:"" }).success).toBe(true);
  });
  test("rejects invalid CRM dates and integer limits", () => {
    expect(crmQuerySchema.safeParse({ since:"' OR 1=1", limit:100 }).success).toBe(false);
    for (const limit of [-1,0,501,1.5]) expect(crmQuerySchema.safeParse({ since:null, limit }).success).toBe(false);
    expect(crmQuerySchema.safeParse({ since:"2026-11-02T14:45:00Z", limit:500 }).success).toBe(true);
  });
  test("rejects SVG and HTML image content", () => {
    expect(imageFileKind(new TextEncoder().encode("<svg onload='alert(1)'>"))).toBeNull();
    expect(imageFileKind(new TextEncoder().encode("<html>"))).toBeNull();
    expect(imageFileKind(new Uint8Array([137,80,78,71,13,10,26,10]))).toBe("png");
  });
});