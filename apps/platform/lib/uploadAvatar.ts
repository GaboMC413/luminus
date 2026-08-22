export async function uploadAvatar(blob: Blob) {
  // Safe local-only frontend mock for avatar uploads if explicitly forced.
  if (process.env.NEXT_PUBLIC_USE_MOCK_AVATAR_UPLOAD === "true") {
    const mockUrl = URL.createObjectURL(blob);
    return {
      key: `mock-avatar-${Date.now()}`,
      publicUrl: mockUrl,
    };
  }

  const contentType = blob.type || "image/webp";

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
    console.warn("Luminus: S3 direct upload failed or CORS restricted, using DataURL fallback.", err);
    
    // Convert blob to DataURL so profile photo always works gracefully
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
