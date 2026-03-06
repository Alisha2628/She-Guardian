// src/components/DeadMansSwitch.tsx
import { useState, useEffect, useRef } from 'react';
import { Timer, Shield, AlertTriangle, CheckCircle, Bell, MapPin, Clock, Zap, RotateCcw, Play, Square } from 'lucide-react';

type SwitchStatus = 'idle' | 'active' | 'warning' | 'triggered';

interface CheckIn {
  time: string;
  status: 'safe' | 'missed';
}

const TIMER_PRESETS = [
  { label: '5 min', value: 5 * 60 },
  { label: '15 min', value: 15 * 60 },
  { label: '30 min', value: 30 * 60 },
  { label: '1 hour', value: 60 * 60 },
  { label: '2 hours', value: 2 * 60 * 60 },
];

const WARNING_MESSAGES = [
  "⚠️ Are you safe? Tap 'I'm Safe' or SOS will trigger in {time}!",
  "🔔 Check-in required! Tap below in {time} or emergency alert sends!",
  "🚨 FINAL WARNING: Tap 'I'm Safe' in {time} or contacts will be notified!",
];

export function DeadMansSwitch({ onAlertTriggered }: { onAlertTriggered?: () => void }) {
  const [status, setStatus] = useState<SwitchStatus>('idle');
  const [selectedTime, setSelectedTime] = useState(TIMER_PRESETS[1].value);
  const [timeLeft, setTimeLeft] = useState(0);
  const [warningTime] = useState(60); // warn 60 seconds before
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [sosCount, setSosCount] = useState(0);
  const [pulseRing, setPulseRing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (status === 'warning') {
      setPulseRing(true);
      playWarningSound();
      if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    } else {
      setPulseRing(false);
    }
  }, [status]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, []);

  const playWarningSound = () => {
    try {
      audioRef.current = new AudioContext();
      const beep = (freq: number, delay: number) => {
        if (!audioRef.current) return;
        const osc = audioRef.current.createOscillator();
        const gain = audioRef.current.createGain();
        osc.connect(gain);
        gain.connect(audioRef.current.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, audioRef.current.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, audioRef.current.currentTime + delay + 0.3);
        osc.start(audioRef.current.currentTime + delay);
        osc.stop(audioRef.current.currentTime + delay + 0.3);
      };
      [0, 0.4, 0.8].forEach(d => beep(880, d));
    } catch {}
  };

  const startSwitch = () => {
    const duration = customMinutes ? parseInt(customMinutes) * 60 : selectedTime;
    if (isNaN(duration) || duration < 60) { alert('Minimum timer is 1 minute'); return; }

    setTimeLeft(duration);
    setStatus('active');
    setSosCount(0);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          triggerSOS();
          return 0;
        }
        if (prev === warningTime + 1) {
          setStatus('warning');
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkInSafe = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newCheckIn: CheckIn = { time: new Date().toLocaleTimeString(), status: 'safe' };
    setCheckIns(prev => [newCheckIn, ...prev.slice(0, 9)]);
    setStatus('idle');
    setTimeLeft(0);
    setPulseRing(false);
    try { audioRef.current?.close(); } catch {}
  };

  const triggerSOS = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newCheckIn: CheckIn = { time: new Date().toLocaleTimeString(), status: 'missed' };
    setCheckIns(prev => [newCheckIn, ...prev.slice(0, 9)]);
    setStatus('triggered');
    setSosCount(c => c + 1);
    if (navigator.vibrate) navigator.vibrate([1000, 300, 1000, 300, 1000]);
    if (onAlertTriggered) onAlertTriggered();
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('idle');
    setTimeLeft(0);
    setPulseRing(false);
    try { audioRef.current?.close(); } catch {}
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    const total = customMinutes ? parseInt(customMinutes) * 60 : selectedTime;
    return Math.max(0, Math.min(100, ((total - timeLeft) / total) * 100));
  };

  const warningMessage = WARNING_MESSAGES[Math.min(sosCount, 2)].replace('{time}', formatTime(timeLeft));

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 transition-colors ${
        status === 'triggered' ? 'bg-red-600' :
        status === 'warning' ? 'bg-orange-500' :
        status === 'active' ? 'bg-emerald-600' :
        'bg-gray-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Dead Man's Switch</h2>
              <p className="text-white/70 text-xs">Auto-SOS if you don't check in</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            status === 'triggered' ? 'bg-white text-red-600 animate-pulse' :
            status === 'warning' ? 'bg-white text-orange-500 animate-pulse' :
            status === 'active' ? 'bg-white text-emerald-600' :
            'bg-white/20 text-white'
          }`}>
            {status === 'idle' ? '⏸ INACTIVE' :
             status === 'active' ? '🟢 ACTIVE' :
             status === 'warning' ? '⚠️ WARNING' :
             '🚨 SOS SENT'}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* TRIGGERED STATE */}
        {status === 'triggered' && (
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">🚨 Emergency Alert Sent!</h3>
            <p className="text-gray-600 text-sm mb-2">Your trusted contacts have been notified</p>
            {location && (
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-4">
                <MapPin size={12} /> Location shared: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}
            <button onClick={reset} className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              <RotateCcw size={18} /> Reset Switch
            </button>
          </div>
        )}

        {/* WARNING STATE */}
        {status === 'warning' && (
          <div className="mb-6">
            <div className={`relative flex items-center justify-center mb-5 ${pulseRing ? 'animate-pulse' : ''}`}>
              <div className="absolute w-36 h-36 rounded-full bg-orange-100 animate-ping opacity-30" />
              <div className="absolute w-28 h-28 rounded-full bg-orange-200 animate-ping opacity-40" style={{ animationDelay: '0.3s' }} />
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center relative z-10">
                <span className="text-white font-mono font-bold text-2xl">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <p className="text-center text-orange-700 font-semibold text-sm mb-4">{warningMessage}</p>
            <button
              onClick={checkInSafe}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg shadow-emerald-200"
            >
              <CheckCircle size={24} /> I'M SAFE ✅
            </button>
            <button onClick={triggerSOS} className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              <Zap size={18} /> Send SOS Now
            </button>
          </div>
        )}

        {/* ACTIVE STATE */}
        {status === 'active' && (
          <div className="mb-6">
            {/* Circular progress */}
            <div className="relative flex items-center justify-center mb-5">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="60" fill="none" stroke="#f0fdf4" strokeWidth="12" />
                <circle
                  cx="72" cy="72" r="60" fill="none" stroke="#10b981" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (getProgressPercent() / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-mono font-bold text-2xl text-gray-800">{formatTime(timeLeft)}</p>
                <p className="text-xs text-gray-500">remaining</p>
              </div>
            </div>

            {location && (
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-4">
                <MapPin size={11} /> Tracking: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}

            <button
              onClick={checkInSafe}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 mb-2"
            >
              <CheckCircle size={24} /> I'M SAFE ✅
            </button>
            <div className="flex gap-2">
              <button onClick={triggerSOS} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1">
                <Zap size={15} /> SOS Now
              </button>
              <button onClick={reset} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1">
                <Square size={15} /> Stop
              </button>
            </div>
          </div>
        )}

        {/* IDLE STATE */}
        {status === 'idle' && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
              🛡️ Set a timer. If you don't tap <strong>"I'm Safe"</strong> before it ends, your emergency contacts are automatically notified with your location.
            </p>

            {/* Preset timers */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Choose Timer</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {TIMER_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => { setSelectedTime(preset.value); setCustomMinutes(''); }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    selectedTime === preset.value && !customMinutes
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom time */}
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                placeholder="Custom minutes..."
                value={customMinutes}
                onChange={e => setCustomMinutes(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
              <div className="flex items-center text-xs text-gray-400 px-2">min</div>
            </div>

            {/* Start button */}
            <button
              onClick={startSwitch}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg"
            >
              <Play size={22} /> Activate Switch
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              Warning alert 60 seconds before SOS triggers
            </p>
          </div>
        )}

        {/* Check-in history */}
        {checkIns.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Check-in History</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {checkIns.map((c, i) => (
                <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${c.status === 'safe' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <div className="flex items-center gap-2">
                    {c.status === 'safe' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                    <span>{c.status === 'safe' ? 'Checked in safe' : 'Missed — SOS triggered'}</span>
                  </div>
                  <span className="text-gray-400">{c.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
