import type { BlockData } from "./index";
import type { IconName } from "../Icons";

export interface BaseBlockData {
    readonly id: string;
    readonly type: string;
    attrs?: Record<string, unknown>;
    slots?: Record<string, BlockData[]>;
    isTemplated?: boolean;
}

export interface FlatBlockInfo {
    type: BlockData["type"];
    icon: IconName;
    category: string;
    tooltip: string;
    displayName: string;
}

export interface GroupedBlocks {
    [category: string]: FlatBlockInfo[];
}

export type MarkType =
    | "bold"
    | "italic"
    | "underline"
    | "link"
    | "code"
    | "mention"
    | "bulletList"
    | "orderedList";

export interface Mark {
    type: MarkType;
    attrs?: {
        url?: string;
        entryId?: string;
        entrySlug?: string;
        entryTitle?: string;
    };
}

export interface TextNode {
    type: "text";
    text: string;
    marks?: Mark[];
}

export type InlineNodeType = "image";

export interface InlineNode {
    type: InlineNodeType;
    attrs?: Record<string, unknown>;
}