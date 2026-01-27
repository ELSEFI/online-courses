import assetMap from '@/imports/assetMap';

/**
 * Smart utility to get course thumbnail and avoid unnecessary 404 errors in console.
 * @param thumbnail Raw thumbnail filename (e.g., 'course_13.jpg')
 * @param thumbnailUrl Full URL from backend or virtual field
 * @returns Correct URL to use in <img> src
 */
export const getCourseThumbnail = (thumbnail?: string, thumbnailUrl?: string): string => {
    const placeholder = assetMap['placeholder'] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

    // If no data at all, return placeholder
    if (!thumbnail && !thumbnailUrl) return placeholder;

    // Detect dummy filenames that will definitely 404 on Cloudinary (e.g., 'course_13.jpg', 'thumbnails/course_... ')
    const isDummy = thumbnail?.toLowerCase().startsWith('course_') ||
        thumbnailUrl?.toLowerCase().includes('/thumbnails/course_');

    if (isDummy) {
        return placeholder;
    }

    // Return the full URL if valid, otherwise fallback
    return thumbnailUrl || placeholder;
};
