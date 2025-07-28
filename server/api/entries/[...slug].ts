import { defineEventHandler, getRouterParams, readBody, createError, H3Error } from "h3"; // Make sure to import H3Error
import { getEntryBySlug, saveEntry } from "../../utils/entryUtils";

export default defineEventHandler(async (event) => {
    const method = event.node.req.method;

    if (method === "GET") {
        const params = getRouterParams(event); // Get all router parameters
        const slugParam = params?.slug; // This could be string | string[] | undefined

        console.log(`[entries/[...slug]] GET - Request URL: ${event.node.req.url}`);
        console.log(`[entries/[...slug]] GET - Params Slug:`, slugParam);

        // Validate slugParam and ensure it's an array
        if (!slugParam || (Array.isArray(slugParam) && slugParam.length === 0)) {
            console.warn("API GET: Slug is missing or empty. Returning 400.");
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Slug is required",
            });
        }

        // Ensure slugArray is always an array of strings.
        // If slugParam is a string (e.g., for a route like /api/entries/single-entry),
        // convert it to an array for consistent processing with .join().
        const slugArray: string[] = Array.isArray(slugParam) ? slugParam : [slugParam];

        // Join the array parts to form the full slug, handling potential empty string for root
        const fullSlug = slugArray.join("/");
        const targetSlug = fullSlug === "index" ? "" : fullSlug; // Normalize 'index' to '' for root

        console.log(`API GET: Attempting to fetch entry for slug: ${targetSlug}`);

        try {
            const entryData = await getEntryBySlug(targetSlug);
            console.log(`API GET: getEntryBySlug(${targetSlug}) completed.`);

            if (!entryData) {
                console.log(
                    `API GET: Entry not found for slug: ${targetSlug}. Returning 404.`,
                );
                throw createError({
                    statusCode: 404,
                    statusMessage: "Not Found",
                    message: "Entry not found",
                });
            }

            console.log(`API GET: Entry data fetched for slug: ${targetSlug}`);
            return entryData;
        } catch (error) {
            console.error(`API GET /api/entries/${targetSlug} caught error:`, error);
            // Check if the error is already an H3Error (i.e., one you intentionally threw)
            if (error instanceof H3Error) {
                throw error; // Re-throw the original H3Error
            }

            // For all other unexpected errors, generate a 500 Internal Server Error
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
                message: "Failed to process entry data for response.",
                data: {
                    details: errorMessage,
                    stack: errorDetails,
                },
            });
        }
    } else if (method === "PUT") {
        const params = getRouterParams(event);
        const slugParam = params?.slug; // This could be string | string[] | undefined

        try {
            console.log("API PUT: Raw slug param:", slugParam);

            // Validate slugParam and ensure it's an array
            if (!slugParam || (Array.isArray(slugParam) && slugParam.length === 0)) {
                console.warn("API PUT: No slug provided. Returning 400.");
                throw createError({
                    statusCode: 400,
                    statusMessage: "Bad Request",
                    message: "No slug provided",
                });
            }

            // Ensure slugArray is always an array of strings.
            const slugArray: string[] = Array.isArray(slugParam) ? slugParam : [slugParam];

            const fullSlug = slugArray.join("/");
            const data = await readBody(event); // Read the request body as JSON
            console.log(`API PUT: Received data for slug: ${fullSlug}`);

            // Normalize the data.slug if it's 'index' to match '' for root entry comparison
            const dataSlugNormalized = data.slug === "index" ? "" : data.slug;
            const fullSlugNormalized = fullSlug === "index" ? "" : fullSlug;

            if (dataSlugNormalized !== fullSlugNormalized) {
                console.warn(
                    `API PUT: Slug mismatch. Path: ${fullSlugNormalized}, Body: ${dataSlugNormalized}. Returning 400.`,
                );
                throw createError({
                    statusCode: 400,
                    statusMessage: "Bad Request",
                    message: "Slug in path does not match slug in body",
                });
            }

            // Use the saveEntry function from your server utility
            await saveEntry({ ...data, slug: fullSlugNormalized });
            console.log(`API PUT: Entry "${fullSlugNormalized}" saved successfully.`);
            return { success: true, message: "Entry saved successfully" };
        } catch (error: unknown) {
            console.error("API PUT Error:", error);
            // Apply the same H3Error re-throwing logic here if needed for PUT requests
            if (error instanceof H3Error) {
                throw error;
            }

            let errorMessage = "Internal server error";
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
                statusMessage: "Internal server error",
                message: "Failed to save entry.",
                data: {
                    details: errorMessage,
                    stack: errorDetails,
                },
            });
        }
    }

    // If the request method is not GET or PUT, return a 405 Method Not Allowed error
    throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
        message: `Method ${method} is not allowed for this route.`,
    });
});