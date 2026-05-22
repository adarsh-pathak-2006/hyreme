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
  return resolveAssetUrl(url);
}
