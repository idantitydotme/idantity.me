import { defineEventHandler, readBody, createError } from "h3";
import { createEntryFromTemplate, doesEntryExist } from "../../utils/entryUtils";
import { EntryType } from "#shared-types/Entry";

/**
 * This handler will respond to POST requests to /api/entries/create
 */
export default defineEventHandler(async (event) => {
    console.log(
        "API POST /api/entries/create: Request received for new entry creation.",
    );

    try {
        const { slug, title, type } = await readBody(event);

        if (!slug || typeof slug !== "string" || slug.trim() === "") {
            console.warn(
                "API POST /api/entries/create: Invalid or missing slug in request body. Throwing 400.",
            );
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Entry slug is required.",
            });
        }

        if (!Object.values(EntryType).includes(type)) {
            console.warn(
                `API POST /api/entries/create: Invalid entryType '${type}'. Throwing 400.`,
            );
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Invalid entry type provided.",
            });
        }

        console.log(
            `API POST /api/entries/create: Attempting to create entry with slug: ${slug}, title: ${title}, type: ${type}`,
        );

        // Use the dedicated doesEntryExist function for clarity and direct boolean check
        const exists = await doesEntryExist(slug);
        if (exists) {
            console.warn(
                `API POST /api/entries/create: Entry with slug '${slug}' already exists. Throwing 409.`,
            );
            throw createError({
                statusCode: 409, // 409 Conflict status
                statusMessage: "Conflict",
                message: `A entry with slug '${slug}' already exists.`,
            });
        }

        // Call the server-side utility to create the new entry from the template and save it
        const newEntryData = await createEntryFromTemplate(slug, title, type);

        console.log(
            `API POST /api/entries/create: Entry '${slug}' created and saved successfully.`,
        );

        // Return the newly created entry data to the client with a 201 Created status
        event.node.res.statusCode = 201; // Manually set status code for 201 Created
        return newEntryData; // h3 automatically serializes to JSON
    } catch (error) {
        console.error(
            "API POST /api/entries/create: Error during entry creation:",
            error,
        );

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
            message: "Failed to create new entry.",
            data: {
                details: errorMessage,
                stack: errorDetails,
            },
        });
    }
});