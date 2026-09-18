/**
 * ARC STRIKE // TESLA OVERLOAD: Galvanometer & Nixie Tube Gauge Cluster
 * Renders antique brass voltmeter dial, physics spring needle, glowing Nixie tubes, and arcade telemetry.
 */

export function drawGalvanometer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  currentKv: number,
  frame: number
) {
  ctx.save();

  // 1. Heavy Cast-Brass Outer Bezel with 3D Bevel
  const bezelGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  bezelGrad.addColorStop(0, '#d97706');
  bezelGrad.addColorStop(0.3, '#f59e0b');
  bezelGrad.addColorStop(0.6, '#b45309');
  bezelGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = bezelGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Decorative brass screws around bezel
  ctx.fillStyle = '#78350f';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const sx = cx + Math.cos(a) * (radius - 5);
    const sy = cy + Math.sin(a) * (radius - 5);
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner iron flange
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 10, 0, Math.PI * 2);
  ctx.fill();

  // 2. Aged Parchment / Ivory Dial Face
  const dialR = radius - 12;
  const dialGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, dialR);
  dialGrad.addColorStop(0, '#fef3c7');
  dialGrad.addColorStop(0.8, '#fde68a');
  dialGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = dialGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, dialR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Dial Arc Scale: from 135 deg to 405 deg (270 degree sweep)
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const scaleR = dialR * 0.75;

  // Background arc line
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, scaleR, startAngle, endAngle);
  ctx.stroke();

  // Red danger zone (450 kV to 500 kV)
  const dangerStart = startAngle + (endAngle - startAngle) * (450 / 500);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, scaleR, dangerStart, endAngle);
  ctx.stroke();

  // Scale Tick Marks (0 to 500 kV)
  for (let kv = 0; kv <= 500; kv += 50) {
    const pct = kv / 500;
    const angle = startAngle + (endAngle - startAngle) * pct;
    const isMajor = kv % 100 === 0;

    const r1 = scaleR - (isMajor ? 8 : 4);
    const r2 = scaleR + 2;

    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;

    ctx.strokeStyle = kv >= 450 ? '#dc2626' : '#451a03';
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (isMajor) {
      const textR = scaleR - 16;
      const tx = cx + Math.cos(angle) * textR;
      const ty = cy + Math.sin(angle) * textR;
      ctx.font = 'bold 8px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = kv >= 450 ? '#b91c1c' : '#451a03';
      ctx.fillText(`${kv}`, tx, ty);
    }
  }

  // Dial Center Branding
  ctx.font = 'bold 7px "Cinzel", serif';
  ctx.fillStyle = '#78350f';
  ctx.textAlign = 'center';
  ctx.fillText('KILOVOLTS', cx, cy - 18);
  ctx.font = '6px "Share Tech Mono", monospace';
  ctx.fillText('TESLA ELECTROSTATIC', cx, cy - 10);

  // 4. Galvanometer Pointer Needle (Spring-Damped with Voltage Jitter)
  const clampedKv = Math.max(0, Math.min(500, currentKv));
  const jitter = currentKv > 100 ? (Math.random() - 0.5) * 2.5 : 0;
  const needlePct = Math.max(0, Math.min(1, (clampedKv + jitter) / 500));
  const needleAngle = startAngle + (endAngle - startAngle) * needlePct;

  const needleLen = dialR * 0.85;
  const nx = cx + Math.cos(needleAngle) * needleLen;
  const ny = cy + Math.sin(needleAngle) * needleLen;

  // Needle shadow
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy + 2);
  ctx.lineTo(nx + 2, ny + 2);
  ctx.stroke();

  // Main fine steel needle
  ctx.strokeStyle = clampedKv >= 450 ? '#ef4444' : '#1c1917';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.stroke();

  // Needle jewel cap
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();

  // Glass Specular Sheen across dial
  const glassGrad = ctx.createLinearGradient(cx - dialR, cy - dialR, cx + dialR, cy + dialR);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  glassGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
  glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, dialR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a single glowing Nixie tube
 */
export function drawNixieTube(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  char: string,
  isActive: boolean,
  frame: number
) {
  ctx.save();

  // 1. Dark background socket
  ctx.fillStyle = '#09090b';
  ctx.fillRect(x, y, w, h);

  // Bakelite base collar
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(x, y + h - 8, w, 8);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(x + 2, y + h - 6, w - 4, 2);

  // 2. Wire Anode Mesh Grid inside glass tube
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let mx = x + 3; mx < x + w - 3; mx += 3) {
    ctx.beginPath();
    ctx.moveTo(mx, y + 3);
    ctx.lineTo(mx, y + h - 9);
    ctx.stroke();
  }

  // 3. Glowing Neon Orange Numeral Filament
  if (isActive) {
    const flicker = Math.sin(frame * 0.3 + x) * 0.08 + 0.92;

    // Outermost atmospheric orange glow
    ctx.font = 'bold 22px "VT323", "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = `rgba(249, 115, 22, ${0.35 * flicker})`;
    ctx.fillText(char, x + w / 2, y + (h - 8) / 2);

    // Mid neon orange core
    ctx.fillStyle = `rgba(251, 146, 60, ${0.85 * flicker})`;
    ctx.fillText(char, x + w / 2, y + (h - 8) / 2);

    // Inner hot yellow filament
    ctx.fillStyle = `rgba(254, 240, 138, ${1.0 * flicker})`;
    ctx.fillText(char, x + w / 2, y + (h - 8) / 2);
  } else {
    // Dormant unlit filament
    ctx.font = 'bold 22px "VT323", "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#292524';
    ctx.fillText(char, x + w / 2, y + (h - 8) / 2);
  }

  // 4. Glass Envelope Specular Highlight
  const glassGrad = ctx.createLinearGradient(x, y, x + w, y);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  glassGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.05)');
  glassGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
  glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(x, y, w, h - 8);

  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.restore();
}

/**
 * Draws the arcade top telemetry bar & Nixie cluster
 */
export function drawTopArcadeTelemetry(
  ctx: CanvasRenderingContext2D,
  w: number,
  credits: number,
  modeName: string,
  rtpBadge: string,
  voltageKv: number,
  multiplier: number,
  frame: number
) {
  // Top bar background
  ctx.fillStyle = 'rgba(10, 10, 12, 0.92)';
  ctx.fillRect(0, 0, w, 36);

  // Border brass rule
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 36, w, 2);

  // Left: 1UP & Credits
  ctx.font = 'bold 12px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('1UP', 18, 18);
  ctx.fillStyle = '#fef08a';
  ctx.fillText(`$${credits.toFixed(2)} USDC`, 50, 18);

  // Center: Voltage Mode & Certified RTP
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(modeName, w / 2 - 60, 18);
  ctx.fillStyle = '#22c55e';
  ctx.fillText(`[${rtpBadge}]`, w / 2 + 70, 18);

  // Right: Quick stats
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`${Math.round(voltageKv)} kV | ${multiplier.toFixed(2)}x`, w - 18, 18);

  // Nixie Tube Displays under telemetry (Left: Voltage, Right: Multiplier)
  const kvStr = Math.round(voltageKv).toString().padStart(3, '0');
  const multStr = multiplier.toFixed(2).padStart(5, '0') + 'X';

  // Voltage Nixie Display Box
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(18, 44, 90, 48);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 44, 90, 48);
  for (let i = 0; i < 3; i++) {
    drawNixieTube(ctx, 22 + i * 28, 48, 24, 40, kvStr[i], true, frame);
  }

  // Multiplier Nixie Display Box
  const multBoxW = 145;
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(w - multBoxW - 18, 44, multBoxW, 48);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(w - multBoxW - 18, 44, multBoxW, 48);
  for (let i = 0; i < multStr.length; i++) {
    drawNixieTube(ctx, w - multBoxW - 14 + i * 23, 48, 20, 40, multStr[i], true, frame);
  }
}
