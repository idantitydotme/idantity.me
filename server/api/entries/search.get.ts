import { defineEventHandler, getQuery, createError } from "h3";
import { searchEntrys } from "../../utils/entryUtils";

/**
 * Handles GET requests to /api/entries/search.
 * Searches for entries based on a query term.
 */
export default defineEventHandler(async (event) => {
    const queryParams = getQuery(event);
    const query = queryParams.query as string | undefined; // Cast to string | undefined for safety

    console.log(`API GET /api/entries/search: Search query received: "${query}"`);

    if (!query || query.trim() === "") {
        console.warn(
            "API GET /api/entries/search: Search query parameter is missing or empty. Throwing 400.",
        );
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "Search query parameter is missing or empty.",
        });
    }

    try {
        // Call the server-side search function
        const searchResults = await searchEntrys({ query: query });

        console.log(
            `API GET /api/entries/search: Search completed for query "${query}".`,
        );
        return searchResults; // h3 automatically serializes to JSON with 200 OK status
    } catch (error) {
        console.error("API GET /api/entries/search: Error during search:", error);

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
            message: "Failed to search entries.",
            data: {
                details: errorMessage,
                stack: errorDetails,
            },
        });
    }
});