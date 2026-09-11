import { describe, it, expect } from "vitest";
import { signSession, readSession } from "./auth";

describe("session cookie signing", () => {
  const id = "cmtui78pn0000pgyfveymoa5z";

  it("round-trips a real user id", () => {
    expect(readSession(signSession(id))).toBe(id);
  });

  it("REJECTS a bare user id with no signature", () => {
    // Without this, editing one cookie value in devtools reads any account.
    expect(readSession(id)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const [userId] = signSession(id).split(".");
    expect(readSession(`${userId}.deadbeef`)).toBeNull();
  });

  it("rejects a signature lifted from a different user", () => {
    const other = signSession("some-other-user-id").split(".")[1];
    expect(readSession(`${id}.${other}`)).toBeNull();
  });

  it("rejects empty, undefined and malformed cookies", () => {
    expect(readSession(undefined)).toBeNull();
    expect(readSession("")).toBeNull();
    expect(readSession(".")).toBeNull();
    expect(readSession("no-dot-at-all")).toBeNull();
  });

  it("handles ids containing dots by splitting on the last one", () => {
    const dotted = "user.with.dots";
    expect(readSession(signSession(dotted))).toBe(dotted);
  });
});
