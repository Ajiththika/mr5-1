import * as THREE from "three";

const CHALK = "rgba(248, 246, 240, 0.94)";
const CHALK_DIM = "rgba(248, 246, 240, 0.72)";

export interface ChalkBoardContent {
  title?: string;
  lines: string[];
  footer?: string;
}

export function drawChalkBoard(
  canvas: HTMLCanvasElement,
  content: ChalkBoardContent,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const padX = 72;
  let y = 56;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.direction = "ltr";

  if (content.title) {
    ctx.font = "600 44px Georgia, 'Palatino Linotype', 'Times New Roman', serif";
    ctx.fillStyle = CHALK;
    wrapText(ctx, content.title, padX, y, w - padX * 2, 52);
    y += measureWrappedHeight(ctx, content.title, w - padX * 2, 52) + 28;

    ctx.strokeStyle = "rgba(248, 246, 240, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(w - padX, y);
    ctx.stroke();
    y += 40;
  }

  ctx.font = "400 36px Georgia, 'Palatino Linotype', 'Times New Roman', serif";
  ctx.fillStyle = CHALK;

  for (const line of content.lines) {
    if (!line.trim()) {
      y += 24;
      continue;
    }
    wrapText(ctx, line, padX, y, w - padX * 2, 48);
    y += measureWrappedHeight(ctx, line, w - padX * 2, 48) + 16;
    if (y > h - 80) break;
  }

  if (content.footer && y < h - 60) {
    y += 12;
    ctx.font = "italic 400 30px Georgia, 'Palatino Linotype', serif";
    ctx.fillStyle = CHALK_DIM;
    wrapText(ctx, content.footer, padX, y, w - padX * 2, 42);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}

function measureWrappedHeight(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 1;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      line = word;
      lines += 1;
    } else {
      line = test;
    }
  }
  return lines * lineHeight;
}

export function createChalkBoardTexture(content: ChalkBoardContent): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  drawChalkBoard(canvas, content);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}
