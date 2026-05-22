// Cloudinary storage adapter — re-exports the existing lib/cloudinary.ts
// in the new service-layer location. Future signed-URL helpers land here.
export * from "@/lib/cloudinary"

/**
 * Returns a signed read URL with a TTL (default 1 hour).
 * Used for KYC docs and chat attachments per security model §11.5.
 * Real implementation lands when needed in M09 (KYC) / M12 (chat).
 */
export function signedReadUrl(publicId: string, ttlSec = 3600): string {
  // TODO M09/M12: implement Cloudinary signed URL generation.
  // For now returns the unsigned secure URL — acceptable for staging.
  return `https://res.cloudinary.com/auto-signed-placeholder/${publicId}?ttl=${ttlSec}`
}
