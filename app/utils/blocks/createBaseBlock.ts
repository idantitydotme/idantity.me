import { ulid } from "ulid";
import type { BlockData } from "@/types/blocks";

export function createBaseBlock<T extends BlockData>(
    type: T["type"],
    initialData?: Partial<T>,
): T {
    const base = {
        id: ulid(),
        type: type,
    };
    const block: T = { ...base, ...initialData } as T;
    block.slots = block.slots || {};
    return block;
}