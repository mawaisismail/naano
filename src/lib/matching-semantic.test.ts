import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The semantic ranking, with the model replaced by a stub.
 *
 * What is worth testing here is not whether bge-base is any good — that is the
 * provider's problem — but the parts this code owns: that the order follows
 * the similarity, that the displayed percentage is a transform of the real
 * measurement rather than a decoration, that the named reasons agree with the
 * count beside them, and above all that an unavailable model produces a
 * ranking instead of an exception.
 */

// vi.mock is hoisted above every const in the file, so the stub has to be
// created inside vi.hoisted to exist by the time the factory runs.
const { embedCached } = vi.hoisted(() => ({ embedCached: vi.fn() }));
vi.mock("@/lib/ai/embeddings-cache", () => ({ embedCached }));

import { CREATORS } from "@/lib/creators";
import { rankCreatorsSemantic } from "@/lib/matching";

const ICPS = ["RevOps leaders — own the CRM", "Sales leaders — carry a number"];

/**
 * Vectors on a circle: the angle IS the similarity, so a test can say "this
 * creator is closer to that ICP" without inventing 768 numbers.
 */
const at = (degrees: number) => {
  const r = (degrees * Math.PI) / 180;
  return [Math.cos(r), Math.sin(r)];
};

beforeEach(() => embedCached.mockClear());

describe("rankCreatorsSemantic", () => {
  it("orders by similarity to the nearest ICP", async () => {
    // Both ICPs at 0°; the first creator sits on top of them, the rest further away.
    // The call is always [...icps, ...creators] in that order, so the stub can
    // be built from the two lengths rather than from the argument.
    embedCached.mockResolvedValue([
      ...ICPS.map(() => at(0)),
      ...CREATORS.map((_, i) => at(i * 5)),
    ]);

    const { matches, method } = await rankCreatorsSemantic({ icps: ICPS, valueProp: null }, 5);
    expect(method).toBe("embeddings");
    expect(matches[0].creator.id).toBe(CREATORS[0].id);
    expect(matches.map((m) => m.score)).toEqual([...matches.map((m) => m.score)].sort((a, b) => b - a));
  });

  it("keeps the score inside a range a person can read", async () => {
    embedCached.mockResolvedValue([...ICPS, ...CREATORS].map(() => at(0)));
    const { matches } = await rankCreatorsSemantic({ icps: ICPS, valueProp: null });
    for (const m of matches) {
      expect(m.score).toBeGreaterThanOrEqual(55);
      expect(m.score).toBeLessThanOrEqual(99);
    }
  });

  it("never counts more matched ICPs than it can name", async () => {
    embedCached.mockResolvedValue([...ICPS, ...CREATORS].map(() => at(0)));
    const { matches } = await rankCreatorsSemantic({ icps: ICPS, valueProp: null });
    for (const m of matches) {
      expect(m.matched).toBeLessThanOrEqual(m.total);
      if (m.matched > 0) expect(m.reasons.length).toBe(m.matched);
    }
  });

  it("falls back to the lexical ranking when the model is unavailable", async () => {
    embedCached.mockResolvedValue(null);
    const { matches, method } = await rankCreatorsSemantic({ icps: ICPS, valueProp: null }, 3);
    expect(method).toBe("lexical");
    expect(matches).toHaveLength(3);
  });

  it("does not call the model when there are no ICPs to compare against", async () => {
    const { method } = await rankCreatorsSemantic({ icps: [], valueProp: null }, 3);
    expect(method).toBe("lexical");
    expect(embedCached).not.toHaveBeenCalled();
  });
});
