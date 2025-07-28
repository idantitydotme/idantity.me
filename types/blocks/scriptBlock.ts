import type { BaseBlockData } from "./base";

export interface ScriptBlockAttrs {
    characters: string[];
    [key: string]: unknown;
}

export interface ScriptBlockData extends BaseBlockData {
    type: "script";
    attrs: ScriptBlockAttrs;
    slots?: Record<string, BlockData[]>;
}