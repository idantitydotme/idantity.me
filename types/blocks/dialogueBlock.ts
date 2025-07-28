import type { BaseBlockData, TextNode, InlineNode } from "./base";

export interface DialogueBlockAttrs {
    character: string;
    parenthetical?: string;
    line: Array<TextNode | InlineNode>;
    [key: string]: unknown;
}

export interface DialogueBlockData extends BaseBlockData {
    type: "dialogue";
    attrs: DialogueBlockAttrs;
}