/** True when Next.js can optimize this URL (must match `next.config` remotePatterns). */
export function isFirebaseStorageUrl(url: string): boolean {
  try {
    return new URL(url).hostname === "firebasestorage.googleapis.com";
  } catch {
    return false;
  }
}
