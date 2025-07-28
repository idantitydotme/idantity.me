import type { SectionBlockData } from "./sectionBlock";
import type { ParagraphBlockData } from "./paragraphBlock";
import type { CalloutBlockData } from "./calloutBlock";
import type { ImageBlockData } from "./imageBlock";
import type { ScriptBlockData } from "./scriptBlock";
import type { SceneBlockData } from "./sceneBlock";
import type { DialogueBlockData } from "./dialogueBlock";

export * from "./base";

export * from "./paragraphBlock";
export * from "./sectionBlock";
export * from "./calloutBlock";
export * from "./imageBlock";
export * from "./scriptBlock";
export * from "./sceneBlock";
export * from "./dialogueBlock";

export type BlockData =
    | SectionBlockData
    | ParagraphBlockData
    | CalloutBlockData
    | ImageBlockData
    | ScriptBlockData
    | SceneBlockData
    | DialogueBlockData;