import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type RoutineItem = {
  id: string;
  name: string;
};

export type RoutineCategory = {
  id: string;
  name: string;
  items: RoutineItem[];
};

export type Exercise = {
  id: string;
  name: string;
  bpm: number | null;
  targetBpm?: number | null;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
};

export type RepertoireItem = {
  id: string;
  title: string;
  composer?: string;
  status: string;
  difficulty: number;
  attachments?: Attachment[];
};

export type DjMix = {
  id: string;
  name: string;
  duration: string;
  genre: string;
  description?: string;
};

export type MusicData = {
  piano: {
    routine: RoutineCategory[];
    exercises: Exercise[];
    repertoire: RepertoireItem[];
    repertoireStates: string[];
    repertoireComposers: string[];
  };
  guitar: {
    routine: RoutineCategory[];
    exercises: Exercise[];
    repertoire: RepertoireItem[];
    repertoireStates: string[];
    repertoireComposers: string[];
  };
  dj: {
    routine: RoutineCategory[];
    exercises: Exercise[];
    mixes: DjMix[];
    djGenres: string[];
  };
};

export const music = sqliteTable("music", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data", { mode: "json" })
    .$type<MusicData>()
    .notNull()
    .$defaultFn(() => ({
      piano: {
        routine: [],
        exercises: [],
        repertoire: [],
        repertoireStates: [],
        repertoireComposers: [],
      },
      guitar: {
        routine: [],
        exercises: [],
        repertoire: [],
        repertoireStates: [],
        repertoireComposers: [],
      },
      dj: { routine: [], exercises: [], mixes: [], djGenres: [] },
    })),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type MusicEntry = typeof music.$inferSelect;
export type NewMusicEntry = typeof music.$inferInsert;
