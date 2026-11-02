import { applyWatermark, hasWatermarkMarker, WATERMARK_MARKER, type WatermarkSettings } from "./watermark";
import { imageFileKind } from "./security-validation";

const MAX_IMAGE_EDGE = 1800;
const WEBP_QUALITY = 0.82;

export async function compressImageForUpload(file: File, watermark?: WatermarkSettings) {
  if (!imageFileKind(new Uint8Array(await file.slice(0, 16).arrayBuffer()))) throw new Error("Selecione uma imagem JPG, PNG, WebP ou GIF válida.");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) { bitmap.close(); throw new Error("Não foi possível processar a imagem."); }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const shouldWatermark =
    !!watermark?.enabled &&
    !!watermark.logo_url &&
    !hasWatermarkMarker(file.name);
  if (shouldWatermark && watermark) {
    await applyWatermark(canvas, watermark);
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
  });

  if (!blob) throw new Error("Não foi possível processar a imagem.");
  const base = file.name.replace(/\.[^.]+$/, "");
  const suffix = shouldWatermark ? WATERMARK_MARKER : "";
  return {
    file: new File([blob], `${base}${suffix}.webp`, { type: "image/webp" }),
    extension: "webp",
    watermarked: shouldWatermark,
  };
}
