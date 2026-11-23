import { describe, expect, it } from "vite-plus/test";
import { planCreate, targetIdOf } from "./projects.logic";

describe("planCreate (projects POST /cards)", () => {
  it("creates a board row owned by the user", () => {
    const plan = planCreate({ type: "board", title: " Work ", description: "d" }, "owner", "b1");
    expect(plan).toEqual({
      ok: true,
      type: "board",
      row: { id: "b1", userId: "owner", title: "Work", description: "d" },
    });
  });

  it("creates a list row under a board", () => {
    const plan = planCreate(
      { type: "list", title: "Todo", boardId: "b1", order: "2" },
      "owner",
      "l1",
    );
    expect(plan).toEqual({
      ok: true,
      type: "list",
      row: { id: "l1", boardId: "b1", title: "Todo", order: 2 },
    });
  });

  it("creates a card row under a list and defaults customFields", () => {
    const plan = planCreate({ type: "card", title: "Fix", listId: "l1" }, "owner", "c1");
    expect(plan).toEqual({
      ok: true,
      type: "card",
      row: { id: "c1", listId: "l1", title: "Fix", description: null, order: 0, customFields: {} },
    });
  });

  it("treats a missing type as a card, as before", () => {
    const plan = planCreate({ title: "Fix", listId: "l1" }, "owner", "c2");
    expect(plan.ok && plan.type).toBe("card");
  });

  it("rejects an unknown type instead of inserting a card", () => {
    expect(planCreate({ type: "sprint", title: "x" }, "o", "i")).toEqual({
      ok: false,
      error: "Invalid type",
    });
  });

  it("requires a title and the parent id for each type", () => {
    expect(planCreate({ type: "board" }, "o", "i")).toEqual({ ok: false, error: "Missing title" });
    expect(planCreate({ type: "list", title: "x" }, "o", "i")).toEqual({
      ok: false,
      error: "Missing boardId",
    });
    expect(planCreate({ type: "card", title: "x" }, "o", "i")).toEqual({
      ok: false,
      error: "Missing listId",
    });
  });
});

describe("targetIdOf (projects PATCH /cards)", () => {
  it("accepts cardId as sent by the native client", () => {
    expect(targetIdOf({ cardId: "c1", listId: "l2" })).toBe("c1");
  });

  it("still accepts id", () => {
    expect(targetIdOf({ id: "c1" })).toBe("c1");
  });

  it("prefers id when both are sent, and is undefined when neither is", () => {
    expect(targetIdOf({ id: "a", cardId: "b" })).toBe("a");
    expect(targetIdOf({ title: "x" })).toBeUndefined();
    expect(targetIdOf(null)).toBeUndefined();
  });
});
