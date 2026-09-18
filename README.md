# ARC STRIKE // TESLA OVERLOAD (1899 Colorado Springs)

> **Chain Jam Vol. 1 Original Submission**  
> Built for the **Chain Casino SDK (`ICasinoGameV2`)** on Base L2.  
> Certified **96.000000% Theoretical RTP** with **0-Wei Integer Drift**.

---

## ⚡ Concept & Gameplay

Step inside Nikola Tesla's experimental electrical laboratory in Colorado Springs, 1899. 

**ARC STRIKE** transforms high-voltage spark-gap physics into an electrifying, sequential multi-stage casino game. Players choose their power configuration, set their wager, and slam the heavy copper knife switch to energize the primary capacitor banks.

Twin monumental Tesla coils hum into resonance, discharging brilliant plasma arcs that leap across five sequentially tuned ceramic spark-gap insulators:
- **Stage 1 (100 kV - Ground Induction)**: $r_0 < 192$ (75.0% pass)
- **Stage 2 (250 kV - Resonator Peak)**: $r_1 < 160$ (62.5% pass)
- **Stage 3 (380 kV - Step-Up Arc)**: $r_2 < 128$ (50.0% pass)
- **Stage 4 (450 kV - Atmospheric Saturation)**: $r_3 < 96$ (37.5% pass)
- **Stage 5 (500 kV - TESLA OVERLOAD JACKPOT)**: $r_4 < 64$ (25.0% pass)

If an insulator punctures, dielectric breakdown triggers a ground fault with an authentic porcelain blowout pop. Clearing all five insulators unleashes the full 500 kV Tesla Overload Jackpot.

---

## 🎛️ Dual Generator Modes & Exact Paytables

Both generator modes are mathematically certified at exactly **96.000000% RTP** with zero wei drift across 2,048 state partitions:

| Insulators Cleared | Voltage (kV) | Probability | Mode 0 (AC Synchronous) | Mode 1 (DC Surge) |
| :--- | :--- | :--- | :--- | :--- |
| **0 Cleared** | 40 kV (Fail at 100 kV) | 25.000000% | 0.00x | 0.00x |
| **1 Cleared** | 100 kV (Fail at 250 kV) | 28.125000% | 0.00x | 0.00x |
| **2 Cleared** | 250 kV (Fail at 380 kV) | 23.437500% | 0.70x | 0.00x |
| **3 Cleared** | 380 kV (Fail at 450 kV) | 14.648438% | 1.80x | 1.00x |
| **4 Cleared** | 450 kV (Fail at 500 kV) | 6.591797% | 4.00x | 4.00x |
| **5 Cleared** | **500 kV (TESLA OVERLOAD)** | **2.197266%** | **12.2240x** | **25.0240x** |
| **CERTIFIED RTP** | | **100.000000%** | **96.000000%** | **96.000000%** |

---

## 🛠️ Technology & Architecture

- **Smart Contract**: [`contracts/ArcStrike.sol`](contracts/ArcStrike.sol) implements `ICasinoGameV2` with single-round VRF resolution, rejection sampling, and zero modulo bias.
- **Graphics Engine**: 100% Procedural Canvas 2D at 60 FPS:
  - Recursive midpoint displacement fractal plasma lightning with multi-layer volumetric bloom.
  - Heavy cast-iron and copper secondary Tesla coils with toroidal top discharge electrodes.
  - Antique brass galvanometer with physics spring-damped inertia needle.
  - Warm glowing neon-orange Nixie tubes for real-time kilovolt and multiplier telemetry.
  - Industrial double-pole knife switch with interactive slam physics.
  - Subtle arcade CRT scanline post-processing.
- **Audio Synthesis**: Built with Web Audio API (zero audio file assets required):
  - Solenoid snap and heavy metal knife switch slam.
  - Exponential pitch capacitor charge whine (120 Hz $\to$ 2.4 kHz).
  - Bandpass-filtered electrical spark discharge.
  - Porcelain blowout ground fault with 40 Hz sub-bass transient.
  - Harmonic major resonant chord on 500 kV Overload Jackpot.
- **Chain SDK**: Native integration with `@chain/casino-sdk` and official Chain Jam widget.

---

## 🧪 Verification & Local Testing

### 1. Analytical Mathematical RTP Proof
```powershell
npm run test:rtp
```
*Validates that total expected value equals target numerator 19,660,800 over 2,048 partitions with 0 wei drift.*

### 2. 100,000-Round Monte Carlo E2E Simulation
```powershell
npm run test:e2e
```
*Simulates 100,000 rounds across both modes to verify statistical convergence.*

### 3. Production Build
```powershell
npm run build
```

### 4. Local Development Server
```powershell
npm run dev
```
Navigate to `http://localhost:3304` to experience the 1899 Colorado Springs high-voltage laboratory.
