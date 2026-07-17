import React, { useState, useEffect, useRef } from "react";
import { Activity, Heart, RefreshCw, Zap, ShieldAlert, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HeartRatePoint } from "../types";

// Web Bluetooth API declarations for standard GATT device syncing
interface BluetoothDevice {
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<any>;
    disconnect: () => void;
  };
  addEventListener: (type: string, listener: () => void) => void;
}

interface BluetoothRemoteGATTCharacteristic {
  value?: DataView;
  startNotifications: () => Promise<any>;
  stopNotifications: () => Promise<any>;
  addEventListener: (type: string, listener: (event: any) => void) => void;
  removeEventListener: (type: string, listener: (event: any) => void) => void;
}

interface WearableSyncProps {
  onHeartRateUpdate: (bpm: number) => void;
  onNotificationTrigger: (title: string, message: string, category: "wearable") => void;
}

export default function WearableSync({ onHeartRateUpdate, onNotificationTrigger }: WearableSyncProps) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBpm, setCurrentBpm] = useState<number | null>(null);
  const [simulationActive, setSimulationActive] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<"rest" | "warmup" | "cardio" | "peak">("warmup");
  const [hrHistory, setHrHistory] = useState<HeartRatePoint[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web Bluetooth: Request and connect to Heart Rate Monitor
  const connectBluetooth = async () => {
    setIsConnecting(true);
    setError(null);
    setSimulationActive(false);

    try {
      const bluetooth = (navigator as any).bluetooth;
      if (!bluetooth) {
        throw new Error("Web Bluetooth is not supported in this browser or iframe environment. Try the simulator below!");
      }

      const requestedDevice = await bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["battery_service"]
      });

      setDevice(requestedDevice);

      const server = await requestedDevice.gatt?.connect();
      if (!server) throw new Error("Could not connect to GATT server.");

      const service = await server.getPrimaryService("heart_rate");
      const char = await service.getCharacteristic("heart_rate_measurement");
      setCharacteristic(char);

      await char.startNotifications();
      char.addEventListener("characteristicvaluechanged", handleHeartRateNotification);

      onNotificationTrigger(
        "Wearable Paired!",
        `Successfully synced with ${requestedDevice.name || "heart rate monitor"}!`,
        "wearable"
      );

      // Listen for disconnection
      requestedDevice.addEventListener("gattserverdisconnected", () => {
        handleDisconnection();
      });

    } catch (err: any) {
      console.error("Bluetooth pairing failed:", err);
      setError(err.message || "Pairing failed. Ensure Bluetooth is enabled.");
      setSimulationActive(true); // Re-activate simulation as a fallback
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnection = () => {
    setDevice(null);
    setCharacteristic(null);
    setCurrentBpm(null);
    setError("Device disconnected.");
    setSimulationActive(true);
    onNotificationTrigger(
      "Wearable Disconnected",
      "GATT connection lost. Switched to wearable simulator.",
      "wearable"
    );
  };

  const disconnectBluetooth = async () => {
    if (characteristic) {
      try {
        await characteristic.stopNotifications();
        characteristic.removeEventListener("characteristicvaluechanged", handleHeartRateNotification);
      } catch (err) {
        console.error(err);
      }
    }
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setCharacteristic(null);
    setCurrentBpm(null);
    setSimulationActive(true);
  };

  // GATT parser for Heart Rate values
  const handleHeartRateNotification = (event: Event) => {
    const target = event.target as any;
    const value = target.value;
    if (!value) return;

    // Byte 0 contains flags
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x01;
    let bpmValue = 0;

    if (rate16Bits) {
      // 16-bit heart rate
      bpmValue = value.getUint16(1, true);
    } else {
      // 8-bit heart rate
      bpmValue = value.getUint8(1);
    }

    setCurrentBpm(bpmValue);
    onHeartRateUpdate(bpmValue);
  };

  // Simulated wearable generator
  useEffect(() => {
    if (!simulationActive) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    const generateBpm = () => {
      let base = 75;
      let range = 6;
      if (simulationSpeed === "rest") {
        base = 65;
        range = 4;
      } else if (simulationSpeed === "warmup") {
        base = 110;
        range = 10;
      } else if (simulationSpeed === "cardio") {
        base = 145;
        range = 15;
      } else if (simulationSpeed === "peak") {
        base = 175;
        range = 12;
      }

      const randomNoise = Math.floor(Math.random() * range) - range / 2;
      const bpm = Math.max(50, Math.min(220, base + randomNoise));
      setCurrentBpm(bpm);
      onHeartRateUpdate(bpm);
    };

    generateBpm();
    simIntervalRef.current = setInterval(generateBpm, 1500);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simulationActive, simulationSpeed]);

  // Keep historical HR data for visualization (last 30 seconds)
  useEffect(() => {
    if (currentBpm === null) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setHrHistory((prev) => {
      const next = [...prev, { time: now, bpm: currentBpm }];
      if (next.length > 25) {
        next.shift();
      }
      return next;
    });
  }, [currentBpm]);

  // Draw smooth animated pulse on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const bpm = currentBpm || 80;

      // Pulse wave drawing
      ctx.beginPath();
      ctx.strokeStyle = bpm > 140 ? "#f87171" : bpm > 110 ? "#fb923c" : "#f43f5e";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Shadow glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = bpm > 140 ? "rgba(248, 113, 113, 0.4)" : "rgba(244, 63, 94, 0.4)";

      for (let x = 0; x < width; x++) {
        // Generate ECG-like spikes based on heart rate
        let y = height / 2;

        const cycleWidth = (60 / bpm) * 120; // width of one heartbeat
        const relativeX = (x + offset) % cycleWidth;

        if (relativeX > 15 && relativeX < 20) {
          y -= 5; // P-wave
        } else if (relativeX >= 20 && relativeX < 23) {
          y += 10; // Q-dip
        } else if (relativeX >= 23 && relativeX < 27) {
          y -= 50; // R-spike
        } else if (relativeX >= 27 && relativeX < 31) {
          y += 35; // S-dip
        } else if (relativeX >= 31 && relativeX < 36) {
          y -= 8; // T-wave
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Speed of visual scroll proportional to heart rate
      offset += (bpm / 60) * 1.5;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentBpm]);

  // Determine current HR Zone
  const getHeartRateZone = (bpm: number) => {
    if (bpm < 100) return { name: "Resting / Recovery", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", desc: "Builds endurance, active recovery." };
    if (bpm < 120) return { name: "Warm Up (Zone 1)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", desc: "Prepares muscles, improves mobility." };
    if (bpm < 145) return { name: "Fat Burn (Zone 2)", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", desc: "Optimal fat utilization and cardio baseline." };
    if (bpm < 165) return { name: "Cardio Focus (Zone 3)", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", desc: "Improves aerobic capacity & lactic threshold." };
    return { name: "Peak Intensity (Zone 4)", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", desc: "Maximum oxygen capacity, short burst sprint power." };
  };

  const currentZone = currentBpm ? getHeartRateZone(currentBpm) : null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6" id="wearable-sync-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display tracking-tight">
            <Activity className="h-5 w-5 text-rose-500" />
            Wearable Sync & Pulse
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {device ? `Streaming from ${device.name}` : "Connect a BLE heart rate monitor or use the smart simulator."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {device ? (
            <button
              onClick={disconnectBluetooth}
              className="px-4 py-2 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl border border-rose-500/20 transition-all cursor-pointer"
              id="disconnect-wearable-btn"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectBluetooth}
              disabled={isConnecting}
              className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-600/10 border border-indigo-500/20 font-display"
              id="connect-wearable-btn"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                  Pairing...
                </>
              ) : (
                <>
                  <Cpu className="h-3.5 w-3.5 text-indigo-200" />
                  Connect Wearable
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-start gap-2 font-mono">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-semibold">Web Bluetooth Alert:</span> {error}
          </div>
        </div>
      )}

      {/* Heart Rate Display Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* BPM Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center py-5 bg-slate-950/60 rounded-2xl border border-slate-850 relative overflow-hidden">
          <AnimatePresence mode="popLayout">
            {currentBpm !== null ? (
              <motion.div
                key={currentBpm}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex flex-col items-center relative z-10"
              >
                <div className="relative">
                  <Heart className="h-20 w-20 text-rose-500 fill-rose-500/10 animate-pulse" />
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-black text-rose-400">
                    {currentBpm}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-2.5">BPM</span>
              </motion.div>
            ) : (
              <div className="text-slate-500 text-sm py-8 font-mono">Offline</div>
            )}
          </AnimatePresence>

          {/* Background subtle glowing effect */}
          <div className="absolute inset-0 bg-radial-gradient from-rose-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Real-time ECG Graph */}
        <div className="md:col-span-7 flex flex-col gap-2">
          <span className="text-[10px] font-bold font-mono text-slate-500 tracking-widest">LIVE PULSE WAVE</span>
          <div className="relative bg-slate-950 rounded-2xl border border-slate-850 h-28 overflow-hidden flex items-center">
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              className="w-full h-full opacity-90"
            />
            {/* Grid overlay lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Heart Rate Zone & Simulator Mode controls */}
      <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 pt-4 border-t border-slate-850">
        {/* Zone Badge */}
        {currentBpm && currentZone && (
          <div className={`p-4 rounded-xl border flex flex-col gap-1.5 flex-1 ${currentZone.color}`}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-bold tracking-tight">{currentZone.name}</span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed font-medium">{currentZone.desc}</p>
          </div>
        )}

        {/* Simulator controls */}
        {simulationActive && (
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 flex-1 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "6s" }} />
              Wearable Simulator Mode
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(["rest", "warmup", "cardio", "peak"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSimulationSpeed(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border cursor-pointer transition-all ${
                    simulationSpeed === mode
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                      : "bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                  id={`sim-${mode}-btn`}
                >
                  {mode === "rest" ? "At Rest" : mode === "warmup" ? "Warm Up" : mode === "cardio" ? "Cardio" : "Peak"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
