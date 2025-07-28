import type { BaseBlockData } from "./base";

export interface ParagraphBlockAttrs extends Record<string, unknown> {
    alignment?: "left" | "center" | "right";
    lineHeight?: string;
    indentLevel?: number;
}

export interface ParagraphBlockData extends BaseBlockData {
    type: "paragraph";
    attrs: ParagraphBlockAttrs;
}