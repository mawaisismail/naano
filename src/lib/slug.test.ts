import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Priya Raman")).toBe("priya-raman");
  });

  it("strips accents rather than dropping the letter", () => {
    expect(slugify("Léa Vasseur")).toBe("lea-vasseur");
    expect(slugify("Mikkel Sørensen")).toContain("mikkel");
  });

  it("collapses punctuation and runs of separators", () => {
    expect(slugify("Anne-Marie  O'Brien!!")).toBe("anne-marie-o-brien");
  });

  it("never returns an empty slug", () => {
    // An empty slug would produce /creators/ and a broken profile URL.
    expect(slugify("###")).toBe("creator");
    expect(slugify("")).toBe("creator");
    expect(slugify("   ")).toBe("creator");
  });

  it("does not start or end with a hyphen", () => {
    const s = slugify("  -Hello-  ");
    expect(s.startsWith("-")).toBe(false);
    expect(s.endsWith("-")).toBe(false);
  });
});
