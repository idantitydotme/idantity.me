import { defineEventHandler, createError } from "h3";
import { fetchEntryStructure } from "../../utils/entryUtils";

/**
 * Handles GET requests to /api/entries/structure.
 * Returns the hierarchical structure of all entries and folders.
 */
export default defineEventHandler(async (event) => {
    console.log("API GET /api/entries/structure: Request received.");

    try {
        const entryStructure = await fetchEntryStructure(); // Use the existing utility
        console.log(
            `API GET /api/entries/structure: Fetched entry structure with ${entryStructure.length} top-level nodes.`,
        );
        return entryStructure; // h3 automatically serializes to JSON with 200 OK status
    } catch (error) {
        console.error("API GET /api/entries/structure: Error fetching entry structure:", error);

        let errorMessage = "Failed to retrieve entry structure.";
        let errorDetails: string | undefined;

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails =
                process.env.NODE_ENV === "development" ? error.stack : undefined;
        } else if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
        ) {
            errorMessage = (error as { message: string }).message;
        }

        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: errorMessage,
            data: {
                details: errorDetails,
                stack: errorDetails,
            },
        });
    }
});