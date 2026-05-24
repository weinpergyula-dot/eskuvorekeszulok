export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_UPLOAD_MB = 5;

/** Compress an image file using the Canvas API.
 *  Resizes to at most `maxDim` pixels on either side, then reduces JPEG
 *  quality until the file is under `targetMB`. Returns the original file
 *  unchanged when it is already small enough.
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

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.85;

      const attempt = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= targetBytes || quality <= 0.35) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
            } else {
              quality = Math.max(quality - 0.1, 0.35);
              attempt();
            }
          },
          "image/jpeg",
          quality,
        );
      };

      attempt();
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

/**
 * Convert a Supabase Storage public URL to the image-transform endpoint.
 * Only applied when NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS=true is set.
 *
 * /storage/v1/object/public/bucket/path
 *   → /storage/v1/render/image/public/bucket/path?width=W&quality=Q
 */
export function storageImageUrl(
  url: string | null | undefined,
  width: number,
  quality = 75,
): string {
  if (!url) return "";
  if (process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS !== "true") return url;
  if (!url.includes("/storage/v1/object/public/")) return url;
  const base = url.split("?")[0];
  return base.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")
    + `?width=${width}&quality=${quality}`;
}
