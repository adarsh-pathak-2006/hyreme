import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

// Configure Cloudinary dynamically using either CLOUDINARY_URL or individual API keys
const hasUrlConfig = !!env.CLOUDINARY_URL;
const hasKeysConfig =
  !!env.CLOUDINARY_CLOUD_NAME &&
  !!env.CLOUDINARY_API_KEY &&
  !!env.CLOUDINARY_API_SECRET;

if (hasUrlConfig) {
  cloudinary.config({
    cloudinary_api_url: env.CLOUDINARY_URL,
  });
} else if (hasKeysConfig) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Returns true if Cloudinary credentials are fully configured.
 */
export function isCloudinaryEnabled(): boolean {
  return hasUrlConfig || hasKeysConfig;
}

/**
 * Uploads a local file to Cloudinary cloud storage and returns its secure CDN URL.
 * Bypasses server bandwidth issues and streams directly from worldwide Edge CDNs!
 *
 * @param localFilePath Path to the file temporarily saved on the local server disk.
 * @param folder Target folder inside your Cloudinary account (e.g. 'hyreme').
 * @returns Object containing the secure cdn url and original public id.
 */
export async function uploadToCloudinary(
  localFilePath: string,
  folder: string = "hyreme",
  resourceType: "auto" | "video" | "raw" = "auto"
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryEnabled()) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const result = await cloudinary.uploader.upload(localFilePath, {
    folder,
    resource_type: resourceType,
    access_mode: "public",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Deletes an uploaded asset from Cloudinary to keep the cloud workspace organized.
 *
 * @param publicId The unique public ID returned from the upload call.
 * @param resourceType The resource type ('image', 'video', or 'raw' for PDFs).
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "video"
): Promise<void> {
  if (!isCloudinaryEnabled()) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}
