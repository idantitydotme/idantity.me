import type { H3Event } from 'h3';
import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import { writeFile, stat, mkdir } from 'fs/promises';
import path from 'path';

/**
 * Ensures a directory exists, creating it if it doesn't.
 * @param dir The path to the directory.
 */
async function ensureDirExists(dir: string): Promise<void> {
    try {
        await stat(dir);
    } catch (e: unknown) {
        const error = e as NodeJS.ErrnoException;
        if (error.code === 'ENOENT') {
            await mkdir(dir, { recursive: true });
        } else {
            throw error;
        }
    }
}

/**
 * Handles the POST request to upload an image file.
 * Expects multipart/form-data with an 'image' field.
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

    console.log('API route hit: /api/blocks/upload-image (Nitro Server)');

    // In Nuxt/Nitro, process.cwd() should point to the project root
    const uploadDir = path.join(process.cwd(), 'public', 'images');

    try {
        await ensureDirExists(uploadDir);

        // Read multipart form data. `readMultipartFormData` returns an array of parts.
        const formDataParts = await readMultipartFormData(event);

        const imageFilePart = formDataParts?.find(part => part.name === 'image');

        if (!imageFilePart || !imageFilePart.filename || !imageFilePart.data) {
            console.log('No image file found in form data or data is missing.');
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: { message: 'No image file uploaded or invalid file data.' },
            });
        }

        const originalFileName = imageFilePart.filename;
        const fileExtension = path.extname(originalFileName);
        const baseName = path.basename(originalFileName, fileExtension);

        // Sanitize the base name to prevent directory traversal or other issues.
        // This regex keeps alphanumeric, hyphen, underscore, and dot characters for the base name.
        const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-._]/g, '');

        // Construct the new filename without Date.now() prefix as per your original fix
        const newFileName = `${sanitizedBaseName}${fileExtension}`;

        if (!newFileName) {
            console.log('Sanitized filename is empty.');
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: { message: 'Invalid filename after sanitization.' },
            });
        }

        const filePath = path.join(uploadDir, newFileName);

        // `imageFilePart.data` is already a Buffer from `readMultipartFormData`
        await writeFile(filePath, imageFilePart.data);

        const imageUrl = `/images/${newFileName}`;
        console.log('Image uploaded successfully. URL:', imageUrl);

        return {
            url: imageUrl,
            fileName: newFileName,
        };
    } catch (error: any) {
        console.error('Error during image upload (API route catch block):', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error',
            data: { message: error.data?.message || error.message || 'An unexpected error occurred.' },
        });
    }
});