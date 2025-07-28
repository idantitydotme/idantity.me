import { defineEventHandler, readBody, createError } from "h3";
import { moveEntry } from "../../utils/entryUtils";

/**
 * Handles POST requests to move a entry.
 */
export default defineEventHandler(async (event) => {
    console.log("--- API POST /api/entries/move: Route reached! ---");

    try {
        const { entryId, originalFilename, newParentSlugPath } = await readBody(event);
        console.log(
            `API POST /api/entries/move: Received request to move entry ID: ${entryId}, original filename: ${originalFilename}, to new path: ${newParentSlugPath}`,
        );

        if (
            !entryId ||
            !originalFilename ||
            typeof newParentSlugPath === "undefined"
        ) {
            console.warn(
                "API POST /api/entries/move: Missing required parameters: entryId, originalFilename, or newParentSlugPath. Throwing 400.",
            );
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message:
                    "Missing required parameters: entryId, originalFilename, and newParentSlugPath",
            });
        }

        try {
            // Call the server-side utility to perform the entry move
            await moveEntry(entryId, originalFilename, newParentSlugPath);
            console.log(
                `API POST /api/entries/move: Server-side moveEntry call completed successfully for entry ID: ${entryId}.`,
            );
        } catch (serverError) {
            console.error(
                "API POST /api/entries/move: Error during moveEntry call:",
                serverError,
            );
            let errorMessage = "Failed to move entry on the server.";
            let errorDetails: string | undefined;

            if (serverError instanceof Error) {
                errorMessage = serverError.message;
                errorDetails =
                    process.env.NODE_ENV === "development" ? serverError.stack : undefined;
            } else if (
                typeof serverError === "object" &&
                serverError !== null &&
                "message" in serverError
            ) {
                errorMessage = (serverError as { message: string }).message;
            }

            throw createError({
                statusCode: 500, // Use 500 for server errors
                statusMessage: "Internal Server Error",
                message: errorMessage,
                data: {
                    details: errorDetails,
                },
            });
        }

        console.log(
            `API POST /api/entries/move: Entry moved successfully for ID: ${entryId}.`,
        );
        return { success: true, message: "Entry moved successfully!" }; // h3 automatically serializes
    } catch (error) {
        // This outer catch handles errors in parsing the request body or unexpected issues
        console.error(
            "API POST /api/entries/move: Outer catch - Error processing request body or unknown:",
            error,
        );
        let errorMessage =
            "Internal Server Error during entry move request processing";
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
            message: "Failed to process move request at API level.",
            data: {
                details: errorMessage,
                stack: errorDetails,
            },
        });
    }
});