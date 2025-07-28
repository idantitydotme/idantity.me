import { defineEventHandler, createError } from "h3";
import { getAllEntrys } from "../../utils/entryUtils";

/**
 * Handles GET requests to /api/entries/slugs.
 * Returns a list of all entry data (assuming `getAllEntrys` returns full entry objects).
 */
export default defineEventHandler(async (event) => {
    console.log("API GET /api/entries/slugs: Request received for all entries.");

    try {
        const entries = await getAllEntrys();
        console.log(`API GET /api/entries/slugs: Found ${entries.length} entries.`);
        return entries; // h3 automatically serializes to JSON with 200 OK status
    } catch (error) {
        console.error("API GET /api/entries/slugs: Error reading entries:", error);

        let errorMessage = "Internal server error";
        let errorDetails: string | undefined; // This variable holds the stack information

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
                stack: errorDetails, // <-- FIXED: Use errorDetails here
            },
        });
    }
});