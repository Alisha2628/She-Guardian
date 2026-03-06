// src/components/AISafetyChatbot.tsx
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Phone, PhoneOff, PhoneIncoming, Mic, MicOff, Shield, AlertTriangle, X } from 'lucide-react';

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
  duration: number;
  muted: boolean;
}

const QUICK_QUESTIONS = [
  '🚨 I feel unsafe right now',
  '👣 Someone is following me',
  '🌙 Walking alone at night',
  '📞 Trigger a fake call',
  '🆘 How to escape danger?',
  '📍 Share my location tips',
];

const FAKE_CALLERS = [
  { name: 'Mom', number: '+91 98765 43210', avatar: '👩' },
  { name: 'Dad', number: '+91 87654 32109', avatar: '👨' },
  { name: 'Best Friend', number: '+91 91234 56789', avatar: '👧' },
  { name: 'Sister', number: '+91 93456 78901', avatar: '👩‍🦱' },
  { name: 'Police', number: '100', avatar: '👮' },
];

// AI response logic
function getAIResponse(userMsg: string): { text: string; type: Message['type'] } {
  const msg = userMsg.toLowerCase();

  if (msg.includes('fake call') || msg.includes('trigger') || msg.includes('call')) {
    return { text: '📞 Triggering a fake call for you right now! Pick up and pretend to talk — this will help you escape the situation safely. The call will start in 3 seconds...', type: 'action' };
  }
  if (msg.includes('following') || msg.includes('stalking') || msg.includes('someone behind')) {
    return { text: '⚠️ Stay calm. Here\'s what to do RIGHT NOW:\n\n1. 🏃 Change direction — turn around or go into a busy shop\n2. 📱 Call someone and talk loudly\n3. 🏪 Enter a public place — restaurant, mall, store\n4. 🚨 If danger is imminent, press SOS above\n5. 👀 Make eye contact with others around you\n\nDo NOT go home directly if you think you\'re being followed.', type: 'alert' };
  }
  if (msg.includes('unsafe') || msg.includes('scared') || msg.includes('danger') || msg.includes('help')) {
    return { text: '🛡️ I\'m here with you. Take a deep breath.\n\n🔴 If immediate danger → Press the RED SOS button at the top NOW\n\n✅ If you have a moment:\n1. Move toward people/lights\n2. Call a trusted contact\n3. Enter any open shop/building\n4. Yell "FIRE!" — people respond faster than "Help!"\n\nStay on the line with me. What\'s happening?', type: 'alert' };
  }
  if (msg.includes('night') || msg.includes('dark') || msg.includes('alone') || msg.includes('walking')) {
    return { text: '🌙 Night safety tips:\n\n✅ Share your live location with a trusted contact\n✅ Walk in well-lit, populated areas\n✅ Keep one earbud out to hear surroundings\n✅ Hold your phone ready — not in your bag\n✅ Walk confidently and with purpose\n✅ Avoid shortcuts through isolated areas\n✅ Use this app\'s Night Safety Mode (auto-activates 10pm-6am)\n\n💡 Tip: Text someone your route and ETA right now!', type: 'tip' };
  }
  if (msg.includes('escape') || msg.includes('get away') || msg.includes('run')) {
    return { text: '🏃 Escape strategies:\n\n1. 🗣️ Make noise — scream, shout, draw attention\n2. 🏪 Run toward ANY open business or crowd\n3. 🚗 Flag down a car or auto-rickshaw\n4. 📞 Call 100 (Police) or 1091 (Women helpline)\n5. 🧴 Use anything as defense — keys, umbrella, bag\n6. 📱 Drop a pin to your emergency contacts NOW\n\nRemember: Your safety is more important than being polite. Make noise!', type: 'alert' };
  }
  if (msg.includes('location') || msg.includes('share') || msg.includes('gps')) {
    return { text: '📍 Location sharing tips:\n\n✅ Use the SOS button to auto-share your GPS with all trusted contacts\n✅ On WhatsApp: Attach → Location → Share Live Location\n✅ On Google Maps: Share → Share location → choose duration\n✅ Tell someone your route before you leave\n\n💡 Pro tip: Set up a check-in code with a friend. If they don\'t hear from you in 30 mins, they call for help!', type: 'tip' };
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return { text: '👋 Hi! I\'m your AI Safety Assistant. I\'m here 24/7 to help you stay safe.\n\nI can help you with:\n• 🚨 Emergency advice\n• 📞 Trigger a fake call\n• 🌙 Night safety tips\n• 🗺️ Escape strategies\n• 📍 Location sharing\n\nWhat do you need help with today?', type: 'normal' };
  }
  if (msg.includes('police') || msg.includes('number') || msg.includes('helpline') || msg.includes('contact')) {
    return { text: '📞 Emergency Numbers (India):\n\n🚔 Police: 100\n🚑 Ambulance: 102\n🔥 Fire: 101\n👩 Women Helpline: 1091\n🆘 Emergency: 112\n🏥 NIMHANS: 080-46110007\n\nSave these in your phone RIGHT NOW. You can also add them as trusted contacts in this app!', type: 'tip' };
  }
  if (msg.includes('panic') || msg.includes('anxious') || msg.includes('calm') || msg.includes('breathe')) {
    return { text: '💙 Let\'s calm down together. Try this:\n\n🌬️ Box Breathing (4-4-4-4):\n1. Breathe IN for 4 seconds\n2. HOLD for 4 seconds\n3. Breathe OUT for 4 seconds\n4. HOLD for 4 seconds\n\nRepeat 3 times. This activates your calm response.\n\nYou are safe. You are strong. You have this app watching over you. 💪', type: 'tip' };
  }

  // Default response
  const defaults = [
    { text: '🛡️ I\'m your AI safety assistant! Ask me about:\n• What to do if followed\n• Night safety tips\n• Escape strategies\n• Fake call trigger\n• Emergency numbers\n\nOr press the SOS button above for immediate help!', type: 'normal' as const },
    { text: '💡 Safety tip: Always tell someone where you\'re going and when you expect to return. This simple habit can save your life.\n\nWhat else can I help you with?', type: 'tip' as const },
    { text: '📱 Remember: The SOS button at the top of this app will instantly alert all your trusted contacts with your location. Stay safe!', type: 'tip' as const },
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function AISafetyChatbot() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'bot',
    text: '👋 Hi! I\'m your AI Safety Assistant, available 24/7.\n\nI can help you with emergency advice, fake calls, safety tips, and more.\n\nHow can I help you stay safe today?',
    timestamp: new Date(),
    type: 'normal',
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fakeCall, setFakeCall] = useState<FakeCallState>({ active: false, ringing: false, callerName: '', callerNumber: '', duration: 0, muted: false });
  const [selectedCaller, setSelectedCaller] = useState(FAKE_CALLERS[0]);
  const [showCallerPicker, setShowCallerPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const ringtoneRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (fakeCall.ringing) {
      startRingtone();
    } else {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [fakeCall.ringing]);

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
    if (ringtoneRef.current) clearInterval(ringtoneRef.current);
    try { audioRef.current?.close(); } catch {}
  };

  const triggerFakeCall = (callerOverride?: typeof FAKE_CALLERS[0]) => {
    const caller = callerOverride || selectedCaller;
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    setFakeCall({ active: true, ringing: true, callerName: caller.name, callerNumber: caller.number, duration: 0, muted: false });
  };

  const answerCall = () => {
    setFakeCall(f => ({ ...f, ringing: false }));
    intervalRef.current = setInterval(() => {
      setFakeCall(f => ({ ...f, duration: f.duration + 1 }));
    }, 1000);
  };

  const endCall = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setFakeCall({ active: false, ringing: false, callerName: '', callerNumber: '', duration: 0, muted: false });
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: msgText, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = getAIResponse(msgText);
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: response.text, timestamp: new Date(), type: response.type };
    setMessages(m => [...m, botMsg]);
    setIsTyping(false);

    // Auto trigger fake call if requested
    if (response.type === 'action' && msgText.toLowerCase().includes('call')) {
      setTimeout(() => triggerFakeCall(), 3000);
    }
  };

  // ── FAKE CALL SCREEN ──────────────────────────────────────────────────────
  if (fakeCall.active) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-between py-16 px-6">
        {/* Caller info */}
        <div className="text-center mt-8">
          <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-6xl mx-auto mb-4 border-4 border-gray-600">
            {FAKE_CALLERS.find(c => c.name === fakeCall.callerName)?.avatar || '👤'}
          </div>
          <h2 className="text-white text-3xl font-light mb-1">{fakeCall.callerName}</h2>
          <p className="text-gray-400 text-lg">{fakeCall.callerNumber}</p>
          {fakeCall.ringing ? (
            <p className="text-gray-400 mt-2 animate-pulse text-lg">Incoming call...</p>
          ) : (
            <p className="text-green-400 mt-2 text-lg font-mono">{formatDuration(fakeCall.duration)}</p>
          )}
        </div>

        {/* Call actions */}
        {fakeCall.ringing ? (
          <div className="flex gap-16 mb-8">
            <div className="flex flex-col items-center gap-2">
              <button onClick={endCall} className="w-18 h-18 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center p-5 transition-colors">
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              <span className="text-gray-400 text-sm">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={answerCall} className="w-18 h-18 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center p-5 transition-colors animate-pulse">
                <Phone className="w-8 h-8 text-white" />
              </button>
              <span className="text-gray-400 text-sm">Answer</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xs">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setFakeCall(f => ({ ...f, muted: !f.muted }))}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${fakeCall.muted ? 'bg-white text-gray-900' : 'bg-gray-700 text-white'}`}>
                  {fakeCall.muted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <span className="text-gray-400 text-xs">Mute</span>
              </div>
              <div className="flex flex-col items-center gap-2 col-start-2">
                <button onClick={endCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                  <PhoneOff size={22} className="text-white" />
                </button>
                <span className="text-gray-400 text-xs">End</span>
              </div>
            </div>
            {/* Script helper */}
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">💬 Say this:</p>
              <p className="text-white text-sm">"Yes I'm coming right now, wait for me outside!"</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── MAIN CHATBOT UI ────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">AI Safety Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-rose-100 text-xs">Always online • Here to help</span>
              </div>
            </div>
          </div>
          {/* Fake call button */}
          <div className="relative">
            <button
              onClick={() => setShowCallerPicker(!showCallerPicker)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              <Phone size={14} /> Fake Call
            </button>
            {showCallerPicker && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-10 w-48">
                <p className="text-xs font-semibold text-gray-500 mb-2">Choose caller:</p>
                {FAKE_CALLERS.map(caller => (
                  <button key={caller.name} onClick={() => { triggerFakeCall(caller); setShowCallerPicker(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-left transition-colors">
                    <span>{caller.avatar}</span>
                    <div>
                      <p className="font-medium text-gray-800">{caller.name}</p>
                      <p className="text-xs text-gray-400">{caller.number}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
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

      {/* Quick questions */}
      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="whitespace-nowrap text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full transition-colors shrink-0">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            placeholder="Ask me anything about safety..."
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
