const MAX_IMAGE_EDGE = 1800;
const WEBP_QUALITY = 0.82;

export async function compressImageForUpload(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return { file, extension: file.name.split(".").pop() || "jpg" };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { file, extension: file.name.split(".").pop() || "jpg" };

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
  });

  if (!blob) return { file, extension: file.name.split(".").pop() || "jpg" };
  return {
    file: new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }),
    extension: "webp",
  };
}