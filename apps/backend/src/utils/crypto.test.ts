import { describe, it, expect, beforeEach, vi } from "vitest";
import { encrypt, decrypt } from "./crypto.js";

describe("Crypto Utils", () => {
  const TEST_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 64 hex chars = 32 bytes

  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
  });

  it("should encrypt and decrypt correctly", () => {
    const text = "Hello, world!";
    const encrypted = encrypt(text);
    expect(encrypted).not.toBe(text);
    expect(encrypted).toContain(":");

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it("should return original text if decryption fails", () => {
    const text = "not-encrypted-text";
    const decrypted = decrypt(text);
    expect(decrypted).toBe(text);
  });

  it("should return original text if IV is missing", () => {
    const text = "noiv:some-data";
    // This will likely fail to decrypt and return original text because of the catch block
    const decrypted = decrypt(text);
    expect(decrypted).toBe(text);
  });

  it("should throw error if ENCRYPTION_KEY is missing during encryption", () => {
    vi.stubEnv("ENCRYPTION_KEY", "");
    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY environment variable is missing.");
  });
});
