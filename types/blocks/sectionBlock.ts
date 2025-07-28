import type { BaseBlockData } from "./base";

export interface SectionBlockAttrs {
    title: string;
    mainArticleSlug?: string | null;
    [key: string]: unknown;
}

export interface SectionBlockData extends BaseBlockData {
    type: "section";
    attrs: SectionBlockAttrs;
    slots?: Record<string, BlockData[]>;
}