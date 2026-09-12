import { describe, it, expect } from "vitest";
import {
  isProtectedPath,
  isAuthEntryPath,
  homeForRole,
  PROTECTED_PREFIXES,
} from "./routes";

/**
 * This module decides what the proxy protects, so a mistake here is a hole in
 * the authentication boundary rather than a cosmetic bug. The prefix-matching
 * cases below are the ones that actually go wrong in practice.
 */
describe("which paths sit behind a session", () => {
  it("protects the section roots", () => {
    expect(isProtectedPath("/app")).toBe(true);
    expect(isProtectedPath("/studio")).toBe(true);
    expect(isProtectedPath("/creator")).toBe(true);
  });

  it("protects everything nested under them", () => {
    expect(isProtectedPath("/app/campaigns/new")).toBe(true);
    expect(isProtectedPath("/studio/onboarding")).toBe(true);
    expect(isProtectedPath("/creator/analytics")).toBe(true);
  });

  it("leaves the public site alone", () => {
    // "/creators" is the public marketing page; "/creator" is the workspace.
    // One character apart, opposite sides of the auth boundary.
    for (const p of ["/", "/creators", "/creators/x", "/blog/x", "/free-tools", "/marketplace"]) {
      expect(isProtectedPath(p)).toBe(false);
    }
  });

  it("does not protect a path that merely starts with the same letters", () => {
    // The bug this guards: startsWith("/app") also matches "/apply" and
    // "/approach", which would redirect real public pages to the login screen.
    expect(isProtectedPath("/apply")).toBe(false);
    expect(isProtectedPath("/approach")).toBe(false);
    expect(isProtectedPath("/studio-tour")).toBe(false);
  });

  it("keeps the proxy matcher and this list in step", () => {
    // If a prefix is added here it must also be added to the matcher in
    // proxy.ts, or the gate silently stops covering it.
    expect([...PROTECTED_PREFIXES]).toEqual(["/app", "/studio", "/creator"]);
  });
});

describe("the sign-in entry points", () => {
  it("recognises the sign-in page", () => {
    expect(isAuthEntryPath("/login")).toBe(true);
  });

  it("leaves /register alone, because the creator wizard lives there", () => {
    // Bouncing a signed-in creator off /register loops: /register -> /creator
    // -> (not onboarded) -> /register.
    expect(isAuthEntryPath("/register")).toBe(false);
  });

  it("is not fooled by a lookalike", () => {
    expect(isAuthEntryPath("/logout-help")).toBe(false);
  });
});

describe("where a role lands", () => {
  it("sends creators to the studio and everyone else to the brand app", () => {
    expect(homeForRole("creator")).toBe("/studio");
    expect(homeForRole("brand")).toBe("/app");
  });
});
