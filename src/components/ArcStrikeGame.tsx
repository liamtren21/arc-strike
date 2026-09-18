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

interface LiveArc {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  intensity: number;
  isFault: boolean;
  life: number;
  maxLife: number;
}

export const ArcStrikeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleSysRef = useRef<PlasmaParticleSystem>(new PlasmaParticleSystem());
  const screenShakeRef = useRef<number>(0);
  const persistentArcsRef = useRef<LiveArc[]>([]);

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
    persistentArcsRef.current = [];

    // Slam switch lever shut
    setLeverProgress(1);
    screenShakeRef.current = 6.0;

    // Execute round
    const result: RoundResult = simulateStandaloneRound(mode, wager);

    // Capacitor charge sound
    arcAudio.playCapacitorWhine(1.0);

    const w = canvasRef.current?.width || 960;
    const h = canvasRef.current?.height || 540;
    const floorY = h - 90;
    const coilLeftToroid = { x: 85, y: floorY - 260 + 28 };
    const coilRightToroid = { x: w - 85, y: floorY - 260 + 28 };
    const positions = getInsulatorPositions(w, h);

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
          setAmbientFlash(1.2);
          screenShakeRef.current = 4.0;

          arcAudio.playArcSpark(1 + step * 0.15);

          // Add high-energy persistent arc from left coil
          persistentArcsRef.current.push({
            p1: coilLeftToroid,
            p2: { x: positions[step].electrodeX, y: positions[step].electrodeY },
            intensity: 1.0,
            isFault: false,
            life: 0,
            maxLife: 32,
          });

          // Add bridge arc from previous insulator
          if (step > 0) {
            persistentArcsRef.current.push({
              p1: { x: positions[step - 1].electrodeX, y: positions[step - 1].electrodeY },
              p2: { x: positions[step].electrodeX, y: positions[step].electrodeY },
              intensity: 1.1,
              isFault: false,
              life: 0,
              maxLife: 42,
            });
          }

          // Supporting arc from right coil on high voltage stages
          if (step >= 2) {
            persistentArcsRef.current.push({
              p1: coilRightToroid,
              p2: { x: positions[step].electrodeX, y: positions[step].electrodeY },
              intensity: 0.85,
              isFault: false,
              life: 0,
              maxLife: 30,
            });
          }

          particleSysRef.current.emitSparks(positions[step].electrodeX, positions[step].electrodeY, 24, false);
          step++;
        } else {
          // Ground Fault / Porcelain Blowout at this step
          setFaultStage(step);
          setAmbientFlash(2.0);
          screenShakeRef.current = 16.0;
          arcAudio.playBlowoutFault();

          // Violent fault arc from coil to faulty insulator
          persistentArcsRef.current.push({
            p1: coilLeftToroid,
            p2: { x: positions[step].electrodeX, y: positions[step].electrodeY },
            intensity: 1.3,
            isFault: true,
            life: 0,
            maxLife: 45,
          });

          // Violent ground blowout arc crashing down to floor
          persistentArcsRef.current.push({
            p1: { x: positions[step].electrodeX, y: positions[step].electrodeY },
            p2: { x: positions[step].electrodeX, y: floorY },
            intensity: 1.5,
            isFault: true,
            life: 0,
            maxLife: 50,
          });

          particleSysRef.current.emitSparks(positions[step].electrodeX, positions[step].electrodeY, 60, true);

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

        // Reset lever position with spring return
        setTimeout(() => setLeverProgress(0), 1000);

        const isWin = res.multiplierBps > 0;
        if (isWin) {
          setBalance(prev => prev + res.payoutUsdc);
          arcAudio.playOverloadJackpot();
          screenShakeRef.current = 12.0;

          if (res.cleared === 5) {
            confetti({
              particleCount: 150,
              spread: 90,
              origin: { y: 0.6 },
              colors: ['#38bdf8', '#f59e0b', '#c084fc', '#ffffff'],
            });
            setBannerInfo({
              title: '⚡ FULL TESLA OVERLOAD ACHIEVED! ⚡',
              subtitle: `5/5 INSULATORS WITHSTOOD HIGH TENSION • +$${res.payoutUsdc.toFixed(2)} USDC`,
              isVictory: true,
            });

            // Monumental Jackpot Storm Arcs
            persistentArcsRef.current.push({
              p1: coilLeftToroid,
              p2: { x: positions[0].electrodeX, y: positions[0].electrodeY },
              intensity: 1.2,
              isFault: false,
              life: 0,
              maxLife: 60,
            });
            persistentArcsRef.current.push({
              p1: coilRightToroid,
              p2: { x: positions[4].electrodeX, y: positions[4].electrodeY },
              intensity: 1.2,
              isFault: false,
              life: 0,
              maxLife: 60,
            });
          } else {
            setBannerInfo({
              title: `STAGE ${res.cleared} SURGE CLEARED!`,
              subtitle: `CIRCUIT SUSTAINED ${INSULATORS[res.cleared - 1].kv} kV • +$${res.payoutUsdc.toFixed(2)} USDC`,
              isVictory: true,
            });
          }
        } else {
          setBannerInfo({
            title: '⚠ DIELECTRIC BREAKDOWN: ARC FAULT ⚠',
            subtitle: `GROUND FAULT AT STAGE ${res.cleared + 1} • ENERGY GROUNDED TO EARTH`,
            isVictory: false,
          });
        }
      }, 500);
    };
  }, [isPlaying, balance, wager, mode]);

  // Main Canvas Render Loop
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

      // Ballistic Needle Inertia Easing for Galvanometer
      setCurrentKv(prev => {
        const diff = targetKv - prev;
        return Math.abs(diff) < 0.5 ? targetKv : prev + diff * 0.12;
      });

      // Ambient Flash Decay
      setAmbientFlash(prev => Math.max(0, prev * 0.86));

      // Reset canvas
      ctx.clearRect(0, 0, w, h);

      // Apply Spring-Damped Screen Shake Recoil to Entire Chamber
      ctx.save();
      if (screenShakeRef.current > 0.05) {
        const sx = (Math.random() - 0.5) * screenShakeRef.current * 1.5;
        const sy = (Math.random() - 0.5) * screenShakeRef.current * 1.5;
        ctx.translate(sx, sy);
        screenShakeRef.current *= 0.88;
      }

      // 1. Draw Atmospheric 1899 Laboratory & Monumental Tesla Coils
      drawTeslaLaboratory(ctx, w, h, frame, ambientFlash);

      // 2. Insulator Coordinates
      const positions = getInsulatorPositions(w, h);
      const coilLeftToroid = { x: 85, y: floorY - 260 + 28 };

      // 3. Render Persistent Live Plasma Electrical Arcs
      for (let i = persistentArcsRef.current.length - 1; i >= 0; i--) {
        const arc = persistentArcsRef.current[i];
        arc.life++;
        const currentIntensity = arc.intensity * (1 - arc.life / arc.maxLife);
        if (currentIntensity > 0.03) {
          drawPlasmaArc(ctx, arc.p1, arc.p2, currentIntensity, arc.isFault);
        }
        if (arc.life >= arc.maxLife) {
          persistentArcsRef.current.splice(i, 1);
        }
      }

      // Continuous subtle plasma link between cleared insulators
      if (clearedStages > 1) {
        for (let c = 0; c < clearedStages - 1; c++) {
          const p1 = { x: positions[c].electrodeX, y: positions[c].electrodeY };
          const p2 = { x: positions[c + 1].electrodeX, y: positions[c + 1].electrodeY };
          drawPlasmaArc(ctx, p1, p2, 0.35 + Math.sin(frame * 0.2 + c) * 0.1, false);
        }
      }

      // Idle Atmospheric Corona Crackles (Scene is always alive!)
      if (!isPlaying && frame % 40 < 4) {
        const targetIdx = Math.floor(Math.sin(frame * 0.1) * 2.5 + 2.5);
        const pTarget = positions[Math.max(0, Math.min(4, targetIdx))];
        drawPlasmaArc(
          ctx,
          coilLeftToroid,
          { x: pTarget.electrodeX, y: pTarget.electrodeY },
          0.28,
          false
        );
      }

      // 4. Draw 5 Ceramic Insulators with high-def sprites & live electrodes
      drawCeramicInsulators(ctx, positions, clearedStages, faultStage, evaluatingIndex, frame);

      // 5. Update & Draw Physics Particle System (Sparks + Smoke)
      particleSysRef.current.update(floorY, h - 175);
      particleSysRef.current.draw(ctx);

      // 6. Draw Master Victorian Instrument Switchboard with Tri-Meter Cluster
      drawGalvanometer(ctx, w / 2, 126, 44, currentKv, frame);

      // 7. Draw Top Arcade Telemetry & Glowing Nixie Tubes
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
      const swW = 94;
      const swH = 82;
      const swX = (w - swW) / 2;
      const swY = h - swH - 8;
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

      // 10. CRT Post-Processing Scanlines & Glass Vignette
      drawCrtPostProcessing(ctx, w, h);

      // Restore shake
      ctx.restore();

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
      {/* 1899 Industrial Cast-Iron Apparatus Housing */}
      <div className="w-full industrial-chassis border-4 border-[#29180c] rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.98)] overflow-hidden">
        
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
                <span>COLORADO SPRINGS EXPERIMENTAL STATION</span>
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

        {/* 16:9 High-Voltage Testing Chamber Viewport */}
        <div className="relative w-full border-y border-[#78350f]/70 bg-black">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            className="w-full h-auto block cursor-pointer"
          />
        </div>

        {/* Diegetic Industrial Control Switchboard Deck */}
        <div className="w-full bg-[#14100d] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-6 border-t-2 border-[#b45309]/50 shadow-inner">
          
          {/* Mode Selector: Heavy Industrial Dual-Throw Cam Switch */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" /> GENERATOR COUPLING
              </span>
              <span className="text-[10px] text-stone-500">HEAVY CAM SWITCH</span>
            </div>

            <div className="p-1.5 bg-[#090807] rounded-lg border border-[#442b17] shadow-inner flex gap-2">
              {/* AC Synchronous Position */}
              <button
                onClick={() => !isPlaying && setMode(VoltageMode.AC_SYNCHRONOUS)}
                disabled={isPlaying}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded text-xs font-black transition cursor-pointer flex items-center gap-2.5 border ${
                  mode === VoltageMode.AC_SYNCHRONOUS
                    ? 'bg-gradient-to-b from-[#0e2a47] to-[#081829] text-sky-200 border-sky-400/80 shadow-[inset_0_1px_2px_rgba(56,189,248,0.5),0_2px_8px_rgba(0,0,0,0.8)]'
                    : 'bg-[#18130f] text-stone-400 border-stone-800 hover:border-[#78350f]'
                }`}
              >
                {/* Cyan Faceted Pilot Light */}
                <span
                  className={`w-3 h-3 rounded-full border border-sky-300 ${
                    mode === VoltageMode.AC_SYNCHRONOUS
                      ? 'bg-sky-400 shadow-[0_0_10px_#38bdf8]'
                      : 'bg-stone-800'
                  }`}
                />
                <div className="text-left">
                  <div className="tracking-wide">AC SYNCHRONOUS</div>
                  <div className="text-[10px] text-stone-400 font-normal">0.7x – 12.2x JACKPOT</div>
                </div>
              </button>

              {/* DC Surge Position */}
              <button
                onClick={() => !isPlaying && setMode(VoltageMode.DC_SURGE)}
                disabled={isPlaying}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded text-xs font-black transition cursor-pointer flex items-center gap-2.5 border ${
                  mode === VoltageMode.DC_SURGE
                    ? 'bg-gradient-to-b from-[#3d1808] to-[#220d04] text-amber-200 border-amber-400/80 shadow-[inset_0_1px_2px_rgba(245,158,11,0.5),0_2px_8px_rgba(0,0,0,0.8)]'
                    : 'bg-[#18130f] text-stone-400 border-stone-800 hover:border-[#78350f]'
                }`}
              >
                {/* Amber Faceted Pilot Light */}
                <span
                  className={`w-3 h-3 rounded-full border border-amber-300 ${
                    mode === VoltageMode.DC_SURGE
                      ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                      : 'bg-stone-800'
                  }`}
                />
                <div className="text-left">
                  <div className="tracking-wide">DC SURGE</div>
                  <div className="text-[10px] text-amber-500 font-bold">1.0x – 25.0x JACKPOT</div>
                </div>
              </button>
            </div>
          </div>

          {/* Stake Selector: Stamped Milled Brass Token Rack */}
          <div className="flex flex-col gap-2 w-full md:w-auto items-center md:items-start">
            <div className="flex items-center justify-between w-full text-[11px] text-amber-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> STAKE TOKENS (USDC)
              </span>
              <span className="text-[10px] text-stone-500">MILLED COINS</span>
            </div>

            <div className="p-2 bg-[#090807] rounded-lg border border-[#442b17] shadow-inner flex items-center gap-2.5">
              {[0.1, 0.5, 1.0, 5.0, 10.0].map(val => (
                <button
                  key={val}
                  onClick={() => !isPlaying && setWager(val)}
                  disabled={isPlaying}
                  className={`w-11 h-11 rounded-full text-xs font-black transition cursor-pointer flex items-center justify-center select-none ${
                    wager === val
                      ? 'brass-coin-active font-extrabold'
                      : 'brass-coin-idle text-amber-300/80 hover:text-amber-200'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Master Energize Push Station with Hazard Chevrons */}
          <div className="w-full md:w-auto flex flex-col items-center">
            {/* Outer Die-Cast Housing with Hazard Stripes */}
            <div className="p-1.5 rounded-xl hazard-stripes shadow-2xl w-full md:w-56">
              <button
                onClick={triggerEngagement}
                disabled={isPlaying || balance < wager}
                className={`w-full py-4 px-4 text-xs sm:text-sm font-black rounded-lg uppercase tracking-widest transition cursor-pointer flex flex-col items-center justify-center select-none ${
                  isPlaying
                    ? 'industrial-slam-disabled text-stone-500 border border-stone-800'
                    : balance < wager
                    ? 'bg-red-950 text-red-300 border-2 border-red-700 cursor-not-allowed shadow-inner'
                    : 'industrial-slam-active text-stone-950 border-2 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-1.5 drop-shadow">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isPlaying ? 'ENERGIZED' : balance < wager ? 'INSUFFICIENT' : 'MASTER ENERGIZE'}</span>
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <span className="text-[9px] tracking-wider opacity-85 mt-0.5">
                  {isPlaying ? 'HIGH VOLTAGE ACTIVE' : 'SLAM TO ENGAGE'}
                </span>
              </button>
            </div>
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
