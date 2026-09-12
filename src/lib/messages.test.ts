import { describe, expect, it } from "vitest";
import { orderConversations } from "./messages";

const day = (n: number) => new Date(2026, 0, n);

describe("orderConversations", () => {
  it("puts a conversation with replies above a newer, silent booking", () => {
    const ordered = orderConversations([
      { id: "silent", createdAt: day(10), messages: [] },
      { id: "spoken", createdAt: day(1), messages: [{ createdAt: day(2) }] },
    ]);
    expect(ordered.map((d) => d.id)).toEqual(["spoken", "silent"]);
  });

  it("orders spoken threads by their newest reply", () => {
    const ordered = orderConversations([
      { id: "old", createdAt: day(1), messages: [{ createdAt: day(3) }] },
      { id: "new", createdAt: day(1), messages: [{ createdAt: day(8) }] },
    ]);
    expect(ordered.map((d) => d.id)).toEqual(["new", "old"]);
  });

  it("orders silent bookings by their own date", () => {
    const ordered = orderConversations([
      { id: "older", createdAt: day(2), messages: [] },
      { id: "newer", createdAt: day(9), messages: [] },
    ]);
    expect(ordered.map((d) => d.id)).toEqual(["newer", "older"]);
  });

  it("does not mutate the array it was given", () => {
    const input = [
      { id: "a", createdAt: day(1), messages: [] },
      { id: "b", createdAt: day(9), messages: [] },
    ];
    orderConversations(input);
    expect(input.map((d) => d.id)).toEqual(["a", "b"]);
  });
});
