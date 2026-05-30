export async function uploadAvatar(blob: Blob) {
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
