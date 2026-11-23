type Row = { id: string; [k: string]: any };

/**
 * Keeps only the boards the owner has, and the lists and cards inside them. Lists belong to a
 * board (`boardId`), cards to a list (`listId`). Rows that belong to no owned board are dropped.
 */
export function scopeProjects<
  B extends Row,
  L extends Row & { boardId: string },
  C extends Row & { listId: string },
>(
  owner: string,
  rows: { boards: (B & { userId: string })[]; lists: L[]; cards: C[] },
): { boards: B[]; lists: L[]; cards: C[] } {
  const boards = rows.boards.filter((b) => b.userId === owner);
  const boardIds = new Set(boards.map((b) => b.id));
  const lists = rows.lists.filter((l) => boardIds.has(l.boardId));
  const listIds = new Set(lists.map((l) => l.id));
  const cards = rows.cards.filter((c) => listIds.has(c.listId));
  return { boards, lists, cards };
}
