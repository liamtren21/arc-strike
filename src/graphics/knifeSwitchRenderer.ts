/**
 * ARC STRIKE // TESLA OVERLOAD: Industrial Knife Switch Lever Renderer
 * Heavy copper-and-ebonite double-pole knife switch with interactive physics slam.
 */

export interface KnifeSwitchBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function drawKnifeSwitch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  leverProgress: number, // 0 = fully open (up), 1 = fully closed (slammed into contacts)
  isHovered: boolean,
  isDisabled: boolean
): KnifeSwitchBounds {
  ctx.save();

  // 1. Polished Black Slate / Marble Mounting Base
  const baseGrad = ctx.createLinearGradient(x, y, x, y + h);
  baseGrad.addColorStop(0, '#262626');
  baseGrad.addColorStop(0.5, '#171717');
  baseGrad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(x, y, w, h);

  // Copper bevel edge around marble slab
  ctx.strokeStyle = isHovered && !isDisabled ? '#f59e0b' : '#78350f';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Corner brass mounting bolts
  const boltR = 3.5;
  const corners = [
    [x + 8, y + 8],
    [x + w - 8, y + 8],
    [x + 8, y + h - 8],
    [x + w - 8, y + h - 8],
  ];
  ctx.fillStyle = '#b45309';
  corners.forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, boltR, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Twin Vertical Copper Jaw Contacts (Top of switch)
  const pole1X = x + w * 0.32;
  const pole2X = x + w * 0.68;
  const contactY = y + 18;

  [pole1X, pole2X].forEach(px => {
    // Copper contact jaw blocks
    const jawGrad = ctx.createLinearGradient(px - 8, 0, px + 8, 0);
    jawGrad.addColorStop(0, '#9a3412');
    jawGrad.addColorStop(0.5, '#f97316');
    jawGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = jawGrad;
    ctx.fillRect(px - 7, contactY - 8, 14, 16);

    // Spring tension clamp slots
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(px - 2, contactY - 10, 4, 12);
  });

  // 3. Hinge Pivot Blocks (Bottom of switch)
  const hingeY = y + h - 18;
  [pole1X, pole2X].forEach(px => {
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.arc(px, hingeY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(px, hingeY, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Dual Copper Knife Blades & Insulated Ebonite Crossbar Handle
  // Angle: from -55 degrees (up / open) to 0 degrees (down / closed into jaws)
  const angle = (-55 * (1 - leverProgress)) * (Math.PI / 180);
  const bladeLen = hingeY - contactY;

  [pole1X, pole2X].forEach(px => {
    ctx.save();
    ctx.translate(px, hingeY);
    ctx.rotate(angle);

    // Copper blade
    const bGrad = ctx.createLinearGradient(-4, 0, 4, 0);
    bGrad.addColorStop(0, '#c2410c');
    bGrad.addColorStop(0.5, '#fdba74');
    bGrad.addColorStop(1, '#9a3412');
    ctx.fillStyle = bGrad;
    ctx.fillRect(-3.5, -bladeLen, 7, bladeLen);

    // Blade sharp tip taper
    ctx.beginPath();
    ctx.moveTo(-3.5, -bladeLen);
    ctx.lineTo(0, -bladeLen - 8);
    ctx.lineTo(3.5, -bladeLen);
    ctx.fill();

    ctx.restore();
  });

  // Crossbar & Heavy Insulated Handle
  const handleCx = (pole1X + pole2X) / 2;
  const tip1X = pole1X - Math.sin(angle) * bladeLen;
  const tip1Y = hingeY - Math.cos(angle) * bladeLen;
  const tip2X = pole2X - Math.sin(angle) * bladeLen;
  const tip2Y = hingeY - Math.cos(angle) * bladeLen;

  // Crossbar connecting the 2 blades
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tip1X, tip1Y);
  ctx.lineTo(tip2X, tip2Y);
  ctx.stroke();

  // Ebonite handle projecting outward
  const handleX = handleCx - Math.sin(angle) * (bladeLen + 14);
  const handleY = hingeY - Math.cos(angle) * (bladeLen + 14);

  const handleGrad = ctx.createLinearGradient(handleX - 16, handleY - 6, handleX + 16, handleY + 6);
  handleGrad.addColorStop(0, '#292524');
  handleGrad.addColorStop(0.5, '#57534e');
  handleGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = handleGrad;
  ctx.beginPath();
  ctx.roundRect(handleX - 18, handleY - 7, 36, 14, 4);
  ctx.fill();
  ctx.strokeStyle = isHovered && !isDisabled ? '#fbbf24' : '#78716c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Label below switch
  ctx.font = 'bold 9px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = leverProgress > 0.8 ? '#ef4444' : (isHovered ? '#fbbf24' : '#a8a29e');
  ctx.fillText(
    leverProgress > 0.8 ? '[ CLOSED - ENERGIZED ]' : (isDisabled ? 'CHARGING...' : 'SLAM KNIFE SWITCH TO FIRE'),
    handleCx,
    y + h - 4
  );

  ctx.restore();

  return { x, y, width: w, height: h };
}
