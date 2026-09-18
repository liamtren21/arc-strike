import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Info, Zap, ShieldAlert, Radio, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  VoltageMode,
  INSULATORS,
  MULTIPLIERS_BPS,
  RoundResult,
  simulateStandaloneRound,
} from '../engine/arcEngine';
import { arcAudio } from '../audio/arcAudioEngine';
import { assetLoader } from '../graphics/assetLoader';
import {
  drawTeslaLaboratory,
  getInsulatorPositions,
  drawCeramicInsulators,
} from '../graphics/teslaCoilRenderer';
import {
  PlasmaParticleSystem,
  drawPlasmaArc,
} from '../graphics/plasmaLightningRenderer';
import {
  drawGalvanometer,
  drawTopArcadeTelemetry,
} from '../graphics/gaugeClusterRenderer';
import {
  drawKnifeSwitch,
  KnifeSwitchBounds,
} from '../graphics/knifeSwitchRenderer';
import {
  drawCrtPostProcessing,
  drawArcAlertBanner,
} from '../graphics/crtShaderRenderer';

export const ArcStrikeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleSysRef = useRef<PlasmaParticleSystem>(new PlasmaParticleSystem());

  // Game States
  const [mode, setMode] = useState<VoltageMode>(VoltageMode.AC_SYNCHRONOUS);
  const [wager, setWager] = useState<number>(1.0);
  const [balance, setBalance] = useState<number>(100.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Animation & Visual States
  const [leverProgress, setLeverProgress] = useState<number>(0);
  const [currentKv, setCurrentKv] = useState<number>(40);
  const [targetKv, setTargetKv] = useState<number>(40);
  const [multiplierDisplay, setMultiplierDisplay] = useState<number>(0);
  const [evaluatingIndex, setEvaluatingIndex] = useState<number>(-1);
  const [clearedStages, setClearedStages] = useState<number>(0);
  const [faultStage, setFaultStage] = useState<number | null>(null);
  const [ambientFlash, setAmbientFlash] = useState<number>(0);
  const [bannerInfo, setBannerInfo] = useState<{ title: string; subtitle: string; isVictory: boolean } | null>(null);
  const [isHoveringSwitch, setIsHoveringSwitch] = useState<boolean>(false);

  const switchBoundsRef = useRef<KnifeSwitchBounds | null>(null);
  const animFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Preload High-Definition Sprites
  useEffect(() => {
    assetLoader.preloadAssets({
      tesla_coil: '/assets/tesla_coil.png',
      insulator: '/assets/insulator.png',
      knife_switch: '/assets/knife_switch.png',
    });
  }, []);

  // Toggle Audio Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    arcAudio.setMuted(nextMuted);
  };

  // Trigger Round Execution
  const triggerEngagement = useCallback(() => {
    if (isPlaying || balance < wager) return;

    arcAudio.startAmbientHum();
    arcAudio.playKnifeSwitch();

    // Deduct wager
    setBalance(prev => Math.max(0, prev - wager));
    setIsPlaying(true);
    setClearedStages(0);
    setFaultStage(null);
    setBannerInfo(null);
    setMultiplierDisplay(0);
    setEvaluatingIndex(-1);

    // Slam switch lever shut
    setLeverProgress(1);

    // Execute round
    const result: RoundResult = simulateStandaloneRound(mode, wager);

    // Capacitor charge sound
    arcAudio.playCapacitorWhine(1.0);

    // Sequential Insulator Testing Sequence
    let step = 0;
    const stepInterval = setInterval(() => {
      if (step < 5) {
        setEvaluatingIndex(step);

        if (step < result.cleared) {
          // Safe arc discharge across insulator
          setClearedStages(step + 1);
          const nextKv = INSULATORS[step].kv;
          setTargetKv(nextKv);
          setMultiplierDisplay(MULTIPLIERS_BPS[mode][step + 1] / 10000);
          setAmbientFlash(1.0);

          arcAudio.playArcSpark(1 + step * 0.15);

          const w = canvasRef.current?.width || 960;
          const h = canvasRef.current?.height || 540;
          const positions = getInsulatorPositions(w, h);
          particleSysRef.current.emitSparks(positions[step].electrodeX, positions[step].electrodeY, 16, false);

          step++;
        } else {
          // Ground Fault / Porcelain Blowout at this step
          setFaultStage(step);
          setAmbientFlash(1.6);
          arcAudio.playBlowoutFault();

          const w = canvasRef.current?.width || 960;
          const h = canvasRef.current?.height || 540;
          const positions = getInsulatorPositions(w, h);
          particleSysRef.current.emitSparks(positions[step].electrodeX, positions[step].electrodeY, 45, true);

          clearInterval(stepInterval);
          finishRound(result);
        }
      } else {
        // Full Tesla Overload Jackpot!
        clearInterval(stepInterval);
        finishRound(result);
      }
    }, 450);

    const finishRound = (res: RoundResult) => {
      setTimeout(() => {
        setIsPlaying(false);
        setEvaluatingIndex(-1);
        setLeverProgress(0);

        if (res.payoutUsdc > 0) {
          setBalance(prev => prev + res.payoutUsdc);
        }

        if (res.isJackpot) {
          arcAudio.playOverloadJackpot();
          setBannerInfo({
            title: '⚡ FULL 500kV TESLA OVERLOAD JACKPOT! ⚡',
            subtitle: `MAXIMUM VOLTAGE REACHED! AWARDED: +$${res.payoutUsdc.toFixed(2)} USDC (${res.multiplier.toFixed(2)}x)`,
            isVictory: true,
          });
          confetti({
            particleCount: 90,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#67e8f9', '#c084fc', '#fef08a', '#ffffff'],
          });
        } else if (res.payoutUsdc > 0) {
          setBannerInfo({
            title: '⚡ DIELECTRIC SUSTAINED — PARTIAL HARVEST ⚡',
            subtitle: `CLEARED ${res.cleared}/5 INSULATORS | PAYOUT: +$${res.payoutUsdc.toFixed(2)} USDC (${res.multiplier.toFixed(2)}x)`,
            isVictory: true,
          });
        } else {
          setBannerInfo({
            title: '⚠ ARC FAULT DETECTED: INSULATOR PUNCTURED ⚠',
            subtitle: `DIELECTRIC BREAKDOWN AT STAGE ${res.faultStage! + 1} (${INSULATORS[res.faultStage!].name}) | 0.00x`,
            isVictory: false,
          });
        }
      }, 300);
    };
  }, [isPlaying, balance, wager, mode]);

  // Main 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mounted = true;

    const render = () => {
      if (!mounted) return;
      frameCountRef.current++;
      const frame = frameCountRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const floorY = h - 90;

      // Smooth lerp voltage needle
      setCurrentKv(prev => prev + (targetKv - prev) * 0.12);

      // Fade ambient lightning flash
      setAmbientFlash(prev => Math.max(0, prev * 0.88));

      // 1. Draw Tesla Lab Background & High-Def Dual Coils
      drawTeslaLaboratory(ctx, w, h, frame, ambientFlash);

      // 2. Insulator Coordinates
      const positions = getInsulatorPositions(w, h);

      // 3. Draw Active Arcs between Coil and Insulators
      if (isPlaying) {
        // Arc from Left Tesla Coil toroid to active electrode
        const coilLeftToroid = { x: 80, y: floorY - 240 + 20 };
        const activeTarget = evaluatingIndex >= 0 ? positions[Math.min(evaluatingIndex, 4)] : null;

        if (activeTarget) {
          const targetPt = { x: activeTarget.electrodeX, y: activeTarget.electrodeY };
          const isFault = faultStage === evaluatingIndex;
          drawPlasmaArc(ctx, coilLeftToroid, targetPt, 1.0, isFault);

          // If ground fault, arc jumps from electrode down to bench/floor
          if (isFault) {
            const groundPt = { x: activeTarget.electrodeX, y: floorY };
            drawPlasmaArc(ctx, targetPt, groundPt, 1.2, true);
          }
        }

        // Draw chain arcs between previously cleared insulators
        for (let i = 0; i < clearedStages - 1; i++) {
          const p1 = { x: positions[i].electrodeX, y: positions[i].electrodeY };
          const p2 = { x: positions[i + 1].electrodeX, y: positions[i + 1].electrodeY };
          drawPlasmaArc(ctx, p1, p2, 0.75, false);
        }
      }

      // 4. Draw 5 Ceramic Insulators with high-def sprites
      drawCeramicInsulators(ctx, positions, clearedStages, faultStage, evaluatingIndex, frame);

      // 5. Update & Draw Physics Particle System
      particleSysRef.current.update(floorY);
      particleSysRef.current.draw(ctx);

      // 6. Draw Antique Brass Galvanometer (Voltmeter Dial)
      drawGalvanometer(ctx, w / 2, 142, 50, currentKv, frame);

      // 7. Draw Top Arcade Telemetry & Nixie Tubes
      const modeTitle = mode === VoltageMode.AC_SYNCHRONOUS ? 'AC SYNCHRONOUS' : 'DC SURGE';
      drawTopArcadeTelemetry(
        ctx,
        w,
        balance,
        modeTitle,
        '96.0000% RTP',
        currentKv,
        multiplierDisplay,
        frame
      );

      // 8. Draw Industrial Knife Switch Lever
      const swW = 92;
      const swH = 80;
      const swX = (w - swW) / 2;
      const swY = h - swH - 10;
      switchBoundsRef.current = drawKnifeSwitch(
        ctx,
        swX,
        swY,
        swW,
        swH,
        leverProgress,
        isHoveringSwitch,
        isPlaying
      );

      // 9. Draw Top Hazard Banner (if settled)
      if (bannerInfo) {
        drawArcAlertBanner(ctx, w, bannerInfo.title, bannerInfo.subtitle, bannerInfo.isVictory, frame);
      }

      // 10. CRT Post-Processing Scanlines & Vignette
      drawCrtPostProcessing(ctx, w, h);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      mounted = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, mode, balance, targetKv, currentKv, ambientFlash, clearedStages, faultStage, evaluatingIndex, multiplierDisplay, leverProgress, isHoveringSwitch, bannerInfo]);

  // Handle Canvas Mouse Interaction for Knife Switch
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !switchBoundsRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const b = switchBoundsRef.current;
    const hovered = mouseX >= b.x && mouseX <= b.x + b.width && mouseY >= b.y && mouseY <= b.y + b.height;
    setIsHoveringSwitch(hovered);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !switchBoundsRef.current || isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const b = switchBoundsRef.current;
    if (mouseX >= b.x && mouseX <= b.x + b.width && mouseY >= b.y && mouseY <= b.y + b.height) {
      triggerEngagement();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-5xl mx-auto font-mono select-none">
      {/* Victorian Steampunk Machine Chassis Bezel */}
      <div className="w-full bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-4 border-[#3f200c] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden">
        
        {/* Engraved Brushed-Brass Header Plaque */}
        <div className="w-full flex items-center justify-between py-2.5 px-5 bg-gradient-to-r from-[#29180c] via-[#4a2e16] to-[#29180c] border-b-2 border-[#b45309] shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500/20 border border-amber-500/60 rounded shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#fef08a] tracking-widest font-['Cinzel',serif] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                ARC STRIKE • 1899 TESLA OVERLOAD
              </h1>
              <p className="text-[11px] text-amber-400/90 font-['Share_Tech_Mono'] flex items-center gap-2">
                <span>HIGH-VOLTAGE DIELECTRIC SYSTEM</span>
                <span>•</span>
                <span className="text-green-400 font-bold">CERTIFIED 96.0000% RTP</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 bg-[#1c120c] hover:bg-[#382012] text-amber-300 border border-[#78350f] rounded shadow transition cursor-pointer active:scale-95"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c120c] hover:bg-[#382012] text-amber-300 border border-[#78350f] rounded text-xs font-bold transition cursor-pointer active:scale-95 shadow"
            >
              <Info className="w-4 h-4" />
              <span>RULES & RTP</span>
            </button>
          </div>
        </div>

        {/* 16:9 Canvas Viewport */}
        <div className="relative w-full border-y border-[#78350f]/60 bg-black">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            className="w-full h-auto block cursor-pointer"
          />
        </div>

        {/* Diegetic Industrial Control Console */}
        <div className="w-full bg-gradient-to-b from-[#1c120c] via-[#140c08] to-[#0c0806] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5 border-t border-[#78350f]/60">
          
          {/* Mode Selector (Heavy Industrial Toggle Switch Style) */}
          <div className="flex flex-col gap-1.5 w-full md:w-auto">
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" /> GENERATOR COUPLING
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => !isPlaying && setMode(VoltageMode.AC_SYNCHRONOUS)}
                disabled={isPlaying}
                className={`relative px-4 py-2.5 text-xs font-black rounded-lg border-2 transition cursor-pointer flex-1 md:flex-none flex items-center gap-2 ${
                  mode === VoltageMode.AC_SYNCHRONOUS
                    ? 'bg-gradient-to-b from-sky-900 to-sky-950 text-sky-200 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                    : 'bg-[#18110b] text-stone-400 border-[#4a2e16] hover:border-[#78350f]'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${mode === VoltageMode.AC_SYNCHRONOUS ? 'bg-sky-400 shadow-[0_0_8px_#38bdf8]' : 'bg-stone-700'}`} />
                <span>AC SYNCHRONOUS (0.7x – 12.2x)</span>
              </button>

              <button
                onClick={() => !isPlaying && setMode(VoltageMode.DC_SURGE)}
                disabled={isPlaying}
                className={`relative px-4 py-2.5 text-xs font-black rounded-lg border-2 transition cursor-pointer flex-1 md:flex-none flex items-center gap-2 ${
                  mode === VoltageMode.DC_SURGE
                    ? 'bg-gradient-to-b from-amber-900 to-amber-950 text-amber-200 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-[#18110b] text-stone-400 border-[#4a2e16] hover:border-[#78350f]'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${mode === VoltageMode.DC_SURGE ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-stone-700'}`} />
                <span>DC SURGE (1.0x – 25.0x JACKPOT)</span>
              </button>
            </div>
          </div>

          {/* Stamped Milled Brass Token Stake Selector */}
          <div className="flex flex-col gap-1.5 w-full md:w-auto items-center md:items-start">
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> STAKE TOKENS (USDC)
            </span>
            <div className="flex items-center gap-2">
              {[0.1, 0.5, 1.0, 5.0, 10.0].map(val => (
                <button
                  key={val}
                  onClick={() => !isPlaying && setWager(val)}
                  disabled={isPlaying}
                  className={`w-11 h-11 rounded-full text-xs font-black border-2 transition cursor-pointer flex items-center justify-center shadow-lg active:scale-95 ${
                    wager === val
                      ? 'bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] text-stone-950 border-[#fff] shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105'
                      : 'bg-gradient-to-b from-[#382012] via-[#24140a] to-[#140c08] text-amber-200 border-[#78350f] hover:border-amber-400'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Massive Master Energize Industrial Push Plate */}
          <div className="w-full md:w-auto">
            <button
              onClick={triggerEngagement}
              disabled={isPlaying || balance < wager}
              className={`w-full md:w-52 py-3.5 px-6 text-sm font-black rounded-xl border-2 uppercase tracking-widest transition shadow-2xl cursor-pointer ${
                isPlaying
                  ? 'bg-stone-900 text-stone-500 border-stone-800 cursor-not-allowed'
                  : balance < wager
                  ? 'bg-red-950 text-red-300 border-red-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#ea580c] via-[#f59e0b] to-[#ea580c] text-stone-950 border-[#fef08a] hover:brightness-115 active:scale-95 shadow-[0_0_25px_rgba(249,115,22,0.6)]'
              }`}
            >
              {isPlaying ? '⚡ ENERGIZED ⚡' : balance < wager ? 'INSUFFICIENT FUNDS' : '⚡ MASTER ENERGIZE ⚡'}
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Rules & Mathematical Proof Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500/80 rounded-xl max-w-2xl w-full p-6 text-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-900/60 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-amber-300 font-['Cinzel',serif]">
                  ARC STRIKE: MATHEMATICAL SPECIFICATION & RTP PROOF
                </h2>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-stone-400 hover:text-white text-lg font-bold px-2 py-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-['Share_Tech_Mono'] leading-relaxed">
              <p>
                <strong className="text-amber-400">ARC STRIKE // TESLA OVERLOAD</strong> is an original on-chain
                casino game built for the <strong>Chain Casino SDK (ICasinoGameV2)</strong>. Resolution is strictly governed by 5 independent random bytes drawn from a Base L2 Verifiable Random Function (VRF) seed over 2,048 state partitions.
              </p>

              <div className="border border-stone-800 rounded p-3 bg-stone-950/60">
                <h3 className="font-bold text-amber-400 mb-2 text-sm">SPARK-GAP DIELECTRIC STAGES:</h3>
                <ul className="space-y-1.5 text-stone-300">
                  <li>• <strong>Stage 1 (100 kV)</strong>: $r_0 &lt; 192$ (75.0% pass) — Initial Ground Induction</li>
                  <li>• <strong>Stage 2 (250 kV)</strong>: $r_1 &lt; 160$ (62.5% pass) — Primary Resonator Peak</li>
                  <li>• <strong>Stage 3 (380 kV)</strong>: $r_2 &lt; 128$ (50.0% pass) — Secondary Step-Up Arc</li>
                  <li>• <strong>Stage 4 (450 kV)</strong>: $r_3 &lt; 96$ (37.5% pass) — Atmospheric Saturation</li>
                  <li>• <strong>Stage 5 (500 kV)</strong>: $r_4 &lt; 64$ (25.0% pass) — FULL TESLA OVERLOAD JACKPOT</li>
                </ul>
              </div>

              <div className="border border-stone-800 rounded p-3 bg-stone-950/60">
                <h3 className="font-bold text-amber-400 mb-2 text-sm">EXACT CERTIFIED PAYTABLE & ZERO-WEI DRIFT:</h3>
                <div className="grid grid-cols-2 gap-3 text-stone-300">
                  <div>
                    <span className="text-sky-400 font-bold block mb-1">MODE 0: AC SYNCHRONOUS</span>
                    <div>0 Cleared: 0.00x</div>
                    <div>1 Cleared: 0.00x</div>
                    <div>2 Cleared: 0.70x</div>
                    <div>3 Cleared: 1.80x</div>
                    <div>4 Cleared: 4.00x</div>
                    <div className="text-amber-400 font-bold">5 Cleared: 12.2240x (Jackpot)</div>
                    <div className="mt-1 text-green-400 font-bold">RTP: 96.000000% (0 drift)</div>
                  </div>
                  <div>
                    <span className="text-amber-400 font-bold block mb-1">MODE 1: DC SURGE</span>
                    <div>0 Cleared: 0.00x</div>
                    <div>1 Cleared: 0.00x</div>
                    <div>2 Cleared: 0.00x</div>
                    <div>3 Cleared: 1.00x</div>
                    <div>4 Cleared: 4.00x</div>
                    <div className="text-amber-400 font-bold">5 Cleared: 25.0240x (Jackpot)</div>
                    <div className="mt-1 text-green-400 font-bold">RTP: 96.000000% (0 drift)</div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-stone-400">
                Solidity Contract: <code className="text-amber-300">contracts/ArcStrike.sol</code> • SDK Interface: <code className="text-amber-300">ICasinoGameV2</code> • Zero Modulo Bias.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
