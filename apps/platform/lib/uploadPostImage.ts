/**
 * Helper to process, compress and upload feed post images to AWS S3.
 *
 * Rules:
 * 1. Takes user image (JPG, PNG, WebP) up to 15MB.
 * 2. In-browser processing: Resizes to max 1600px, strips EXIF/GPS metadata via Canvas.
 * 3. Converts to image/webp and guarantees output file size is strictly < 1 MB.
 * 4. Requests S3 presigned URL and uploads directly to AWS S3 (feed/ folder).
 */

const MAX_INPUT_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB initial input limit
const MAX_OUTPUT_FILE_SIZE_BYTES = 1024 * 1024; // Strictly 1 MB S3 limit
const MAX_DIMENSION = 1600; // Crisp on high-DPI/Retina screens without bloat

export function validatePostImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No se seleccionó ningún archivo." };
  }

  // Reject SVG for security (XSS prevention) and non-image files
  if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Formato no permitido. Por favor selecciona una imagen JPG, PNG o WebP.",
    };
  }

  if (file.size > MAX_INPUT_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "La imagen es demasiado pesada (máximo 15 MB para procesar).",
    };
  }

  return { valid: true };
}

/**
 * In-browser image processing using HTML5 Canvas:
 * - Resizes proportionally if dimensions exceed 1600px.
 * - Strips EXIF metadata.
 * - Converts to image/webp with adaptive compression loop to ensure < 1 MB.
 */
export async function processAndCompressPostImage(
  file: File,
  targetMaxDimension = MAX_DIMENSION
): Promise<Blob> {
  if (typeof window === "undefined") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate proportional dimensions capped at targetMaxDimension
      if (width > targetMaxDimension || height > targetMaxDimension) {
        if (width > height) {
          height = Math.round((height * targetMaxDimension) / width);
          width = targetMaxDimension;
        } else {
          width = Math.round((width * targetMaxDimension) / height);
          height = targetMaxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No se pudo inicializar el contexto de imagen del navegador."));
        return;
      }

      // High quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      // Iterative compression quality loop to guarantee < 1 MB
      const qualitySteps = [0.85, 0.75, 0.65, 0.50, 0.35];

      const tryExportWebp = (qualityIndex: number): Promise<Blob> => {
        return new Promise((res, rej) => {
          const quality = qualitySteps[qualityIndex];
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                rej(new Error("Error al convertir la imagen a WebP."));
                return;
              }

              // If strictly < 1 MB or reached lowest quality step, accept
              if (blob.size <= MAX_OUTPUT_FILE_SIZE_BYTES || qualityIndex >= qualitySteps.length - 1) {
                res(blob);
              } else {
                // Try next lower quality step
                try {
                  const nextBlob = await tryExportWebp(qualityIndex + 1);
                  res(nextBlob);
                } catch (e) {
                  res(blob);
                }
              }
            },
            "image/webp",
            quality
          );
        });
      };

      try {
        const finalBlob = await tryExportWebp(0);
        resolve(finalBlob);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      reject(new Error("No se pudo leer la imagen seleccionada."));
    };

    img.src = objectUrl;
  });
}

export interface UploadPostImageResult {
  publicUrl: string;
  key: string;
  sizeBytes: number;
}

/**
 * Compresses the image in the browser and uploads it directly to S3 via presigned URL.
 */
export async function uploadPostImage(
  file: File,
  onStatusChange?: (status: string) => void,
  onProgress?: (percent: number) => void
): Promise<UploadPostImageResult> {
  // 1. Initial Validation
  const validation = validatePostImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Archivo inválido");
  }

  // 2. Mock mode support
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    onStatusChange?.("Subiendo imagen...");
    onProgress?.(30);
    await new Promise((r) => setTimeout(r, 300));
    onProgress?.(70);
    await new Promise((r) => setTimeout(r, 200));
    onProgress?.(100);
    const mockUrl = URL.createObjectURL(file);
    return {
      publicUrl: mockUrl,
      key: `mock-feed-${Date.now()}`,
      sizeBytes: file.size,
    };
  }

  // 3. Compress & convert to WebP in browser
  onStatusChange?.("Subiendo imagen...");
  onProgress?.(15);
  const webpBlob = await processAndCompressPostImage(file);
  onProgress?.(35);

  if (webpBlob.size > MAX_OUTPUT_FILE_SIZE_BYTES) {
    throw new Error(
      `La imagen no pudo reducirse a menos de 1 MB (pesa ${(webpBlob.size / (1024 * 1024)).toFixed(2)} MB).`
    );
  }

  // 4. Request Presigned Upload URL from our backend
  onProgress?.(45);
  const presignRes = await fetch("/api/uploads/post-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      contentType: "image/webp",
      contentLength: webpBlob.size,
    }),
  });

  if (!presignRes.ok) {
    const errorData = await presignRes.json().catch(() => null);
    throw new Error(
      errorData?.message || `Error al solicitar autorización de subida (${presignRes.status})`
    );
  }

  const { uploadUrl, key, publicUrl } = await presignRes.json();

  if (!uploadUrl) {
    throw new Error("Respuesta inválida del servidor de almacenamiento.");
  }

  // 5. Upload binary directly using presigned PUT with progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", "image/webp");
    xhr.setRequestHeader("Cache-Control", "public, max-age=31536000, immutable");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        // Maps 45% -> 95%
        const uploadPercent = Math.round((event.loaded / event.total) * 50);
        onProgress?.(45 + uploadPercent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else if (xhr.status === 403) {
        reject(new Error("No se pudo autorizar la subida de la imagen (403)."));
      } else {
        reject(new Error("No se pudo completar la subida de la imagen. Por favor intenta nuevamente."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Error de conexión al subir la imagen."));
    };

    xhr.send(webpBlob);
  });

  onStatusChange?.("Completado");
  return {
    publicUrl,
    key,
    sizeBytes: webpBlob.size,
  };
}
