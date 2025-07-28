/**
 * Uploads an image file to the server.
 * @param file The image file to upload.
 * @param fileName The desired file name on the server.
 * @returns A promise that resolves to an object containing the URL and file name, or null if the upload fails.
 */
export async function uploadImageToServer(
    file: File,
    fileName: string,
): Promise<{ url: string; fileName: string } | null> {
    const formData = new FormData();
    formData.append("image", file, fileName);
    try {
        const response = await fetch("/api/blocks/upload-image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server upload failed:", errorData.message);
            return null;
        }

        const result = await response.json();
        return { url: result.url, fileName: result.fileName };
    } catch (error) {
        console.error("Error uploading image to server:", error);
        return null;
    }
}

/**
 * Deletes an image from the server.
 * @param fileName The name of the file to delete.
 * @returns A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deleteImageFromServer(fileName: string): Promise<boolean> {
    try {
        const response = await fetch("/api/blocks/delete-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server delete failed:", errorData.message);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error deleting image from server:", error);
        return false;
    }
}