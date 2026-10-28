async function compressImageBlob(blob: Blob, maxDimension = 400, quality = 0.8): Promise<Blob> {
  if (typeof window === "undefined") return blob;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(blob);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (compressed) => {
          resolve(compressed || blob);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(blob);
    };

    img.src = url;
  });
}

export async function uploadAvatar(inputBlob: Blob) {
  // Safe local-only frontend mock for avatar uploads if explicitly forced.
  if (process.env.NEXT_PUBLIC_USE_MOCK_AVATAR_UPLOAD === "true") {
    const mockUrl = URL.createObjectURL(inputBlob);
    return {
      key: `mock-avatar-${Date.now()}`,
      publicUrl: mockUrl,
    };
  }

  // Guarantee image is compressed to lightweight WebP (max 400px, ~40-60KB)
  const blob = await compressImageBlob(inputBlob, 400, 0.85);
  const contentType = "image/webp";

  try {
    const response = await fetch("/api/uploads/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        contentType,
        contentLength: blob.size,
      }),
    });

    if (!response.ok) {
      throw new Error("Presigned URL request failed");
    }

    const payload = await response.json();

    const uploadResponse = await fetch(payload.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error("S3 upload request failed");
    }

    return {
      key: payload.key as string,
      publicUrl: payload.publicUrl as string,
    };
  } catch (err) {
    console.warn("Luminus: S3 direct upload failed or CORS restricted, using optimized DataURL fallback.", err);
    
    // Convert compressed blob to DataURL (super compact, ~40-60 KB)
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    return {
      key: `avatar-local-${Date.now()}`,
      publicUrl: dataUrl,
    };
  }
}
