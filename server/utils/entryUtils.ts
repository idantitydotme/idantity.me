import { promises as fs } from "node:fs";
import path from "node:path";
import type { CombinedEntryTemplate, EntryData , EntrySearchData, EntrySearchResults, EntrySearchParams } from "#shared-types/Entry";
import { EntryType } from "#shared-types/Entry";
import { entryTemplates } from "../../data/templates/entryTemplates";
import { ulid } from "ulid";

const PAGES_DIRECTORY = path.join(process.cwd(), "data", "entries");

/**
 * Helper function to construct the full file path for a entry JSON file.
 * It takes a slug (e.g., 'about', 'games/adventure/my-entry') and correctly
 * constructs the file path within the PAGES_DIRECTORY.
 * @param slug The slug of the entry. An empty string "" refers to "index.json"
 * at the root of PAGES_DIRECTORY.
 * @returns The full path to the entry's JSON file.
 */
export function getEntryFilePath(slug: string): string {
    const fileName = slug === "" ? "index" : slug;
    return path.join(PAGES_DIRECTORY, `${fileName}.json`);
}

// Helper function to recursively read files in a directory
async function readFilesRecursively(
    directory: string,
    basePath = "",
): Promise<string[]> {
    let files: string[] = [];
    try {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        // Process in smaller batches of 5 entries at a time
        const batchSize = 5;
        for (let i = 0; i < entries.length; i += batchSize) {
            const batch = entries.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (entry) => {
                    const fullPath = path.join(directory, entry.name);
                    const relativePathSegment = basePath
                        ? path.posix.join(basePath, entry.name)
                        : entry.name;

                    if (entry.isDirectory()) {
                        return await readFilesRecursively(fullPath, relativePathSegment);
                    } else if (entry.isFile() && entry.name.endsWith(".json")) {
                        const slug = relativePathSegment.replace(/\.json$/, "");
                        return [slug === "index" && basePath === "" ? "" : slug];
                    }
                    return [];
                }),
            );

            files = files.concat(...batchResults.flat());
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            console.log(
                `Server: Directory not found or accessible: ${directory}. Returning empty array.`,
            );
            return [];
        }
        console.error(`Server: Error reading directory ${directory}:`, error);
        throw error;
    }
    return files;
}

/**
 * Recursively merges properties from a source object into a target object.
 * Handles nested objects recursively. Note: Arrays are replaced, not merged.
 * @param target The object to merge into (will be modified).
 * @param source The object to merge from.
 * @returns The merged target object.
 */
function deepMerge<T extends Record<string, unknown>>(
    target: T,
    source: Partial<T>,
): T {
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const targetValue = target[key];
            const sourceValue = source[key];

            // If both target and source values are objects (and not null or arrays),
            // recursively deep merge them.
            if (
                typeof targetValue === "object" &&
                targetValue !== null &&
                !Array.isArray(targetValue) &&
                typeof sourceValue === "object" &&
                sourceValue !== null &&
                !Array.isArray(sourceValue)
            ) {
                // Ensure the target property is an object before merging, or initialize it.
                if (
                    !target[key] ||
                    typeof target[key] !== "object" ||
                    target[key] === null ||
                    Array.isArray(target[key])
                ) {
                    target[key] = {} as T[Extract<keyof T, string>];
                }
                target[key] = deepMerge(
                    targetValue as Record<string, unknown>,
                    sourceValue as Partial<Record<string, unknown>>,
                ) as T[Extract<keyof T, string>];
            } else if (sourceValue !== undefined) {
                // Otherwise, if the source value is defined, assign it.
                // This handles primitive values, arrays, or objects where direct replacement is intended.
                target[key] = sourceValue as T[Extract<keyof T, string>];
            }
        }
    }
    return target;
}

// New helper type for migration result
interface MigrationResult<T> {
    data: T;
    migrated: boolean; // True if any property was added/changed by migration
}

/**
 * Migrates old entry data to the latest schema.
 * This function should be updated whenever new mandatory properties are added to EntryData.
 * @param {Partial<EntryData>} rawEntryData The entry data object loaded directly from JSON.
 * @param {string} slug The slug of the entry (for logging/context).
 * @param {CombinedEntryTemplate} template The template for the entry type.
 * @returns {MigrationResult<EntryData>} The migrated entry data and a flag indicating if migration occurred.
 */
function migrateEntryData(
    rawEntryData: Partial<EntryData>,
    slug: string,
    template: CombinedEntryTemplate,
): MigrationResult<EntryData> {
    let hasMigrated = false;
    let entryId: string;

    // --- ID Handling ---
    if (rawEntryData.id) {
        // Check if the existing ID is likely a UUIDv4 (36 characters with hyphens)
        // and replace it with a new ULID if it is. ULIDs are typically 26 characters.
        if (rawEntryData.id.length === 36 && rawEntryData.id.includes("-")) {
            entryId = ulid(); // Generate a new ULID for the existing UUID
            hasMigrated = true;
            console.warn(
                `Server: Migrating UUID '${rawEntryData.id}' to new ULID '${entryId}' for entry '${slug}'.`,
            );
        } else {
            // If it's not a UUID, assume it's already a ULID or another valid ID, so keep it.
            entryId = rawEntryData.id;
        }
    } else {
        // No ID present, generate a new ULID
        entryId = ulid();
        hasMigrated = true;
        console.warn(
            `Server: Generating new ULID '${entryId}' for entry '${slug}' as no ID was present.`,
        );
    }

    // --- Initialize EntryData with Defaults and Raw Data ---
    // Deep copy template defaults to avoid modifying the original template
    const templateDefaultProperties = JSON.parse(
        JSON.stringify(template.defaultProperties || {}),
    );

    const entryData: EntryData = {
        id: entryId, // Assign the (potentially new) ULID here
        slug: rawEntryData.slug || slug, // Use raw slug or provided slug
        type: Object.values(EntryType).includes(rawEntryData.type as EntryType)
            ? (rawEntryData.type as EntryType)
            : EntryType.DEFAULT,
        title:
            typeof rawEntryData.title === "string" // First, prefer the rawEntryData.title if it's a string
                ? rawEntryData.title
                : typeof template.defaultTitle === "string" // Otherwise, check if template.defaultTitle is a string
                    ? template.defaultTitle
                    : "Untitled Entry",
        categories: Array.isArray(rawEntryData.categories)
            ? rawEntryData.categories
            : template.defaultCategories && Array.isArray(template.defaultCategories) // Check if template.defaultCategories exists and is an array
                ? template.defaultCategories
                : [], // Provide an empty array as fallback
        tags: Array.isArray(rawEntryData.tags)
            ? rawEntryData.tags
            : template.defaultTags && Array.isArray(template.defaultTags) // Check if template.defaultTags exists and is an array
                ? template.defaultTags
                : [], // Provide an empty array as fallback
        properties: deepMerge(
            templateDefaultProperties,
            rawEntryData.properties || {},
        ),
        blocks: Array.isArray(rawEntryData.blocks) ? rawEntryData.blocks : [],
        lastModified:
            typeof rawEntryData.lastModified === "string"
                ? rawEntryData.lastModified
                : new Date().toISOString(),
    };

    // --- Check for Additional Migrations ---
    // Migration 1: Default 'entryType' if missing or invalid
    if (
        !rawEntryData.type ||
        !Object.values(EntryType).includes(rawEntryData.type as EntryType)
    ) {
        console.log(
            `Server: Migrated entry '${slug}': Defaulted 'type' to '${entryData.type}'.`,
        );
        hasMigrated = true;
    }
    // Migration 2: Default 'title' if missing or not string
    if (typeof rawEntryData.title !== "string") {
        console.log(
            `Server: Migrated entry '${slug}': Defaulted 'title' to '${entryData.title}'.`,
        );
        hasMigrated = true;
    }
    // Migration 3: Default 'categories' if missing or not the array
    if (!Array.isArray(rawEntryData.categories)) {
        console.log(`Server: Migrated entry '${slug}': Defaulted 'categories'.`);
        hasMigrated = true;
    }
    // Migration 4: Default 'tags' if missing or not array
    if (!Array.isArray(rawEntryData.tags)) {
        console.log(`Server: Migrated entry '${slug}': Defaulted 'tags'.`);
        hasMigrated = true;
    }
    // Migration 5: Default 'properties' if missing or if defaults were applied during deepMerge,
    // This is a heuristic. If raw properties were null/undefined or empty but the template has defaults, consider it a migration.
    if (
        (rawEntryData.properties === undefined ||
            rawEntryData.properties === null ||
            Object.keys(rawEntryData.properties).length === 0) &&
        Object.keys(templateDefaultProperties).length > 0
    ) {
        console.log(
            `Server: Migrated entry '${slug}': Applied default 'properties'.`,
        );
        hasMigrated = true;
    }
    // Migration 6: Default 'blocks' if missing or not array
    if (!Array.isArray(rawEntryData.blocks)) {
        console.log(`Server: Migrated entry '${slug}': Defaulted 'blocks'.`);
        hasMigrated = true;
    }
    // Migration 7: Default 'lastModified' if missing or not string
    if (typeof rawEntryData.lastModified !== "string") {
        console.log(`Server: Migrated entry '${slug}': Defaulted 'lastModified'.`);
        hasMigrated = true;
    }

    if (hasMigrated) {
        // Ensure lastModified is updated to reflect the migration save
        entryData.lastModified = new Date().toISOString();
        console.log(
            `Server: Entry '${slug}' migration complete. Entry data updated in memory.`,
        );
    }

    return { data: entryData, migrated: hasMigrated };
}

/**
 * Reads all entry JSON files and parses their content.
 * Applies migration if necessary.
 * @returns {Promise<EntryData[]>} A promise that resolves to an array of all entry data.
 */
async function getAllEntryData(): Promise<EntryData[]> {
    const entrySlugs = await readFilesRecursively(PAGES_DIRECTORY);
    const allEntrys: EntryData[] = [];

    for (const slug of entrySlugs) {
        const fullPath = getEntryFilePath(slug);

        try {
            await fs.access(fullPath);

            try {
                const fileContent = await fs.readFile(fullPath, "utf-8");

                // Add validation for empty or whitespace-only content
                if (!fileContent || fileContent.trim() === "") {
                    console.error(
                        `Server: Empty or whitespace-only file found at ${fullPath}`,
                    );
                    continue;
                }

                // Log the content if there's an issue parsing it
                try {
                    const rawEntryData: Partial<EntryData> = JSON.parse(fileContent);

                    // Validate that we got an object
                    if (!rawEntryData || typeof rawEntryData !== "object") {
                        console.error(
                            `Server: Invalid JSON data structure in ${fullPath}. Expected object, got:`,
                            typeof rawEntryData,
                        );
                        continue;
                    }

                    // Rest of your existing code...
                    const entryType = Object.values(EntryType).includes(
                        rawEntryData.type as EntryType,
                    )
                        ? (rawEntryData.type as EntryType)
                        : EntryType.DEFAULT;
                    const template = entryTemplates[entryType];

                    if (!template) {
                        console.error(
                            `Server: No template found for entryType: ${entryType} when processing slug: ${slug}. Skipping entry.`,
                        );
                        continue;
                    }

                    const migrationResult = migrateEntryData(rawEntryData, slug, template);
                    const entryData = migrationResult.data;

                    if (migrationResult.migrated) {
                        console.log(
                            `Server: Entry '${slug}' was migrated during getAllEntryData. Saving updated entry to disk.`,
                        );
                        await saveEntry(entryData); // Use the local saveEntry function
                    }

                    allEntrys.push(entryData);
                } catch (parseError) {
                    console.error(`Server: JSON Parse Error in file ${fullPath}:`, {
                        error: parseError,
                        content:
                            fileContent.slice(0, 200) +
                            (fileContent.length > 200 ? "..." : ""), // Show first 200 chars
                    });
                }
            } catch (readError) {
                console.error(`Server: Error reading file ${fullPath}:`, readError);
            }
        } catch (accessError) {
            console.warn(`Server: File not accessible: ${fullPath}`);
        }
    }
    return allEntrys;
}

export interface EntryNode {
    type: "entry";
    name: string;
    path: string;
    slug: string;
}

export interface FolderNode {
    type: "folder";
    name: string;
    path: string;
    children: (EntryNode | FolderNode)[];
}

export async function getAllEntrys(): Promise<EntryData[]> {
    return getAllEntryData();
}

/**
 * Fetches a single entry's data by its ID.
 * @param {string} entryId The unique ID of the entry.
 * @returns {Promise<EntryData | null>} The entry data, or null if not found.
 */
export async function getEntryById(entryId: string): Promise<EntryData | null> {
    const allEntrys = await getAllEntryData();
    return allEntrys.find((entry) => entry.id === entryId) || null;
}

/**
 * Fetches a single entry's data by its slug.
 * @param {string} slug The unique slug for the entry.
 * @returns {Promise<EntryData | null>} The entry data, or null if not found.
 */
export async function getEntryBySlug(slug: string): Promise<EntryData | null> {
    // Normalize the incoming slug for consistency with stored slugs
    const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
    const targetSlug = cleanSlug === "" ? "" : cleanSlug;

    const allEntrys = await getAllEntryData();
    const entry = allEntrys.find((entry) => entry.slug === targetSlug);

    return entry || null;
}

/**
 * Checks if a entry with the given slug exists.
 * @param {string} slug The slug to check.
 * @returns {Promise<boolean>} True if the entry exists, false otherwise.
 */
export async function doesEntryExist(slug: string): Promise<boolean> {
    // Normalize the incoming slug for consistency with stored slugs
    const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
    const targetSlug = cleanSlug === "" ? "" : cleanSlug;

    const allEntrys = await getAllEntryData();
    return allEntrys.some((entry) => entry.slug === targetSlug);
}

/**
 * Creates a new entry from a template and saves it to disk.
 * @param {string} slug The slug for the new entry.
 * @param {string} [title] Optional. The title for the new entry. If not provided, the template's default title will be used.
 * @param {EntryType} entryType The type of the entry (determines the template).
 * @returns {Promise<EntryData>} The newly created entry data.
 */
export async function createEntryFromTemplate(
    slug: string,
    title: string | undefined, // Added optional title parameter
    entryType: EntryType,
): Promise<EntryData> {
    const template: CombinedEntryTemplate | undefined = entryTemplates[entryType];

    if (!template) {
        throw new Error(`Template not found for entry type: ${entryType}`);
    }

    // Ensure the slug is clean for the new entry data
    const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
    const finalSlug = cleanSlug === "index" ? "" : cleanSlug;

    const newEntry: EntryData = {
        id: ulid(),
        slug: finalSlug,
        type: entryType,
        title: title ?? template.defaultTitle,
        categories: [...template.defaultCategories],
        tags: [...template.defaultTags],
        properties: JSON.parse(JSON.stringify(template.defaultProperties)),
        blocks: JSON.parse(JSON.stringify(template.defaultBlocks)),
        lastModified: new Date().toISOString(),
    };

    await saveEntry(newEntry);
    return newEntry;
}

/**
 * Changes the template of an existing entry and saves it.
 * @param {string} entryId The ID of the entry to modify.
 * @param {EntryType} targetEntryType The new entry type/template to apply.
 * @returns {Promise<EntryData>} The updated entry data.
 */
export async function convertEntryTemplate(
    entryId: string,
    targetEntryType: EntryType,
): Promise<EntryData> {
    const currentEntry = await getEntryById(entryId);
    if (!currentEntry) {
        throw new Error(`Entry with ID ${entryId} not found.`);
    }

    const template: CombinedEntryTemplate | undefined =
        entryTemplates[targetEntryType];

    if (!template) {
        throw new Error(`Template not found for entry type: ${targetEntryType}`);
    }

    // Deep clones default properties and blocks to avoid reference issues
    const clonedDefaultProperties = JSON.parse(
        JSON.stringify(template.defaultProperties),
    );
    const clonedDefaultBlocks = JSON.parse(
        JSON.stringify(template.defaultBlocks),
    );

    const updatedEntryData: EntryData = {
        ...currentEntry, // Keep existing ID, slug, and any custom blocks
        type: targetEntryType,
        title: currentEntry.title, // Keep the original title unless specifically updated
        categories: [...template.defaultCategories], // Overwrite categories from the template
        tags: [...template.defaultTags], // Overwrite tags from a template
        properties: clonedDefaultProperties, // Overwrite properties with template defaults
        blocks: [...currentEntry.blocks, ...clonedDefaultBlocks], // Append new blocks
        lastModified: new Date().toISOString(), // Update last modified timestamp
    };

    await saveEntry(updatedEntryData);
    return updatedEntryData;
}

/**
 * Updates an existing entry by its ID.
 * @param {string} entryId The ID of the entry to update.
 * @param {Partial<EntryData>} updates The partial entry data to apply.
 * @returns {Promise<EntryData>} The updated entry data.
 */
export async function updateEntry(
    entryId: string,
    updates: Partial<EntryData>,
): Promise<EntryData> {
    const existingEntry = await getEntryById(entryId);
    if (!existingEntry) {
        throw new Error(`Entry with ID ${entryId} not found for update.`);
    }

    const updatedEntry: EntryData = {
        ...existingEntry,
        ...updates,
        lastModified: new Date().toISOString(), // Ensure lastModified is updated
    };

    await saveEntry(updatedEntry);
    return updatedEntry;
}

/**
 * Saves entry data to a JSON file.
 * @param {EntryData} entryData The data of the entry to save.
 * @returns {Promise<void>}
 */
export async function saveEntry(entryData: EntryData): Promise<void> {
    // The entryData.slug itself will now be the correct identifier including directories (or empty for root)
    const filePath = getEntryFilePath(entryData.slug);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(entryData, null, 2), "utf-8");
}

/**
 * Moves a entry to a new parent path.
 * @param {string} entryId The ID of the entry to move.
 * @param {string} originalFilename The original filename of the entry (without extension).
 * @param {string} newParentSlugPath The new directory path (slug format).
 */
export async function moveEntry(
    entryId: string,
    originalFilename: string,
    newParentSlugPath: string,
): Promise<void> {
    const entryData = await getEntryById(entryId);
    if (!entryData) {
        throw new Error(`Entry with ID ${entryId} not found for move operation.`);
    }

    const oldFullPath = getEntryFilePath(entryData.slug);

    // Ensure the newParentSlugPath is clean
    const cleanNewParentSlugPath = newParentSlugPath.replace(/^\/+|\/+$/g, "");
    // Construct the new slug. If the newParentSlugPath is empty, it means moving to root.
    const newSlug = cleanNewParentSlugPath
        ? `${cleanNewParentSlugPath}/${originalFilename}`
        : originalFilename;

    // Handle the special case where the originalFilename is 'index' and it's moved to root.
    const finalNewSlug =
        newSlug === "index" && cleanNewParentSlugPath === "" ? "" : newSlug;

    const newFullPath = getEntryFilePath(finalNewSlug);

    // Ensure the new directory exists
    await fs.mkdir(path.dirname(newFullPath), { recursive: true });

    // Update the slug in the entry data before writing the new file
    const entryDataForNewFile: EntryData = {
        ...entryData,
        slug: finalNewSlug, // Assign the newly constructed slug
        lastModified: new Date().toISOString(),
    };

    // Check if a file already exists at the new path to prevent overwriting
    try {
        await fs.access(newFullPath);
        const errorMessage = `Server: A file already exists at '${newFullPath}'. Cannot move.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    } catch (accessError: any) {
        // If access fails, it means the file does not exist, which is what we want.
        // EACCES is for permission, ENOENT is for not found. We only care about ENOENT.
        if (accessError.code !== "ENOENT") {
            throw accessError; // Re-throw if it's a permission error or something else
        }
    }

    await fs.writeFile(
        newFullPath,
        JSON.stringify(entryDataForNewFile, null, 2),
        "utf-8",
    );
    console.log(`Server: Successfully wrote new entry file to: ${newFullPath}`);

    // Attempt to delete the old entry file.
    try {
        await fs.unlink(oldFullPath);
        console.log(
            `Server: Successfully deleted old entry file from: ${oldFullPath}`,
        );
    } catch (unlinkError) {
        const warningMessage = `Server: Warning: Failed to delete old entry file for ID '${entryId}' from '${oldFullPath}'. New file exists. Error: ${unlinkError}`;
        console.warn(warningMessage);
    }

    console.log(
        `Server: Entry ID '${entryId}' successfully moved from '${oldFullPath}' to '${newFullPath}'.`,
    );
}

/**
 * Deletes a entry by its ID.
 * @param {string} entryId The ID of the entry to delete.
 * @returns {Promise<void>}
 */
export async function deleteEntry(entryId: string): Promise<void> {
    const entryToDelete = await getEntryById(entryId);
    if (!entryToDelete) {
        throw new Error(`Entry with ID ${entryId} not found for deletion.`);
    }
    const filePath = getEntryFilePath(entryToDelete.slug);
    await fs.unlink(filePath);
}

/**
 * Retrieves a list of all entry IDs, slugs, and titles.
 * @returns {Promise<Array<{ id: string; slug: string; title: string }>>}
 */
export async function getAllEntryIdsAndSlugs(): Promise<
    Array<{ id: string; slug: string; title: string }>
> {
    const allEntrys = await getAllEntryData();
    return allEntrys.map((entry) => ({
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
    }));
}

/**
 * Fetches the hierarchical structure of all entrys and folders.
 * @returns A promise that resolves to an array of FolderNode or EntryNode.
 */
export async function fetchEntryStructure(): Promise<(EntryNode | FolderNode)[]> {
    const allEntrys = await getAllEntryData();
    const rootNodes: (EntryNode | FolderNode)[] = [];
    const pathMap = new Map<string, FolderNode | EntryNode>();

    // Step 1: Create all nodes (entrys and folders) and populate the map
    for (const entry of allEntrys) {
        // Use entry.slug directly, handling the empty string for the root entry
        const parts = entry.slug === "" ? [""] : entry.slug.split("/"); // Treat "" as [""] for root
        let currentPath = "";

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isEntry = i === parts.length - 1;
            // Construct nodePath carefully to handle root (empty string)
            const nodePath = currentPath ? `${currentPath}/${part}` : part;
            // If a part is empty, it means it's the root entry. Its nodePath should also be empty.
            const effectiveNodePath = part === "" && i === 0 ? "" : nodePath;

            if (!pathMap.has(effectiveNodePath)) {
                if (isEntry) {
                    pathMap.set(effectiveNodePath, {
                        type: "entry",
                        name: entry.title,
                        path: effectiveNodePath,
                        slug: entry.slug, // Use entry.slug directly which can be ""
                    });
                } else {
                    pathMap.set(effectiveNodePath, {
                        type: "folder",
                        name: part,
                        path: effectiveNodePath,
                        children: [],
                    });
                }
            }
            currentPath = effectiveNodePath;
        }
    }

    // Step 2: Build the hierarchy
    for (const [nodePath, node] of pathMap.entries()) {
        // For the root node (empty string path), dirname returns '.', so special handling is needed.
        const parentPath = nodePath === "" ? null : path.dirname(nodePath);
        const parentNode =
            parentPath !== null ? pathMap.get(parentPath) : undefined;

        if (parentPath === null || parentPath === "." || parentPath === "/") {
            // If it's a root node (empty string path) or a direct child of root
            rootNodes.push(node);
        } else if (parentNode && parentNode.type === "folder") {
            parentNode.children.push(node);
        }
    }

    // Step 3: Sort children within folders alphabetically by name
    const sortChildren = (nodes: (EntryNode | FolderNode)[]) => {
        nodes.sort((a, b) => {
            if (a.type === "folder" && b.type === "entry") return -1; // Folders before entrys
            if (a.type === "entry" && b.type === "folder") return 1;
            return a.name.localeCompare(b.name); // Alphabetical sort
        });
        nodes.forEach((node) => {
            if (node.type === "folder") {
                sortChildren(node.children);
            }
        });
    };

    // Filter out potential duplicate root entries if they result from the loop logic
    const uniqueRootNodes = Array.from(new Set(rootNodes));
    sortChildren(uniqueRootNodes);

    return uniqueRootNodes;
}

/**
 * Searches for entrys based on a query term across titles, categories, and tags.
 * Returns categorized lists of matching entrys.
 * @param {EntrySearchParams} params - The search parameters.
 * @returns {Promise<EntrySearchResults>} An object containing categorized lists of matching entrys.
 */
export async function searchEntrys(
    params: EntrySearchParams,
): Promise<EntrySearchResults> {
    const { query } = params;
    const lowerCaseQuery = query.toLowerCase();

    const allEntrys = await getAllEntryData();

    const matchingTitles: EntrySearchData[] = [];
    const matchingCategories: EntrySearchData[] = [];
    const matchingTags: EntrySearchData[] = [];

    for (const entry of allEntrys) {
        const entryTitleData: EntrySearchData = {
            id: entry.id,
            slug: entry.slug,
            title: entry.title,
            type: entry.type,
        };

        // Check title
        if (entry.title.toLowerCase().includes(lowerCaseQuery)) {
            matchingTitles.push(entryTitleData);
        }

        // Check categories
        if (
            entry.categories &&
            entry.categories.some((cat) => cat.toLowerCase().includes(lowerCaseQuery))
        ) {
            matchingCategories.push(entryTitleData);
        }

        // Check tags
        if (
            entry.tags &&
            entry.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery))
        ) {
            matchingTags.push(entryTitleData);
        }
    }

    // Sort results within each category alphabetically by title
    matchingTitles.sort((a, b) => a.title.localeCompare(b.title));
    matchingCategories.sort((a, b) => a.title.localeCompare(b.title));
    matchingTags.sort((a, b) => a.title.localeCompare(b.title));

    return {
        matchingTitles,
        matchingCategories,
        matchingTags,
    };
}