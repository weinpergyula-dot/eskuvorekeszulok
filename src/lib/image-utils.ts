export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_UPLOAD_MB = 5;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

const JPEG_QUALITY = 0.85;

/**
 * Compress an image file using the Canvas API.
 *
 * Strategy: keep quality fixed at 85% (visually lossless for photos) and
 * reduce pixel dimensions proportionally until the encoded file fits under
 * targetMB. Starts at maxDim on the longer side, then scales by 0.75× each
 * iteration. Returns the original file unchanged when already small enough.
 */
export async function compressImage(
  file: File,
  targetMB = 1,
  maxDim = 2000,
): Promise<File> {
  const targetBytes = targetMB * 1024 * 1024;
  if (file.size <= targetBytes) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Initial scale: longest side → maxDim
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const drawAndTest = (w: number, h: number) => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= targetBytes || w <= 400) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
            } else {
              // Still too large: shrink by 25% and retry, quality stays at 85%
              drawAndTest(Math.max(400, Math.round(w * 0.75)), Math.max(Math.round(400 * h / w), Math.round(h * 0.75)));
            }
          },
          "image/jpeg",
          JPEG_QUALITY,
        );
      };

      drawAndTest(width, height);
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

/**
 * Returns a URL that will be served by Next.js image optimization.
 * Supabase storage URLs are passed through the /_next/image endpoint
 * which resizes, converts to WebP, and caches the result on Vercel for free.
 *
 * Use this only for thumbnail display sizes — full-size lightboxes should
 * use the original URL directly.
 *
 * A minőség fixen 75: a Next 16 csak az `images.qualities` listán szereplő
 * értékeket engedi, ami beállítás nélkül épp `[75]` – bármi más 400-at ad.
 */
export function optimizedImageUrl(
  url: string | null | undefined,
  displayWidth: number,
): string {
  if (!url) return "";
  // Skip non-storage URLs and already-optimized URLs
  if (!url.includes("supabase") || url.startsWith("/_next/image")) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${nextImageWidth(displayWidth)}&q=75`;
}

/** Round up to the nearest Next.js allowed image width (deviceSizes / imageSizes). */
function nextImageWidth(px: number): number {
  const allowed = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920];
  return allowed.find((w) => w >= px) ?? 1920;
}
