export type WatermarkPosition =
  | "top-left" | "top-center" | "top-right"
  | "center"
  | "bottom-left" | "bottom-center" | "bottom-right";

export type WatermarkSettings = {
  enabled: boolean;
  logo_url: string;
  position: WatermarkPosition;
  margin: number;   // % of the shortest edge (0–20)
  size: number;     // % of image width (5–50)
  opacity: number;  // 0–1
};

export const defaultWatermark: WatermarkSettings = {
  enabled: false,
  logo_url: "",
  position: "bottom-right",
  margin: 3,
  size: 18,
  opacity: 0.7,
};

export const WATERMARK_MARKER = "-wm";

export function hasWatermarkMarker(filename: string) {
  return /-wm(\.[a-z0-9]+)?$/i.test(filename);
}

let cachedLogo: { url: string; bitmap: ImageBitmap } | null = null;

async function loadLogo(url: string): Promise<ImageBitmap | null> {
  if (cachedLogo?.url === url) return cachedLogo.bitmap;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    cachedLogo = { url, bitmap };
    return bitmap;
  } catch {
    return null;
  }
}

export async function applyWatermark(
  canvas: HTMLCanvasElement,
  settings: WatermarkSettings,
): Promise<void> {
  if (!settings.enabled || !settings.logo_url) return;
  const logo = await loadLogo(settings.logo_url);
  if (!logo) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const targetW = Math.max(16, Math.round((canvas.width * settings.size) / 100));
  const scale = targetW / logo.width;
  const targetH = Math.round(logo.height * scale);
  const margin = Math.round((Math.min(canvas.width, canvas.height) * settings.margin) / 100);

  let x = 0, y = 0;
  const [vert, horiz] = settings.position.split("-") as [string, string | undefined];
  if (vert === "top") y = margin;
  else if (vert === "bottom") y = canvas.height - targetH - margin;
  else y = Math.round((canvas.height - targetH) / 2);

  if (!horiz || horiz === "center") x = Math.round((canvas.width - targetW) / 2);
  else if (horiz === "left") x = margin;
  else if (horiz === "right") x = canvas.width - targetW - margin;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, settings.opacity));
  ctx.drawImage(logo, x, y, targetW, targetH);
  ctx.restore();
}
