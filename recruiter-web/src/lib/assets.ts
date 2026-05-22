"use client";

import { getApiOrigin } from "@/lib/api";

export function resolveAssetUrl(url?: string) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${getApiOrigin()}${url}`;
  }

  return `${getApiOrigin()}/${url}`;
}

export function buildPlayableVideoUrl(url?: string) {
  const resolved = resolveAssetUrl(url);
  if (!resolved) {
    return null;
  }

  const apiOrigin = getApiOrigin();

  if (!resolved.startsWith(`${apiOrigin}/uploads/`)) {
    return resolved;
  }

  const filename = resolved.split("/uploads/")[1]?.split("?")[0];
  if (!filename) {
    return resolved;
  }

  return `${apiOrigin}/api/uploads/play/${encodeURIComponent(filename)}`;
}
