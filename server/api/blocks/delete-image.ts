import { defineEventHandler, readBody, createError, H3Event } from 'h3';
import { unlink, stat } from 'fs/promises';
import path from 'path';

/**
 * Handles the POST request to delete an image file.
 * Expects a JSON body with { fileName: string }.
 */
export default defineEventHandler(async (event: H3Event) => {
    // Ensure the request method is POST
    if (event.node.req.method !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed',
            data: { message: 'Only POST requests are allowed for this endpoint.' },
        });
    }

    console.log('API route hit: /api/blocks/delete-image');

    try {
        const { fileName } = await readBody(event); // Read the JSON body

        if (!fileName) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: { message: 'File name is required.' },
            });
        }

        // Construct the absolute path to the file in the public/images directory
        // In Nuxt/Nitro, process.cwd() should point to the project root
        const uploadDir = path.join(process.cwd(), 'public', 'images');
        const filePath = path.join(uploadDir, fileName);

        // SECURITY CHECK: Ensure the file path does not try to traverse out of the image's directory.
        // This is a critical step to prevent malicious deletion of arbitrary files on your server.
        if (!filePath.startsWith(uploadDir + path.sep)) {
            console.warn(`Attempted path traversal detected: ${filePath}`);
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: { message: 'Invalid file path detected.' },
            });
        }

        try {
            // Check if the file exists before attempting to delete
            await stat(filePath);
        } catch (e: unknown) {
            const error = e as NodeJS.ErrnoException;
            if (error.code === 'ENOENT') {
                // File wasn't found, but we still consider it "removed" from the block's perspective.
                // Return 200 OK as the desired state (file not present) is achieved.
                console.log(`File not found at ${filePath}, skipping deletion.`);
                return { message: 'File not found on server, but block data cleared.' };
            }
            throw error; // Re-throw other file system errors
        }

        // Delete the file
        await unlink(filePath);

        console.log(`File successfully deleted: ${filePath}`);
        return { message: 'File deleted successfully.' };
    } catch (error: any) {
        console.error('Error during image deletion (API route):', error);
        // Use createError for better error handling and client-side consumption
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error',
            data: { message: error.data?.message || error.message || 'An unexpected error occurred.' },
        });
    }
});