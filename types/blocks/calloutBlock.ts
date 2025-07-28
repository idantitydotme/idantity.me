import type { BaseBlockData, TextNode, InlineNode } from "./base";

export type CalloutVariant =
    | "note"
    | "tip"
    | "warning"
    | "danger"
    | "commentaryInternal"
    | "commentaryExternal"
    | "ideation"
    | "creatorInternal"
    | "creatorExternal";

export interface CalloutBlockAttrs {
    variant: CalloutVariant;
    text: Array<TextNode | InlineNode>;
    [key: string]: unknown;
}

export interface CalloutBlockData extends BaseBlockData {
    type: "callout";
    attrs: CalloutBlockAttrs;
}