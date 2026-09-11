import { describe, it, expect } from "vitest";
import { draftBrief, OBJECTIVES } from "./brief";
import { CREATORS } from "./creators";

const devtools = CREATORS.filter((c) => c.verticals[0] === "DevTools").slice(0, 2);
const hrtech = CREATORS.filter((c) => c.verticals[0] === "HR-Tech").slice(0, 2);

const base = { company: "Northwind", product: "Northwind Pipelines" } as const;

describe("brief drafting", () => {
  it("produces all three sections, non-empty", () => {
    const b = draftBrief({ ...base, objective: "trials", creators: devtools });
    expect(b.objectives.trim()).not.toBe("");
    expect(b.keyMessages.trim()).not.toBe("");
    expect(b.guidelines.trim()).not.toBe("");
  });

  it("adapts to the creators booked, not just the form inputs", () => {
    // This is the whole claim: booking devtools creators must not produce the
    // same brief as booking HR-tech creators.
    const a = draftBrief({ ...base, objective: "trials", creators: devtools });
    const b = draftBrief({ ...base, objective: "trials", creators: hrtech });
    expect(a.objectives).not.toBe(b.objectives);
    expect(a.keyMessages).not.toBe(b.keyMessages);
  });

  it("names the product and the company in the output", () => {
    const b = draftBrief({ ...base, objective: "trials", creators: devtools });
    expect(b.objectives).toContain("Northwind Pipelines");
    expect(b.guidelines).toContain("Northwind");
  });

  it("changes the ask when the objective changes", () => {
    const trials = draftBrief({ ...base, objective: "trials", creators: devtools });
    const demos = draftBrief({ ...base, objective: "demos", creators: devtools });
    expect(trials.objectives).not.toBe(demos.objectives);
  });

  it("handles every objective without throwing", () => {
    for (const o of OBJECTIVES) {
      expect(() =>
        draftBrief({ ...base, objective: o.id, creators: devtools })
      ).not.toThrow();
    }
  });

  it("always tells the creator to disclose the partnership", () => {
    for (const set of [devtools, hrtech, CREATORS.slice(0, 5)]) {
      const b = draftBrief({ ...base, objective: "trials", creators: set });
      expect(b.guidelines.toLowerCase()).toContain("disclose");
    }
  });

  it("survives a single creator and a large booking", () => {
    expect(() =>
      draftBrief({ ...base, objective: "trials", creators: [CREATORS[0]] })
    ).not.toThrow();
    expect(() =>
      draftBrief({ ...base, objective: "trials", creators: CREATORS })
    ).not.toThrow();
  });
});
