import { describe, expect, it } from "vitest";
import { signHmacSha256, verifyHmacSha256 } from "./crypto";

describe("OPEN DOOR HMAC", () => {
  it("verifies the exact raw request body", async () => {
    const secret = "test-secret-with-at-least-24-characters";
    const body = '{"event":"access_card.published","schemaVersion":1}';
    const signature = await signHmacSha256(body, secret);
    await expect(
      verifyHmacSha256(body, `sha256=${signature}`, secret)
    ).resolves.toBe(true);
    await expect(
      verifyHmacSha256(`${body}\n`, `sha256=${signature}`, secret)
    ).resolves.toBe(false);
  });

  it("rejects malformed or short-secret signatures", async () => {
    await expect(verifyHmacSha256("{}", "sha256=abc", "short")).resolves.toBe(false);
  });
});

