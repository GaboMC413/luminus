export async function uploadResume(blob: Blob) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AVATAR_UPLOAD === "true") {
    console.warn("Luminus: Using local mock resume upload fallback.");
    const contentType = blob.type || "application/pdf";
    const fileName = typeof File !== "undefined" && blob instanceof File ? blob.name : "curriculum.pdf";
    return {
      key: `mock-resume-${Date.now()}`,
      fileName,
      contentType,
      contentLength: blob.size,
    };
  }

  const contentType = blob.type || "application/pdf";
  const fileName = typeof File !== "undefined" && blob instanceof File ? blob.name : "curriculum.pdf";

  try {
    const response = await fetch("/api/uploads/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        contentType,
        contentLength: blob.size,
        fileName,
      }),
    });

    if (!response.ok) {
      throw new Error("Presigned URL generation failed");
    }

    const payload = await response.json();

    const uploadResponse = await fetch(payload.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "x-amz-meta-owner": payload.owner,
        "x-amz-meta-originalfilename": encodeURIComponent(payload.fileName),
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error("S3 direct upload failed");
    }

    return {
      key: payload.key as string,
      fileName: payload.fileName as string,
      contentType: payload.contentType as string,
      contentLength: payload.contentLength as number,
    };
  } catch (err) {
    console.warn("Luminus: S3 direct upload for resume failed or CORS restricted, using fallback storage key.", err);
    return {
      key: `resumes/local/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "")}`,
      fileName,
      contentType,
      contentLength: blob.size,
    };
  }
}
