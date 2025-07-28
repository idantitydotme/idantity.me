import type { BaseBlockData } from "./base";

export interface ImageBlockAttrs {
    url: string;
    fileName: string;
    altText?: string;
    [key: string]: unknown;
}

export interface ImageBlockData extends BaseBlockData {
    type: "image";
    attrs: ImageBlockAttrs;
}