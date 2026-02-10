import { describe, it, expect } from "vitest";
import { hashToken, compareToken } from "./token-hash";

describe("token-hash", () => {
  it("hashes a token and verifies it", async () => {
    const token = "my-secret-token";
    const hash = await hashToken(token);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(token);

    const isMatch = await compareToken(token, hash);
    expect(isMatch).toBe(true);
  });

  it("returns false for incorrect token", async () => {
    const token = "my-secret-token";
    const hash = await hashToken(token);

    const isMatch = await compareToken("wrong-token", hash);
    expect(isMatch).toBe(false);
  });
});
