import { and, or, isNotNull, lt, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { note, todo } from "../db/schema";

export interface CleanupResult {
  success: boolean;
  deletedNotesCount: number;
  deletedTodosCount: number;
  timestamp: string;
  error?: string;
}

export async function runTrashCleanup(d1: D1Database): Promise<CleanupResult> {
  const db = drizzle(d1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let deletedNotesCount = 0;
  let deletedTodosCount = 0;

  try {
    // 1. Delete notes in trash or soft-deleted older than 30 days
    const deletedNotes = await db
      .delete(note)
      .where(
        or(
          and(isNotNull(note.deletedAt), lt(note.deletedAt, thirtyDaysAgo)),
          and(eq(note.isTrashed, true), lt(note.updatedAt, thirtyDaysAgo)),
        ),
      )
      .returning({ id: note.id });

    deletedNotesCount = deletedNotes.length;

    // 2. Delete soft-deleted todos older than 30 days
    const deletedTodos = await db
      .delete(todo)
      .where(
        or(
          and(isNotNull(todo.deletedAt), lt(todo.deletedAt, thirtyDaysAgo)),
          and(eq(todo.isCompleted, true), lt(todo.updatedAt, thirtyDaysAgo)),
        ),
      )
      .returning({ id: todo.id });

    deletedTodosCount = deletedTodos.length;

    return {
      success: true,
      deletedNotesCount,
      deletedTodosCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Cleanup Cron] Failed to cleanup trash/archived items:", error);
    return {
      success: false,
      deletedNotesCount,
      deletedTodosCount,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
