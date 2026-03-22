// src/components/AISafetyChatbot.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Phone, PhoneOff, Mic, MicOff, Volume2, Timer, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/useLanguage';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  type?: 'normal' | 'alert' | 'tip' | 'action';
}

interface FakeCallState {
  active: boolean;
  ringing: boolean;
  callerName: string;
  callerNumber: string;
  callerAvatar: string;
  duration: number;
  muted: boolean;
  speakerOn: boolean;
}


const FAKE_CALLERS = [
  { name: 'Mom', number: '+91 98765 43210', avatar: '👩' },
  { name: 'Dad', number: '+91 87654 32109', avatar: '👨' },
  { name: 'Best Friend', number: '+91 91234 56789', avatar: '👧' },
  { name: 'Sister', number: '+91 93456 78901', avatar: '👩‍🦱' },
  { name: 'Police', number: '100', avatar: '👮' },
];

const CALL_SCRIPTS = [
  "Yes I'm on my way, wait for me outside!",
  "I'll be there in 5 minutes, don't leave!",
  "Yes I can see you, coming right now!",
  "Okay okay I'm almost there, keep talking!",
  "Yes, I'll take the main road, see you soon!",
];

const DELAY_OPTIONS = [
  { label: 'Now', seconds: 0 },
  { label: '5 sec', seconds: 5 },
  { label: '15 sec', seconds: 15 },
  { label: '30 sec', seconds: 30 },
];

function getAIResponse(userMsg: string): { text: string; type: Message['type'] } {
  const msg = userMsg.toLowerCase();
  if (msg.includes('fake call') || msg.includes('trigger') || msg.includes('call')) {
    return { text: 'Triggering a fake call for you right now! Pick up and pretend to talk — this will help you escape the situation safely. The call will start in 3 seconds...', type: 'action' };
  }
  if (msg.includes('following') || msg.includes('stalking') || msg.includes('someone behind')) {
    return { text: 'Stay calm. Here\'s what to do RIGHT NOW:\n\n1. Change direction — turn around or go into a busy shop\n2. Call someone and talk loudly\n3. Enter a public place — restaurant, mall, store\n4. If danger is imminent, press SOS above\n5. Make eye contact with others around you\n\nDo NOT go home directly if you think you\'re being followed.', type: 'alert' };
  }
  if (msg.includes('unsafe') || msg.includes('scared') || msg.includes('danger') || msg.includes('help')) {
    return { text: 'I\'m here with you. Take a deep breath.\n\nIf immediate danger → Press the RED SOS button at the top NOW\n\nIf you have a moment:\n1. Move toward people/lights\n2. Call a trusted contact\n3. Enter any open shop/building\n4. Yell "FIRE!" — people respond faster than "Help!"\n\nStay on the line with me. What\'s happening?', type: 'alert' };
  }
  if (msg.includes('night') || msg.includes('dark') || msg.includes('alone') || msg.includes('walking')) {
    return { text: 'Night safety tips:\n\n✅ Share your live location with a trusted contact\n✅ Walk in well-lit, populated areas\n✅ Keep one earbud out to hear surroundings\n✅ Hold your phone ready — not in your bag\n✅ Walk confidently and with purpose\n✅ Avoid shortcuts through isolated areas\n\n💡 Tip: Text someone your route and ETA right now!', type: 'tip' };
  }
  if (msg.includes('escape') || msg.includes('get away') || msg.includes('run')) {
    return { text: 'Escape strategies:\n\n1. Make noise — scream, shout, draw attention\n2. Run toward ANY open business or crowd\n3. Flag down a car or auto-rickshaw\n4. Call 100 (Police) or 1091 (Women helpline)\n5. Use anything as defense — keys, umbrella, bag\n6. Drop a pin to your emergency contacts NOW\n\nRemember: Your safety is more important than being polite. Make noise!', type: 'alert' };
  }
  if (msg.includes('location') || msg.includes('share') || msg.includes('gps')) {
    return { text: 'Location sharing tips:\n\n✅ Use the SOS button to auto-share your GPS with all trusted contacts\n✅ On WhatsApp: Attach → Location → Share Live Location\n✅ On Google Maps: Share → Share location → choose duration\n✅ Tell someone your route before you leave\n\n💡 Pro tip: Set up a check-in code with a friend!', type: 'tip' };
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return { text: 'Hi! I\'m your AI Safety Assistant. I\'m here 24/7 to help you stay safe.\n\nI can help you with:\n• Emergency advice\n• Trigger a fake call\n• Night safety tips\n• Escape strategies\n• Location sharing\n\nWhat do you need help with today?', type: 'normal' };
  }
  if (msg.includes('police') || msg.includes('number') || msg.includes('helpline')) {
    return { text: 'Emergency Numbers (India):\n\n🚔 Police: 100\n🚑 Ambulance: 102\n🔥 Fire: 101\n👩 Women Helpline: 1091\n🆘 Emergency: 112\n\nSave these in your phone RIGHT NOW!', type: 'tip' };
  }
  if (msg.includes('panic') || msg.includes('anxious') || msg.includes('calm') || msg.includes('breathe')) {
    return { text: 'Let\'s calm down together. Try this:\n\n🌬️ Box Breathing (4-4-4-4):\n1. Breathe IN for 4 seconds\n2. HOLD for 4 seconds\n3. Breathe OUT for 4 seconds\n4. HOLD for 4 seconds\n\nRepeat 3 times. You are safe. You are strong. 💪', type: 'tip' };
  }
  const defaults = [
    { text: 'I\'m your AI safety assistant! Ask me about:\n• What to do if followed\n• Night safety tips\n• Escape strategies\n• Fake call trigger\n• Emergency numbers\n\nOr press the SOS button above for immediate help!', type: 'normal' as const },
    { text: '💡 Safety tip: Always tell someone where you\'re going and when you expect to return. This simple habit can save your life.', type: 'tip' as const },
    { text: '📱 Remember: The SOS button at the top of this app will instantly alert all your trusted contacts with your location. Stay safe!', type: 'tip' as const },
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function AISafetyChatbot() {
  const { t } = useLanguage();

  const QUICK_QUESTIONS = [
    t.quickPrompt1,
    t.quickPrompt2,
    t.quickPrompt3,
    t.quickPrompt4,
    t.quickPrompt5,
    t.quickPrompt6,
  ];

  const [messages, setMessages] = useState<Message[]>([{
    id: '1', role: 'bot',
    text: '👋 Hi! I\'m your AI Safety Assistant, available 24/7.\n\nI can help you with emergency advice, fake calls, safety tips, and more.\n\nHow can I help you stay safe today?',
    timestamp: new Date(), type: 'normal',
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fakeCall, setFakeCall] = useState<FakeCallState>({
    active: false, ringing: false, callerName: '', callerNumber: '',
    callerAvatar: '', duration: 0, muted: false, speakerOn: false,
  });
  const [showCallerPicker, setShowCallerPicker] = useState(false);
  const [selectedDelay, setSelectedDelay] = useState(DELAY_OPTIONS[0]);
  const [delayCountdown, setDelayCountdown] = useState<number | null>(null);
  const [currentScript, setCurrentScript] = useState(0);
  const [customCallerName, setCustomCallerName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [batteryLevel] = useState(Math.floor(Math.random() * 40) + 60);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const ringtoneRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (fakeCall.ringing) startRingtone();
    else stopRingtone();
    return () => stopRingtone();
  }, [fakeCall.ringing]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (ringtoneRef.current) clearInterval(ringtoneRef.current);
      if (delayRef.current) clearInterval(delayRef.current);
      try { audioRef.current?.close(); } catch {}
    };
  }, []);

  const startRingtone = () => {
    try {
      audioRef.current = new AudioContext();
      const play = () => {
        if (!audioRef.current) return;
        const osc = audioRef.current.createOscillator();
        const gain = audioRef.current.createGain();
        osc.connect(gain);
        gain.connect(audioRef.current.destination);
        osc.frequency.value = 480;
        gain.gain.setValueAtTime(0.3, audioRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioRef.current.currentTime + 0.5);
        osc.start(audioRef.current.currentTime);
        osc.stop(audioRef.current.currentTime + 0.5);
      };
      play();
      ringtoneRef.current = setInterval(play, 1500);
    } catch {}
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) { clearInterval(ringtoneRef.current); ringtoneRef.current = null; }
    try { audioRef.current?.close(); audioRef.current = null; } catch {}
  };

  const endCall = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (delayRef.current) { clearInterval(delayRef.current); delayRef.current = null; }
    if (ringtoneRef.current) { clearInterval(ringtoneRef.current); ringtoneRef.current = null; }
    try { audioRef.current?.close(); audioRef.current = null; } catch {}
    setDelayCountdown(null);
    setFakeCall({ active: false, ringing: false, callerName: '', callerNumber: '', callerAvatar: '', duration: 0, muted: false, speakerOn: false });
  }, []);

  const triggerFakeCall = (caller: typeof FAKE_CALLERS[0], delay = 0) => {
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    const name = customCallerName || caller.name;
    if (delay === 0) {
      setFakeCall({ active: true, ringing: true, callerName: name, callerNumber: caller.number, callerAvatar: caller.avatar, duration: 0, muted: false, speakerOn: false });
    } else {
      setDelayCountdown(delay);
      delayRef.current = setInterval(() => {
        setDelayCountdown(prev => {
          if (prev === null || prev <= 1) {
            if (delayRef.current) { clearInterval(delayRef.current); delayRef.current = null; }
            setFakeCall({ active: true, ringing: true, callerName: name, callerNumber: caller.number, callerAvatar: caller.avatar, duration: 0, muted: false, speakerOn: false });
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setShowCallerPicker(false);
  };

  const answerCall = () => {
    stopRingtone();
    setFakeCall(f => ({ ...f, ringing: false }));
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    intervalRef.current = setInterval(() => {
      setFakeCall(f => ({ ...f, duration: f.duration + 1 }));
    }, 1000);
  };

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText) return;
    setInput('');
    setMessages(m => [...m, { id: Date.now().toString(), role: 'user', text: msgText, timestamp: new Date() }]);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const response = getAIResponse(msgText);
    setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'bot', text: response.text, timestamp: new Date(), type: response.type }]);
    setIsTyping(false);
    if (response.type === 'action' && msgText.toLowerCase().includes('call')) {
      setTimeout(() => triggerFakeCall(FAKE_CALLERS[0], 3), 100);
    }
  };

  // ── DELAY COUNTDOWN ───────────────────────────────────────────────────────
  if (delayCountdown !== null) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
        <p className="text-lg mb-4 text-gray-300">Incoming call in...</p>
        <div className="text-9xl font-black text-white mb-6">{delayCountdown}</div>
        <p className="text-gray-400 mb-6 text-sm">Put your phone in your pocket</p>
        <button onPointerDown={endCall} className="bg-red-500 text-white px-8 py-3 rounded-full text-lg font-semibold">
          Cancel
        </button>
      </div>
    );
  }

  // ── FAKE CALL SCREEN ──────────────────────────────────────────────────────
  if (fakeCall.active) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ background: 'linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%)' }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1">
          <span className="text-white text-sm font-semibold">{currentTime}</span>
          <div className="flex items-center gap-2">
            <span className="text-white text-xs">Jio</span>
            <div className="w-6 h-3 border border-white/60 rounded-sm relative">
              <div className="absolute inset-0.5 bg-white rounded-sm" style={{ width: `${batteryLevel}%` }} />
            </div>
          </div>
        </div>

        {/* Caller info */}
        <div className="flex flex-col items-center py-5 px-6">
          <p className="text-white/60 text-xs tracking-wide mb-3">
            {fakeCall.ringing ? 'incoming call' : 'mobile'}
          </p>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-5xl mb-3 shadow-2xl">
            {fakeCall.callerAvatar}
          </div>
          <h2 className="text-white text-3xl font-light mb-1">{fakeCall.callerName}</h2>
          <p className="text-white/50 text-sm">{fakeCall.callerNumber}</p>
          {fakeCall.ringing
            ? <p className="text-white/60 text-sm mt-2 animate-pulse">AI Guardian</p>
            : <p className="text-green-400 text-2xl font-mono font-medium mt-2">{formatDuration(fakeCall.duration)}</p>
          }
        </div>

        {/* RINGING BUTTONS */}
        {fakeCall.ringing && (
          <div className="px-12 mt-8">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center gap-3">
                <button
                  onPointerDown={endCall}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
                >
                  <PhoneOff size={30} className="text-white" />
                </button>
                <span className="text-white text-sm font-medium">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button
                  onPointerDown={answerCall}
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform animate-pulse"
                >
                  <Phone size={30} className="text-white" />
                </button>
                <span className="text-white text-sm font-medium">Accept</span>
              </div>
            </div>
          </div>
        )}

        {/* IN-CALL CONTROLS */}
        {!fakeCall.ringing && (
          <div className="px-6">
            {/* Script */}
            <div className="bg-white/10 rounded-2xl p-3 mb-4 border border-white/10 mx-0">
              <p className="text-white/40 text-xs mb-1">💬 SAY THIS:</p>
              <p className="text-white text-sm">"{CALL_SCRIPTS[currentScript]}"</p>
              <button
                onClick={() => setCurrentScript(s => (s + 1) % CALL_SCRIPTS.length)}
                className="mt-1 text-white/40 text-xs flex items-center gap-1"
              >
                Next script <ChevronRight size={12} />
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => setFakeCall(f => ({ ...f, muted: !f.muted }))}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${fakeCall.muted ? 'bg-white text-gray-900' : 'bg-white/20 text-white'}`}
                >
                  {fakeCall.muted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <span className="text-white/50 text-xs">mute</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Phone size={20} />
                </div>
                <span className="text-white/50 text-xs">keypad</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => setFakeCall(f => ({ ...f, speakerOn: !f.speakerOn }))}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${fakeCall.speakerOn ? 'bg-white text-gray-900' : 'bg-white/20 text-white'}`}
                >
                  <Volume2 size={20} />
                </button>
                <span className="text-white/50 text-xs">speaker</span>
              </div>
            </div>

            {/* END CALL */}
            <div className="flex justify-center pb-8">
              <div className="flex flex-col items-center gap-2">
                <button
                  onPointerDown={endCall}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                >
                  <PhoneOff size={30} className="text-white" />
                </button>
                <span className="text-white text-sm font-medium">End</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── MAIN CHATBOT UI ───────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{t.aiAssistantTitle}</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-rose-100 text-xs">{t.aiAssistantStatus}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCallerPicker(!showCallerPicker)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              <Phone size={14} /> {t.fakeCall}
            </button>
            {showCallerPicker && (
              <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-10 w-64">
                <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">📞 Fake Call Setup</p>
                <div className="mb-3">
                  <button onClick={() => setShowCustomInput(!showCustomInput)} className="text-xs text-rose-600 font-medium">
                    ✏️ Custom caller name
                  </button>
                  {showCustomInput && (
                    <input
                      type="text"
                      value={customCallerName}
                      onChange={e => setCustomCallerName(e.target.value)}
                      placeholder="Enter name..."
                      className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-rose-400"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2 font-medium">⏱️ Call delay:</p>
                <div className="flex gap-2 mb-3">
                  {DELAY_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedDelay(opt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        selectedDelay.label === opt.label ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-2 font-medium">👤 Choose caller:</p>
                {FAKE_CALLERS.map(caller => (
                  <button
                    key={caller.name}
                    onClick={() => triggerFakeCall(caller, selectedDelay.seconds)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 rounded-xl text-sm text-left transition-colors mb-1"
                  >
                    <span className="text-2xl">{caller.avatar}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{customCallerName || caller.name}</p>
                      <p className="text-xs text-gray-400">{caller.number}</p>
                    </div>
                    {selectedDelay.seconds > 0 && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-rose-500 font-medium">
                        <Timer size={10} /> {selectedDelay.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-rose-100' : 'bg-blue-100'}`}>
              {msg.role === 'bot' ? <Bot size={16} className="text-rose-600" /> : <User size={16} className="text-blue-600" />}
            </div>
            <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
              msg.role === 'user' ? 'bg-rose-600 text-white rounded-tr-sm' :
              msg.type === 'alert' ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-sm' :
              msg.type === 'tip' ? 'bg-blue-50 text-blue-800 border border-blue-100 rounded-tl-sm' :
              msg.type === 'action' ? 'bg-green-50 text-green-800 border border-green-200 rounded-tl-sm' :
              'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
            }`}>
              {msg.text}
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-rose-200' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <Bot size={16} className="text-rose-600" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="whitespace-nowrap text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full transition-colors shrink-0">
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            placeholder={t.aiAssistantPlaceholder}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
          />
          <button onClick={() => sendMessage()}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
