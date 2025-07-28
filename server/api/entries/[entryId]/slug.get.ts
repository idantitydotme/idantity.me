import { defineEventHandler, getRouterParam, createError } from "h3";
import { getAllEntryIdsAndSlugs } from "../../../utils/entryUtils";

/**
 * Handles GET requests to /api/entries/[entryId]/slug.
 * Returns the slug for a given entry ID.
 */
export default defineEventHandler(async (event) => {
    const entryId = getRouterParam(event, "entryId"); // Get the entryId from the route parameters

    console.log(`[entries/[entryId]/slug] GET - Entry ID: ${entryId}`);

    if (!entryId) {
        console.warn("API GET: Entry ID is missing. Returning 400.");
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "Entry ID is required",
        });
    }

    try {
        // Get all entry IDs, slugs, and titles using the utility function
        const allEntrys = await getAllEntryIdsAndSlugs();
        // Find the entry with the matching ID
        const entry = allEntrys.find((p) => p.id === entryId);

        if (!entry) {
            console.log(
                `API GET: Entry not found for ID: ${entryId}. Returning 404.`,
            );
            throw createError({
                statusCode: 404,
                statusMessage: "Not Found",
                message: "Entry not found",
            });
        }

        console.log(`API GET: Found slug "${entry.slug}" for entry ID: ${entryId}`);
        return { slug: entry.slug }; // h3 automatically serializes to JSON
    } catch (error) {
        console.error(`API GET /api/entries/${entryId}/slug error:`, error);
        let errorMessage = "Internal Server Error";
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
            message: "Failed to retrieve entry slug.",
            data: {
                details: errorMessage,
                stack: errorDetails,
            },
        });
    }
});