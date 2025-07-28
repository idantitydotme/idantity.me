import { defineEventHandler, getQuery, createError } from "h3";
import { getEntryBySlug } from "../../utils/entryUtils";

/**
 * Handles GET requests to /api/entries/get-id.
 * Returns the ID for a given entry slug.
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const slug = query.slug;

    console.log(`[entries/get-id] GET - Request for slug: ${slug}`);

    if (typeof slug !== "string" || slug.trim() === "") {
        console.warn("API GET /get-id: Slug is missing or not a string. Returning 400.");
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "Slug must be a non-empty string.",
        });
    }

    try {
        const entryData = await getEntryBySlug(slug);

        if (entryData) {
            console.log(`API GET /get-id: Found ID "${entryData.id}" for slug "${slug}".`);
            return { id: entryData.id }; // h3 automatically serializes to JSON
        } else {
            console.log(`API GET /get-id: Entry with slug '${slug}' not found. Returning 404.`);
            throw createError({
                statusCode: 404,
                statusMessage: "Not Found",
                message: `Entry with slug '${slug}' not found.`,
            });
        }
    } catch (error) {
        console.error("API GET /get-id: Error getting entry ID:", error);
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
            message: "Failed to retrieve entry ID.",
            data: {
                details: errorMessage,
                stack: errorDetails,
            },
        });
    }
});