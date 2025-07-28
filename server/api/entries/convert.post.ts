import { defineEventHandler, readBody, createError } from "h3";
import { convertEntryTemplate } from "../../utils/entryUtils";
import { EntryType } from "#shared-types/Entry";

// Define the expected request body for this API route
interface ConvertEntryRequest {
    entryId: string;
    targetEntryType: EntryType;
}

/**
 * Handles POST requests to convert a entry's template.
 * Expects a JSON body with `entryId` and `targetEntryType`.
 */
export default defineEventHandler(async (event) => {
    try {
        const { entryId, targetEntryType }: ConvertEntryRequest = await readBody(event);

        console.log(
            `[entries/convert] POST - Entry ID: ${entryId}, Target Entry Type: ${targetEntryType}`,
        );

        if (!entryId || !targetEntryType) {
            console.warn(
                "API POST /convert: Missing entryId or targetEntryType in request body. Returning 400.",
            );
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Missing entryId or targetEntryType in request body.",
            });
        }

        // Validate entryType against known enum values to prevent invalid inputs
        if (!Object.values(EntryType).includes(targetEntryType)) {
            console.warn(
                `API POST /convert: Invalid targetEntryType: ${targetEntryType}. Returning 400.`,
            );
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: `Invalid targetEntryType: ${targetEntryType}`,
            });
        }

        // Call the server-side utility to perform the template conversion
        const updatedEntry = await convertEntryTemplate(entryId, targetEntryType);

        console.log(
            `API POST /convert: Entry template converted successfully for ID: ${entryId}`,
        );
        // Return the updated entry data
        return { message: "Entry template converted successfully", entry: updatedEntry };
    } catch (error) {
        console.error("API POST /convert: Error converting entry template:", error);

        let errorMessage = "Internal server error during conversion.";
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

        // Throw a structured error using createError
        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: errorMessage,
            data: {
                details: errorMessage,
                stack: errorDetails,
            },
        });
    }
});