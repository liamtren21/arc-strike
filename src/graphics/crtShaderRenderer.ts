/**
 * ARC STRIKE // TESLA OVERLOAD: CRT Shader & Arcade Hazard Banner Renderer
 * Micro-scanlines, glass corner vignette, and sleek top emergency hazard ribbons.
 */

export function drawCrtPostProcessing(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();

  // 1. Horizontal Micro-Scanlines (1px alternating scanline layer at 10% opacity)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }

  // 2. CRT Curved Glass Corner Vignette
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.min(w, h) * 0.85);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // 3. Subtle outer arcade bezel border
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  ctx.restore();
}

/**
 * Draws non-intrusive sleek top emergency hazard ribbon
 */
export function drawArcAlertBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  title: string,
  subtitle: string,
  isVictory: boolean,
  frame: number
) {
  const bw = 460;
  const bh = 42;
  const bx = (w - bw) / 2;
  const by = 40;

  ctx.save();

  // Background box
  ctx.fillStyle = isVictory ? 'rgba(15, 23, 42, 0.94)' : 'rgba(69, 10, 10, 0.94)';
  ctx.fillRect(bx, by, bw, bh);

  // Border & glow
  const borderColor = isVictory ? '#22c55e' : '#ef4444';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);

  // Hazard warning chevron stripes
  const chevronW = 12;
  ctx.save();
  ctx.beginPath();
  ctx.rect(bx, by, bw, bh);
  ctx.clip();

  ctx.fillStyle = isVictory ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.2)';
  const offset = (frame * 1.2) % (chevronW * 2);
  for (let cx = bx - chevronW * 2 + offset; cx < bx + bw; cx += chevronW * 2) {
    ctx.beginPath();
    ctx.moveTo(cx, by);
    ctx.lineTo(cx + chevronW, by);
    ctx.lineTo(cx + chevronW - 6, by + bh);
    ctx.lineTo(cx - 6, by + bh);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Title Text
  ctx.font = 'bold 13px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isVictory ? '#4ade80' : '#fca5a5';
  ctx.fillText(title, w / 2, by + 14);

  // Subtitle Text
  ctx.font = '10px "Share Tech Mono", monospace';
  ctx.fillStyle = isVictory ? '#fef08a' : '#fecaca';
  ctx.fillText(subtitle, w / 2, by + 29);

  ctx.restore();
}
