import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("accepts the correct password", () => {
    expect(verifyPassword("demo1234", hashPassword("demo1234"))).toBe(true);
  });

  it("rejects a wrong password", () => {
    const h = hashPassword("demo1234");
    expect(verifyPassword("demo12345", h)).toBe(false);
    expect(verifyPassword("", h)).toBe(false);
    expect(verifyPassword("DEMO1234", h)).toBe(false);
  });

  it("salts, so the same password hashes differently every time", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("never stores the plaintext", () => {
    expect(hashPassword("hunter2")).not.toContain("hunter2");
  });

  it("returns false rather than throwing on a malformed stored value", () => {
    for (const bad of ["", "nope", "only-one-half:", ":", "a:b"]) {
      expect(() => verifyPassword("x", bad)).not.toThrow();
      expect(verifyPassword("x", bad)).toBe(false);
    }
  });
});
