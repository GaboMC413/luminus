export async function uploadAvatar(blob: Blob) {
  // Safe local-only frontend mock for avatar uploads.
  // This avoids failing requests during local development when AWS/S3 credentials are not set up.
  if (process.env.NEXT_PUBLIC_USE_MOCK_AVATAR_UPLOAD === "true") {
    console.warn("Luminus: Using local mock avatar upload fallback.");
    const mockUrl = URL.createObjectURL(blob);
    return {
      key: `mock-avatar-${Date.now()}`,
      publicUrl: mockUrl,
    };
  }

  const contentType = blob.type || "image/webp";
  const response = await fetch("/api/uploads/avatar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      contentType,
      contentLength: blob.size,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? "No pudimos preparar la subida de la imagen.");
  }

  const uploadResponse = await fetch(payload.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("No pudimos subir la imagen a S3.");
  }

  return {
    key: payload.key as string,
    publicUrl: payload.publicUrl as string,
  };
}
