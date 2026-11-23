import { describe, expect, it } from "vite-plus/test";
import { scopeProjects } from "./projects.scope";

const data = {
  boards: [
    { id: "b1", userId: "owner" },
    { id: "b2", userId: "someone-else" },
  ],
  lists: [
    { id: "l1", boardId: "b1" },
    { id: "l2", boardId: "b2" },
  ],
  cards: [
    { id: "c1", listId: "l1" },
    { id: "c2", listId: "l2" },
  ],
};

describe("scopeProjects", () => {
  it("returns only the owner's boards, their lists and their cards", () => {
    const out = scopeProjects("owner", data);
    expect(out.boards.map((b) => b.id)).toEqual(["b1"]);
    expect(out.lists.map((l) => l.id)).toEqual(["l1"]);
    expect(out.cards.map((c) => c.id)).toEqual(["c1"]);
  });

  it("returns nothing for an owner with no boards", () => {
    expect(scopeProjects("nobody", data)).toEqual({ boards: [], lists: [], cards: [] });
  });
});
