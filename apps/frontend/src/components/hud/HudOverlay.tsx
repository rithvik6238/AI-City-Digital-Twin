"use client";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import useCityStore from '@/stores/cityStore';

export default function HudOverlay() {
  const [time, setTime] = useState('');

  // Initialize with deterministic random-like values or simply static numbers for now to avoid hydration mismatch and impurity errors
  const [powerBarHeights] = useState<number[]>([
    45, 60, 30, 80, 50, 75, 40, 90, 65, 35,
    55, 85, 25, 70, 48, 95, 38, 82, 52, 68
  ]);

  const traffic = useCityStore((state) => state.traffic);
  const weather = useCityStore((state) => state.weather);
  const power = useCityStore((state) => state.power);
  const alerts = useCityStore((state) => state.alerts);
  const prediction = useCityStore((state) => state.prediction);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }) + '.' + now.getMilliseconds().toString().padStart(3, '0'));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between font-mono text-sm">

      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 rounded-xl flex gap-6"
        >
          <div>
            <div className="text-cyan-500/50 text-xs">SYS.TIME</div>
            <div className="text-cyan-300 text-lg">{time}</div>
          </div>
          <div>
            <div className="text-cyan-500/50 text-xs">AI.STATUS</div>
            <div className="text-green-400 text-lg tracking-widest">ONLINE</div>
          </div>
        </motion.div>

        {prediction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-4 rounded-xl border-orange-500/50"
          >
             <div className="text-orange-500/50 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                AI PREDICTION
             </div>
             <div className="text-orange-400 font-bold uppercase">{prediction.prediction}</div>
             <div className="text-orange-500/70 text-xs mt-1">PROBABILITY: {(prediction.probability * 100).toFixed(1)}%</div>
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex justify-between items-stretch flex-1 py-6 gap-6 pointer-events-none">

        {/* Left Panel - Feed */}
        <div className="w-80 flex flex-col gap-4 pointer-events-auto">
          <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col">
            <div className="text-cyan-500/50 text-xs mb-4 border-b border-cyan-500/20 pb-2">INCIDENT FEED</div>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
              {alerts.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg"
                >
                  <div className="text-red-400 font-bold text-xs flex justify-between">
                    <span>{alert.event.replace('_', ' ').toUpperCase()}</span>
                    <span>{alert.camera}</span>
                  </div>
                  <div className="text-red-200/70 text-xs mt-1">LOC: {alert.location}</div>
                  <div className="text-red-500/50 text-[10px] mt-2 text-right">
                    CONFIDENCE: {(alert.confidence * 100).toFixed(0)}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl">
             <div className="text-cyan-500/50 text-xs mb-2">METEOROLOGICAL</div>
             {weather ? (
                <div className="grid grid-cols-2 gap-2 text-cyan-300">
                   <div>
                     <span className="text-cyan-500/50 text-xs block">COND</span>
                     {weather.condition.toUpperCase()}
                   </div>
                   <div>
                     <span className="text-cyan-500/50 text-xs block">TEMP</span>
                     {weather.temperature}°C
                   </div>
                   <div>
                     <span className="text-cyan-500/50 text-xs block">WIND</span>
                     {weather.wind_speed} KM/H
                   </div>
                </div>
             ) : <div className="text-cyan-500/30">AWAITING SENSOR DATA...</div>}
          </div>
        </div>

        {/* Right Panel - Metrics */}
        <div className="w-80 flex flex-col gap-4 pointer-events-auto">
          <div className="glass-panel p-4 rounded-xl">
            <div className="text-cyan-500/50 text-xs mb-4">TRAFFIC NETWORK</div>
            {traffic ? (
                <div>
                   <div className="flex justify-between items-end mb-2">
                       <span className="text-cyan-300 text-2xl">{traffic.overall_density}%</span>
                       <span className="text-cyan-500/70 text-xs uppercase">{traffic.trend}</span>
                   </div>
                   <div className="w-full bg-cyan-950 rounded-full h-1 overflow-hidden">
                       <motion.div
                          className="h-full bg-cyan-400"
                          animate={{ width: `${traffic.overall_density}%` }}
                       />
                   </div>
                </div>
            ) : <div className="text-cyan-500/30">AWAITING SAT LINK...</div>}
          </div>

          <div className="glass-panel p-4 rounded-xl flex-1">
            <div className="text-cyan-500/50 text-xs mb-4">POWER GRID</div>
            {power ? (
                <div className="flex flex-col gap-4">
                   <div className="flex justify-between text-cyan-300">
                      <span>{power.grid.toUpperCase()}</span>
                      <span className={power.status === 'warning' ? 'text-orange-400 animate-pulse' : 'text-green-400'}>
                        {power.status.toUpperCase()}
                      </span>
                   </div>
                   <div className="relative h-32 flex items-end gap-1">
                      {/* Fake graph bars */}
                      {powerBarHeights.map((h, i) => (
                         <motion.div
                           key={i}
                           className="flex-1 bg-cyan-500/20 rounded-t-sm"
                           animate={{ height: `${h}%` }}
                           transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                         />
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#020617] opacity-50" />
                   </div>
                   <div className="text-right text-cyan-500/50 text-xs mt-2">USAGE: {power.usage} MW</div>
                </div>
            ) : <div className="text-cyan-500/30">AWAITING TELEMETRY...</div>}
          </div>
        </div>

      </div>

      {/* Bottom Bar - Controls */}
      <div className="flex justify-center pointer-events-auto">
        <div className="glass-panel p-3 rounded-xl flex gap-4 backdrop-blur-xl">
           <button className="px-6 py-2 rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors uppercase text-xs tracking-widest">
             Normal Ops
           </button>
           <button className="px-6 py-2 rounded border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors uppercase text-xs tracking-widest flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
             Simulate Blackout
           </button>
           <button className="px-6 py-2 rounded border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors uppercase text-xs tracking-widest">
             Trigger Drone Swarm
           </button>
        </div>
      </div>

    </div>
  );
}
