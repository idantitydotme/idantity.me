import { defineRelations } from "drizzle-orm";
import * as schema from "./index.ts";

export const relations = defineRelations(schema, (r) => ({
  board: {
    lists: r.many.list(),
    customFields: r.many.customFieldDefinition(),
  },
  list: {
    board: r.one.board({
      from: r.list.boardId,
      to: r.board.id,
    }),
    cards: r.many.card(),
  },
  card: {
    list: r.one.list({
      from: r.card.listId,
      to: r.list.id,
    }),
  },
  customFieldDefinition: {
    board: r.one.board({
      from: r.customFieldDefinition.boardId,
      to: r.board.id,
    }),
  },
}));
