import { defineEventHandler, createError } from "h3";
import { getAllEntryIdsAndSlugs } from "../../utils/entryUtils";

/**
 * Handles GET requests to /api/entries/ids-and-titles.
 * Returns a list of all entry IDs, slugs, and titles.
 */
export default defineEventHandler(async (event) => {
    console.log("API GET /api/entries/ids-and-titles: Request received.");

    try {
        const entries = await getAllEntryIdsAndSlugs();
        console.log(
            `API GET /api/entries/ids-and-titles: Found ${entries.length} entries.`,
        );
        return entries; // h3 automatically serializes to JSON with 200 OK status
    } catch (error) {
        console.error("API GET /api/entries/ids-and-titles: Error fetching all entry IDs and slugs:", error);

        let errorMessage = "Failed to fetch entry IDs and slugs.";
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
            },
        });
    }
});