export async function uploadResume(blob: Blob) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AVATAR_UPLOAD === "true") {
    console.warn("Luminus: Using local mock resume upload fallback.");
    const mockUrl = URL.createObjectURL(blob);
    return {
      key: `mock-resume-${Date.now()}`,
      publicUrl: mockUrl,
    };
  }

  const contentType = blob.type || "application/pdf";
  const response = await fetch("/api/uploads/resume", {
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
    throw new Error(payload.message ?? "No pudimos preparar la subida del archivo.");
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
    throw new Error("No pudimos subir el archivo a S3.");
  }

  return {
    key: payload.key as string,
    publicUrl: payload.publicUrl as string,
  };
}
