import { useState, useEffect, useRef } from 'react';
import { AlertCircle, MapPin, Mic, Clock, Upload, Video, AlertTriangle, Loader2, CheckCircle, ShieldCheck, Phone, PhoneOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';
import { startEvidenceRecording, stopAndUploadEvidence } from '../utils/evidenceRecorder';
import { EvidencePreview } from './EvidencePreview';
import { sendMediaAlertToContacts } from '../utils/chatUtils';

interface SOSButtonProps {
  onAlertTriggered: () => void;
  nightModeEnabled?: boolean;
}

export function SOSButton({ onAlertTriggered, nightModeEnabled = false }: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [escalationCountdown, setEscalationCountdown] = useState<number>(0);
  const [safeCheckReminder, setSafeCheckReminder] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'failed'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastVideoUrl, setLastVideoUrl] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alertTime, setAlertTime] = useState<string | null>(null);
  const [chatSendStatus, setChatSendStatus] = useState<'idle' | 'sent' | 'failed'>('idle');
  const [isSendingSafe, setIsSendingSafe] = useState(false);

  // ── AUTO CALL POLICE STATE ────────────────────────────────────────────────
  const [autoCallEnabled, setAutoCallEnabled] = useState(true);
  const [policeCallCountdown, setPoliceCallCountdown] = useState<number | null>(null);
  const [policeCallStatus, setPoliceCallStatus] = useState<'idle' | 'counting' | 'calling' | 'cancelled'>('idle');
  const policeCallRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // ─────────────────────────────────────────────────────────────────────────

  const { user } = useAuth();
  const { t } = useLanguage();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const escalationRef = useRef<NodeJS.Timeout | null>(null);
  const safeCheckRef = useRef<NodeJS.Timeout | null>(null);

  const SECRET_PHRASE = 'ai guardian help me';
  const HOLD_SECONDS = 4;
  const EVIDENCE_DURATION_MS = 8000;
  const POLICE_CALL_DELAY = 10; // seconds before auto calling police

  // Sync night mode
  useEffect(() => {
    if (nightModeEnabled) {
      setNightMode(true);
      if (!voiceActive && !alertActive) startVoiceListening();
    } else {
      const hour = new Date().getHours();
      const isNight = hour >= 22 || hour < 6;
      setNightMode(isNight);
      if (isNight && !voiceActive && !alertActive) startVoiceListening();
    }
  }, [nightModeEnabled]);

  useEffect(() => {
    if (nightModeEnabled) return;
    const check = () => {
      const hour = new Date().getHours();
      const isNight = hour >= 22 || hour < 6;
      setNightMode(isNight);
      if (isNight && !voiceActive && !alertActive) startVoiceListening();
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [voiceActive, alertActive, nightModeEnabled]);

  // Location tracking
  useEffect(() => {
    if (!navigator.geolocation) { setErrorMessage('Geolocation not supported'); return; }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(newLoc);
        setErrorMessage(null);
        if (user && alertActive) {
          supabase.channel(`user:${user.id}:location`).send({
            type: 'broadcast',
            event: 'location_update',
            payload: { lat: newLoc.lat, lng: newLoc.lng, timestamp: Date.now() },
          });
        }
      },
      () => setErrorMessage('Failed to get location. Please enable location permission.'),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, alertActive]);

  // Escalation countdown
  useEffect(() => {
    if (!alertActive) { setEscalationCountdown(0); return; }
    const interval = setInterval(() => setEscalationCountdown((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [alertActive]);

  // Safe check reminder after 2 minutes
  useEffect(() => {
    if (!alertActive) { setSafeCheckReminder(false); return; }
    safeCheckRef.current = setTimeout(() => setSafeCheckReminder(true), 120000);
    return () => { if (safeCheckRef.current) clearTimeout(safeCheckRef.current); };
  }, [alertActive]);

  // Upload progress simulation
  useEffect(() => {
    if (uploadStatus !== 'uploading') return;
    const interval = setInterval(() => setUploadProgress((p) => Math.min(99, p + Math.random() * 15 + 8)), 300);
    return () => clearInterval(interval);
  }, [uploadStatus]);

  // ── AUTO CALL POLICE COUNTDOWN ────────────────────────────────────────────
  const startPoliceCallCountdown = () => {
    if (!autoCallEnabled) return;
    setPoliceCallStatus('counting');
    setPoliceCallCountdown(POLICE_CALL_DELAY);
    let remaining = POLICE_CALL_DELAY;
    policeCallRef.current = setInterval(() => {
      remaining -= 1;
      setPoliceCallCountdown(remaining);
      if (remaining <= 0) {
        if (policeCallRef.current) clearInterval(policeCallRef.current);
        setPoliceCallStatus('calling');
        setPoliceCallCountdown(null);
        // Auto call police
        window.location.href = 'tel:100';
      }
    }, 1000);
  };

  const cancelPoliceCall = () => {
    if (policeCallRef.current) clearInterval(policeCallRef.current);
    setPoliceCallStatus('cancelled');
    setPoliceCallCountdown(null);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const startVoiceListening = () => {
    const SpeechRecognitionConstructor = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor || recognitionRef.current) return;
    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onsoundstart = () => { setListening(true); if (navigator.vibrate) navigator.vibrate([50, 30, 50]); };
    recognition.onsoundend = () => setListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0]?.transcript?.toLowerCase()?.trim() || '';
      if (result.isFinal && transcript.includes(SECRET_PHRASE)) triggerSOS('voice');
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') { setErrorMessage('Microphone permission denied'); setVoiceActive(false); }
    };
    recognition.onend = () => {
      setListening(false);
      if (voiceActive && !alertActive) {
        setTimeout(() => { try { recognition.start(); } catch { setVoiceActive(false); } }, 500);
      } else { recognitionRef.current = null; }
    };
    try { recognition.start(); recognitionRef.current = recognition; setVoiceActive(true); }
    catch { setVoiceActive(false); setErrorMessage('Failed to start voice recognition'); }
  };

  const stopVoiceListening = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setVoiceActive(false);
    setListening(false);
  };

  const triggerSOS = async (type: 'manual' | 'voice') => {
    if (!user || !location) { setErrorMessage('Cannot send SOS: missing user or location data'); return; }
    setAlertActive(true);
    setEscalationCountdown(0);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage(null);
    setLocalPreviewUrl(null);
    setAlertTime(new Date().toLocaleTimeString());
    setSafeCheckReminder(false);
    setChatSendStatus('idle');

    // ── START POLICE CALL COUNTDOWN ───────────────────────────────────────
    startPoliceCallCountdown();
    // ─────────────────────────────────────────────────────────────────────

    try {
      const { error: insertError } = await supabase
        .from('sos_alerts')
        .insert({
          user_id: user.id,
          alert_type: type,
          threat_level: 'critical',
          latitude: location.lat,
          longitude: location.lng,
          status: 'active',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      onAlertTriggered();

      setTimeout(async () => {
        try {
          const result = await stopAndUploadEvidence(user.id, supabase);
          if (result?.previewUrl) { setLocalPreviewUrl(result.previewUrl); setShowPreview(true); }
          if (result?.url) {
            setLastVideoUrl(result.url);
            setUploadStatus('done');
            await sendVideoToContacts(result.url);
            try {
              await sendMediaAlertToContacts({
                senderId: user.id,
                senderName: user.email?.split('@')[0] ?? 'Guardian User',
                mediaUrl: result.url,
                mediaType: 'video',
              });
              setChatSendStatus('sent');
            } catch { setChatSendStatus('failed'); }
          } else { setUploadStatus('failed'); }
        } catch {
          setUploadStatus('failed');
          setErrorMessage('Failed to process video evidence');
        }
      }, EVIDENCE_DURATION_MS);

    } catch {
      setErrorMessage('Alert sent locally - network issue detected');
      onAlertTriggered();
    }
  };

  const sendVideoToContacts = async (videoUrl: string) => {
    if (!user || !location) return;
    try {
      const { error } = await supabase.functions.invoke('notifyContacts', {
        body: {
          user_id: user.id,
          video_url: videoUrl,
          location: { lat: location.lat, lng: location.lng },
          message: `EMERGENCY ALERT from AI Guardian. User needs immediate help! Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}. Video evidence attached.`,
        },
      });
      if (error) throw error;
    } catch { setErrorMessage('Failed to notify emergency contacts'); }
  };

  const handleImSafe = async () => {
    setIsSendingSafe(true);
    // Cancel police call if still counting
    cancelPoliceCall();

    if (user && lastVideoUrl) {
      try {
        await sendMediaAlertToContacts({
          senderId: user.id,
          senderName: user.email?.split('@')[0] ?? 'Guardian User',
          mediaUrl: lastVideoUrl,
          mediaType: 'video',
        });
        await (supabase as any).from('chat_messages').insert({
          sender_id: user.id,
          recipient_id: null,
          guardian_user_id: user.id,
          sender_name: user.email?.split('@')[0] ?? 'Guardian User',
          message: "✅ I'm safe now. The alert has been cancelled.",
          message_type: 'text',
          created_at: new Date().toISOString(),
          read_at: null,
        });
      } catch { /* non-critical */ }
    }

    setIsSendingSafe(false);
    setAlertActive(false);
    setSafeCheckReminder(false);
    setUploadStatus('idle');
    setAlertTime(null);
    setEscalationCountdown(0);
    setChatSendStatus('idle');
    setLastVideoUrl(null);
    setPoliceCallStatus('idle');
    setPoliceCallCountdown(null);
    if (escalationRef.current) { clearTimeout(escalationRef.current); escalationRef.current = null; }
    if (safeCheckRef.current) { clearTimeout(safeCheckRef.current); safeCheckRef.current = null; }
    if (localPreviewUrl) { URL.revokeObjectURL(localPreviewUrl); setLocalPreviewUrl(null); }
  };

  const handlePress = () => {
    if (!voiceActive) startVoiceListening();
    startEvidenceRecording();
    setIsPressed(true);
    setCountdown(HOLD_SECONDS);
    setErrorMessage(null);
    setLocalPreviewUrl(null);
  };

  const handleRelease = () => {
    setIsPressed(false);
    if (countdown !== null && countdown > 0) {
      stopAndUploadEvidence(user?.id || '', supabase);
      setCountdown(null);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { triggerSOS('manual'); setCountdown(null); setIsPressed(false); return; }
    const timer = setTimeout(() => setCountdown((p) => (p ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    return () => {
      stopVoiceListening();
      if (escalationRef.current) clearTimeout(escalationRef.current);
      if (safeCheckRef.current) clearTimeout(safeCheckRef.current);
      if (policeCallRef.current) clearInterval(policeCallRef.current);
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const dark = nightMode;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
    <style>{`
      @keyframes heartbeat {
        0%   { transform: scale(1); }
        14%  { transform: scale(1.08); }
        28%  { transform: scale(1); }
        42%  { transform: scale(1.05); }
        56%  { transform: scale(1); }
        100% { transform: scale(1); }
      }
      @keyframes sosPulseRing1 {
        0%   { transform: scale(1);    opacity: 0.5; }
        50%  { transform: scale(1.12); opacity: 0.2; }
        100% { transform: scale(1);    opacity: 0.5; }
      }
      @keyframes sosPulseRing2 {
        0%   { transform: scale(1);    opacity: 0.3; }
        50%  { transform: scale(1.18); opacity: 0.1; }
        100% { transform: scale(1);    opacity: 0.3; }
      }
      .sos-beat  { animation: heartbeat 1s ease-in-out infinite; }
      .sos-ring1 { animation: sosPulseRing1 1s ease-in-out infinite; }
      .sos-ring2 { animation: sosPulseRing2 1s ease-in-out infinite 0.15s; }
    `}</style>
    <div className={`flex flex-col items-center gap-6 px-4 py-8 w-full max-w-md mx-auto touch-manipulation transition-colors duration-500 ${dark ? 'bg-gray-950 rounded-2xl' : ''}`}>

      {nightMode && (
        <div className="w-full flex items-center justify-center gap-2 bg-purple-950/80 border border-purple-800/60 text-purple-300 px-4 py-2.5 rounded-2xl text-sm font-medium">
          {t.nightSafetyModeActive}
        </div>
      )}

      {errorMessage && (
        <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-sm">
          <AlertTriangle size={18} /> {errorMessage}
        </div>
      )}

      {alertActive && (
        <div className="w-full bg-gradient-to-b from-red-600 to-rose-700 rounded-3xl p-6 shadow-2xl border border-red-400/40">
          <div className="text-center text-white mb-4">
            <div className="text-4xl font-black mb-1 tracking-wide">🚨 ALERT ACTIVE</div>
            <div className="text-base opacity-90 font-medium">Help has been requested · Contacts notified</div>
            {alertTime && <div className="text-xs opacity-70 mt-1">Started at {alertTime}</div>}
          </div>

          {/* Timer */}
          <div className="bg-black/20 rounded-2xl px-4 py-4 mb-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white">
              <Clock size={16} />
              <span className="text-sm font-medium opacity-80">Alert active for</span>
              <span className="text-3xl font-black tabular-nums">{formatTime(escalationCountdown)}</span>
            </div>
          </div>

          {/* ── AUTO CALL POLICE BANNER ─────────────────────────────────── */}
          {policeCallStatus === 'counting' && policeCallCountdown !== null && (
            <div className="bg-orange-500/30 border-2 border-orange-400/60 rounded-2xl px-4 py-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-white">
                  <Phone size={16} className="animate-pulse" />
                  <span className="font-bold text-sm">Auto-calling Police (100) in</span>
                </div>
                <span className="text-3xl font-black text-white tabular-nums">{policeCallCountdown}s</span>
              </div>
              <button
                onClick={cancelPoliceCall}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <PhoneOff size={14} /> Cancel Auto-Call
              </button>
            </div>
          )}

          {policeCallStatus === 'calling' && (
            <div className="bg-green-500/30 border border-green-400/40 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2 text-green-100 text-sm font-medium">
              <Phone size={14} className="animate-pulse" /> Calling Police (100)...
            </div>
          )}

          {policeCallStatus === 'cancelled' && (
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2 text-white/70 text-sm">
              <PhoneOff size={14} /> Auto-call cancelled
              <button onClick={() => window.location.href = 'tel:100'} className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-lg">
                Call Now
              </button>
            </div>
          )}
          {/* ──────────────────────────────────────────────────────────── */}

          {uploadStatus === 'uploading' && (
            <div className="bg-amber-400/20 border border-amber-300/40 rounded-2xl px-4 py-3 mb-3 flex items-center gap-2 text-amber-100 text-sm font-medium">
              <Upload className="animate-spin" size={14} /> Uploading video evidence... {Math.round(uploadProgress)}%
            </div>
          )}
          {uploadStatus === 'done' && (
            <div className="bg-emerald-400/20 border border-emerald-300/40 rounded-2xl px-4 py-3 mb-3 flex items-center gap-2 text-emerald-100 text-sm font-medium">
              <CheckCircle size={14} /> Video uploaded and sent to contacts
            </div>
          )}
          {chatSendStatus === 'sent' && (
            <div className="bg-purple-400/20 border border-purple-300/40 rounded-2xl px-4 py-3 mb-3 flex items-center gap-2 text-purple-100 text-sm font-medium">
              <CheckCircle size={14} /> Recording sent to Trusted Chat
            </div>
          )}

          {location && (
            <div className="bg-black/20 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2 text-red-100 text-sm">
              <MapPin size={12} /> Live location being shared: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}

          {safeCheckReminder && (
            <div className="bg-amber-300 text-amber-900 rounded-2xl px-4 py-4 mb-4 text-center text-base font-bold shadow-lg">
              Are you okay? Press "I'm Safe" if you are safe now.
            </div>
          )}

          <button
            onClick={handleImSafe}
            disabled={isSendingSafe}
            className="w-full bg-emerald-400 hover:bg-emerald-300 text-emerald-900 font-black text-2xl py-6 rounded-3xl active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 border-2 border-emerald-300/50"
          >
            {isSendingSafe ? (
              <><Loader2 size={24} className="animate-spin" /> Notifying contacts...</>
            ) : (
              <><ShieldCheck size={28} /> I'M SAFE - Cancel Alert</>
            )}
          </button>
          <p className="text-center text-red-200 text-sm mt-2 font-medium">
            Press when you are safe to cancel the alert
          </p>

          {/* Auto call toggle */}
          <div className="mt-4 flex items-center justify-between bg-black/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Phone size={14} />
              Auto-call police on next SOS
            </div>
            <button
              onClick={() => setAutoCallEnabled(p => !p)}
              className={`relative w-10 h-6 rounded-full transition-colors ${autoCallEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoCallEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      )}

      {!alertActive && (
        <>
          {/* Auto call police toggle */}
          <div className={`w-full flex items-center justify-between ${dark ? 'bg-gray-800' : 'bg-rose-50 border border-rose-100'} rounded-2xl px-4 py-3`}>
            <div className={`flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-rose-700'} text-sm font-medium`}>
              <Phone size={15} />
              Auto-call Police (100) after SOS
            </div>
            <button
              onClick={() => setAutoCallEnabled(p => !p)}
              className={`relative w-12 h-6 rounded-full transition-colors ${autoCallEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoCallEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <button
            onPointerDown={handlePress}
            onPointerUp={handleRelease}
            onPointerCancel={handleRelease}
            onPointerLeave={handleRelease}
            className={`
              relative w-72 h-72 sm:w-80 sm:h-80 rounded-full transition-all duration-200 shadow-2xl
              active:scale-95 touch-manipulation select-none
              ${isPressed
                ? 'bg-red-800 scale-95 ring-8 ring-red-500/50'
                : 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 hover:scale-105'
              }
            `}
          >
            <div className="sos-beat absolute inset-0 rounded-full bg-white/10" />
            <div className="sos-ring1 absolute -inset-4 rounded-full border-4 border-rose-400/40" />
            <div className="sos-ring2 absolute -inset-8 rounded-full border-2 border-rose-300/25" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              {countdown !== null ? (
                <>
                  <div className="text-9xl font-black tabular-nums leading-none">{countdown}</div>
                  <div className="text-xl mt-3 font-bold">{countdown > 0 ? 'Release to cancel' : 'Sending alert...'}</div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-20 h-20 sm:w-24 sm:h-24 mb-3" strokeWidth={2.2} />
                  <div className="text-5xl sm:text-6xl font-black tracking-widest">SOS</div>
                  <div className="text-base mt-2 opacity-90 font-semibold">Hold {HOLD_SECONDS} seconds</div>
                </>
              )}
            </div>
          </button>

          {voiceActive && (
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-md text-base font-semibold ${listening ? 'bg-green-200 text-green-900 animate-pulse ring-2 ring-green-400' : 'bg-green-100 text-green-800'}`}>
              <Mic className="w-5 h-5" />
              {listening ? 'Listening... Speak now' : 'Voice SOS active'}
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <button
              onClick={async () => {
                if (!user) return;
                setUploadStatus('uploading');
                setUploadProgress(0);
                try {
                  const result = await stopAndUploadEvidence(user.id, supabase);
                  if (result?.previewUrl) { setLocalPreviewUrl(result.previewUrl); setShowPreview(true); }
                  if (result?.url) {
                    setLastVideoUrl(result.url);
                    setUploadStatus('done');
                    await sendVideoToContacts(result.url);
                    try {
                      await sendMediaAlertToContacts({
                        senderId: user.id,
                        senderName: user.email?.split('@')[0] ?? 'Guardian User',
                        mediaUrl: result.url,
                        mediaType: 'video',
                      });
                    } catch {}
                  } else setUploadStatus('failed');
                } catch { setUploadStatus('failed'); }
              }}
              className={`px-6 py-3.5 ${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-slate-700 hover:bg-slate-800'} text-white rounded-2xl font-semibold text-sm min-w-[160px] transition-all shadow-lg disabled:opacity-60`}
              disabled={uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} />Processing...</span>
              ) : 'Stop & Preview Camera'}
            </button>
          </div>

          {location && (
            <div className={`flex items-center gap-2 ${dark ? 'bg-gray-800 text-gray-300' : 'bg-rose-50 text-rose-700 border border-rose-100'} px-5 py-3 rounded-full text-sm shadow-sm font-medium`}>
              <MapPin className="w-4 h-4 text-rose-500" /> Live location tracking active
            </div>
          )}

          <p className={`text-center ${dark ? 'text-gray-400' : 'text-gray-500'} max-w-md mt-2 text-sm`}>
            Hold for {HOLD_SECONDS} seconds or say <strong>"{SECRET_PHRASE}"</strong> to trigger emergency alerts.
            {nightMode && ' Night Safety Mode active.'}
          </p>
        </>
      )}

      {showPreview && localPreviewUrl && (
        <EvidencePreview
          onClose={() => { setShowPreview(false); if (localPreviewUrl) { URL.revokeObjectURL(localPreviewUrl); setLocalPreviewUrl(null); } }}
          previewUrl={localPreviewUrl}
        />
      )}
    </div>
    </>
  );
}
