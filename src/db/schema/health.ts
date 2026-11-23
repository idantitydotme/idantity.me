import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Workouts
export type WorkoutSet = {
  id: string;
  kg: number | string;
  reps: number | string;
  restTimer: number; // in seconds
};

export type WorkoutExercise = {
  id: string;
  name: string;
  notes: string;
  sets: WorkoutSet[];
};

export type WorkoutStretch = {
  id: string;
  name: string;
  duration: number; // in seconds
};

export type WorkoutExerciseCategory = {
  id: string;
  name: string;
  items: WorkoutExercise[];
};

export type WorkoutStretchCategory = {
  id: string;
  name: string;
  items: WorkoutStretch[];
};

export type WorkoutData = {
  exercises: WorkoutExerciseCategory[];
  stretches: WorkoutStretchCategory[];
};

export const workout = sqliteTable("workout", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data", { mode: "json" })
    .$type<WorkoutData>()
    .notNull()
    .$defaultFn(() => ({ exercises: [], stretches: [] })),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type WorkoutEntry = typeof workout.$inferSelect;
export type NewWorkoutEntry = typeof workout.$inferInsert;

// Measurements
export type MeasurementValue = {
  month: number; // 0-11
  value: number | string;
};

export type Measurement = {
  id: string;
  name: string;
  unit: string;
  target?: number | string;
  values: {
    [year: number]: MeasurementValue[];
  };
};

export type MeasurementsGoals = {
  currentWeight?: number;
  targetWeight?: number;
  currentBodyFat?: number;
  targetBodyFat?: number;
  weightUnit?: string;
};

export type MeasurementsData = {
  goals?: MeasurementsGoals;
  measurements: Measurement[];
};

export const measurements = sqliteTable("measurements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data", { mode: "json" })
    .$type<MeasurementsData>()
    .notNull()
    .$defaultFn(() => ({ measurements: [] })),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type MeasurementsEntry = typeof measurements.$inferSelect;
export type NewMeasurementsEntry = typeof measurements.$inferInsert;

// Fasting
export const fasting = sqliteTable("fasting", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }).notNull(),
  originalEndTime: integer("original_end_time", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type FastingEntry = typeof fasting.$inferSelect;
export type NewFastingEntry = typeof fasting.$inferInsert;
