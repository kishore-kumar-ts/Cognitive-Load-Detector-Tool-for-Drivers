import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, Brain, Eye, Gauge, MapPin, Navigation, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FaceAnalysis } from './components/FaceAnalysis';
import { calculateCognitiveLoad, speak } from './lib/utils';
import { CognitiveLoad, DriverStats, SessionData, WeatherData } from './types';

export default function App() {
  const [stats, setStats] = useState<DriverStats>({
    blinkRate: 18,
    headPose: { x: 0, y: 0, z: 0 },
    steeringIrregularity: 0.1,
    reactionTime: 400,
    stressScore: 20
  });

  const [load, setLoad] = useState<CognitiveLoad>('Low');
  const [history, setHistory] = useState<SessionData[]>([]);
  const [alerts, setAlerts] = useState<{ id: string; message: string; type: 'warning' | 'danger' }[]>([
    { id: '1', message: 'System initialized. Monitoring active.', type: 'warning' },
    { id: '2', message: 'Irregular steering detected 5 mins ago', type: 'warning' },
    { id: '3', message: 'High blink rate detected during night drive', type: 'danger' }
  ]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [view, setView] = useState<'dashboard' | 'analytics'>('dashboard');

  // Initialize with sample history
  useEffect(() => {
    const now = Date.now();
    const sampleHistory: SessionData[] = Array.from({ length: 20 }).map((_, i) => ({
      timestamp: now - (20 - i) * 2000,
      load: i > 15 ? 'Medium' : 'Low',
      stats: {
        blinkRate: 18 + Math.random() * 5,
        headPose: { x: 0, y: 0, z: 0 },
        steeringIrregularity: 0.1 + Math.random() * 0.2,
        reactionTime: 400 + Math.random() * 100,
        stressScore: 15 + Math.floor(Math.random() * 30)
      }
    }));
    setHistory(sampleHistory);
  }, []);

  // Simulated steering behavior
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        setStats(prev => ({
          ...prev,
          steeringIrregularity: Math.min(1, prev.steeringIrregularity + 0.05)
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        steeringIrregularity: Math.max(0.05, prev.steeringIrregularity - 0.01)
      }));
    }, 500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  // Fetch Weather
  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => setWeather(data));
  }, []);

  // AI Logic Loop
  useEffect(() => {
    const newLoad = calculateCognitiveLoad(stats);
    if (newLoad !== load) {
      setLoad(newLoad);
      if (newLoad === 'High') {
        addAlert('CRITICAL COGNITIVE LOAD DETECTED', 'danger');
        speak('High cognitive load detected. Please stay focused or take a break.');
        setIsFocusMode(true);
      } else if (newLoad === 'Medium') {
        addAlert('Moderate stress levels detected', 'warning');
        speak('Moderate stress detected.');
        setIsFocusMode(false);
      } else {
        setIsFocusMode(false);
      }
    }

    const timer = setInterval(() => {
      const newData: SessionData = {
        timestamp: Date.now(),
        load: newLoad,
        stats: { ...stats, stressScore: Math.floor(Math.random() * 20) + (newLoad === 'High' ? 70 : newLoad === 'Medium' ? 40 : 10) }
      };
      setHistory(prev => [...prev.slice(-20), newData]);
    }, 2000);

    return () => clearInterval(timer);
  }, [stats, load]);

  const addAlert = (message: string, type: 'warning' | 'danger') => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [{ id, message, type }, ...prev].slice(0, 5));
  };

  const getStatusColor = (l: CognitiveLoad) => {
    if (l === 'High') return 'text-red-500';
    if (l === 'Medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`min-h-screen p-6 transition-all duration-700 ${isFocusMode ? 'bg-zinc-950' : 'bg-black'}`}>
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">CogniDrive AI</h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Driver Cognitive Load Monitor</p>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <button 
            onClick={() => setView('dashboard')}
            className={`text-xs font-mono uppercase tracking-widest transition-colors ${view === 'dashboard' ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={`text-xs font-mono uppercase tracking-widest transition-colors ${view === 'analytics' ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
          >
            Analytics
          </button>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-2 text-zinc-400">
            <Navigation className="w-4 h-4" />
            <span className="text-xs font-mono">AUTO-PILOT: OFF</span>
          </div>
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.main 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="dashboard-grid"
          >
            {/* Main Monitoring Area */}
            <div className="flex flex-col gap-6">
              <div className="relative flex-1 glass-panel">
                <FaceAnalysis onStatsUpdate={(s) => setStats(prev => ({ ...prev, ...s }))} />
                
                {/* Overlay Indicators */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Biometric Stream</span>
                    </div>
                    <div className="text-4xl font-bold font-mono">
                      {stats.stressScore}<span className="text-sm text-zinc-600 ml-1">BPM/EST</span>
                    </div>
                  </div>
                  
                  <div className={`px-6 py-3 rounded-xl border-2 transition-all duration-500 ${
                    load === 'High' ? 'border-red-500 bg-red-500/10 status-glow-high' :
                    load === 'Medium' ? 'border-yellow-500 bg-yellow-500/10 status-glow-medium' :
                    'border-green-500 bg-green-500/10 status-glow-low'
                  }`}>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase mb-1">Cognitive Load</div>
                    <div className={`text-2xl font-black uppercase tracking-tighter ${getStatusColor(load)}`}>
                      {load}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="glass-panel p-4 flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-xl">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Blink Rate</div>
                    <div className="text-xl font-bold font-mono">{stats.blinkRate}<span className="text-xs ml-1">/min</span></div>
                  </div>
                </div>
                <div className="glass-panel p-4 flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-xl">
                    <Gauge className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Steering Dev</div>
                    <div className="text-xl font-bold font-mono">{(stats.steeringIrregularity * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="glass-panel p-4 flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-xl">
                    <Wind className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Environment</div>
                    <div className="text-xl font-bold font-mono">{weather?.temp || 22}°C <span className="text-xs text-zinc-500 ml-1">{weather?.condition || 'Clear'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              {/* Alerts Panel */}
              <div className="glass-panel flex-1 flex flex-col">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest">Alert System</span>
                  <AlertTriangle className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="p-4 flex flex-col gap-3 overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {alerts.map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3 rounded-lg border flex items-start gap-3 ${
                          alert.type === 'danger' ? 'bg-red-500/10 border-red-500/50 text-red-200' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-200'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="text-xs font-medium">{alert.message}</span>
                      </motion.div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="text-center py-8 text-zinc-600 text-xs italic font-mono">
                        System stable. No active alerts.
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Real-time Graph */}
              <div className="glass-panel h-[250px] p-4">
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-4">Stress Trend (Live)</div>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: '10px' }}
                      itemStyle={{ color: '#ef4444' }}
                    />
                    <Area type="monotone" dataKey="stats.stressScore" stroke="#ef4444" fillOpacity={1} fill="url(#colorStress)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.main>
        ) : (
          <motion.main 
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-zinc-500 text-xs font-mono uppercase mb-2">Driver Safety Score</h3>
                <div className="text-5xl font-bold text-white">84<span className="text-lg text-zinc-600 ml-2">/100</span></div>
                <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[84%]" />
                </div>
              </div>
              <div className="glass-panel p-6">
                <h3 className="text-zinc-500 text-xs font-mono uppercase mb-2">High Load Events</h3>
                <div className="text-5xl font-bold text-white">12</div>
                <p className="text-xs text-zinc-500 mt-2">Last 24 hours</p>
              </div>
              <div className="glass-panel p-6">
                <h3 className="text-zinc-500 text-xs font-mono uppercase mb-2">Avg Reaction Time</h3>
                <div className="text-5xl font-bold text-white">420<span className="text-lg text-zinc-600 ml-2">ms</span></div>
                <p className="text-xs text-green-500 mt-2">↑ 5% improvement</p>
              </div>
            </div>

            <div className="glass-panel p-8">
              <h3 className="text-zinc-500 text-xs font-mono uppercase mb-6">Cognitive Load Distribution</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="timestamp" stroke="#52525b" fontSize={10} tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                    <YAxis stroke="#52525b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    />
                    <Line type="monotone" dataKey="stats.stressScore" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="stats.blinkRate" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none border-[20px] border-red-500/20 z-50"
          />
        )}
      </AnimatePresence>

      <footer className="fixed bottom-6 left-6 flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
          <MapPin className="w-3 h-3 text-red-500" />
          <span className="text-[10px] font-mono text-zinc-400">LAT: 37.7749 | LONG: -122.4194</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          System Version 2.4.0-Stable
        </div>
      </footer>
    </div>
  );
}
