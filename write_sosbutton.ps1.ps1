$content = @'
import { useState, useEffect, useRef } from 'react';
import { AlertCircle, MapPin, Mic, Clock, Upload, Video, AlertTriangle, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { startEvidenceRecording, stopAndUploadEvidence } from '../utils/evidenceRecorder';
import { EvidencePreview } from './EvidencePreview';

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

  const { user } = useAuth();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const escalationRef = useRef<NodeJS.Timeout | null>(null);
  const safeCheckRef = useRef<NodeJS.Timeout | null>(null);

  const SECRET_PHRASE = 'ai guardian help me';
  const HOLD_SECONDS = 4;
  const EVIDENCE_DURATION_MS = 8000;
  //  NO auto-cancel timer - alert stays until user presses "I'm Safe"

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

  // Escalation countdown display (counts UP - shows how long alert has been active)
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

      // Evidence recording
      setTimeout(async () => {
        try {
          const result = await stopAndUploadEvidence(user.id, supabase);
          if (result?.previewUrl) { setLocalPreviewUrl(result.previewUrl); setShowPreview(true); }
          if (result?.url) {
            setLastVideoUrl(result.url);
            setUploadStatus('done');
            await sendVideoToContacts(result.url);
          } else {
            setUploadStatus('failed');
          }
        } catch {
          setUploadStatus('failed');
          setErrorMessage('Failed to process video evidence');
        }
      }, EVIDENCE_DURATION_MS);

    } catch (err: any) {
      // Even if DB fails, keep alert active and notify contacts
      setErrorMessage('Alert sent locally - network issue detected');
      onAlertTriggered();
      // Do NOT set alertActive false - alert must stay on screen
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

  //  Only way to cancel alert is pressing "I'm Safe"
  const handleImSafe = () => {
    setAlertActive(false);
    setSafeCheckReminder(false);
    setUploadStatus('idle');
    setAlertTime(null);
    setEscalationCountdown(0);
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
    <div className={`flex flex-col items-center gap-5 px-4 py-6 w-full max-w-md mx-auto touch-manipulation transition-colors duration-500 ${dark ? 'bg-gray-950 rounded-2xl' : ''}`}>

      {/* Night Mode Banner */}
      {nightMode && (
        <div className="w-full flex items-center justify-center gap-2 bg-purple-900 border border-purple-700 text-purple-200 px-4 py-2 rounded-xl text-sm font-medium">
          Night Safety Mode Active - Voice monitoring increased
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={18} /> {errorMessage}
        </div>
      )}

      {/*  ALERT ACTIVE PANEL - stays until I'm Safe pressed  */}
      {alertActive && (
        <div className="w-full bg-red-600 rounded-2xl p-5 shadow-2xl border-4 border-red-400 animate-pulse">
          <div className="text-center text-white mb-4">
            <div className="text-3xl font-black mb-1">ALERT ACTIVE</div>
            <div className="text-sm opacity-90">Help has been requested - contacts notified</div>
            {alertTime && <div className="text-xs opacity-70 mt-1">Started at {alertTime}</div>}
          </div>

          {/* Timer */}
          <div className="bg-red-700/60 rounded-xl px-4 py-3 mb-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white">
              <Clock size={16} />
              <span className="text-sm font-medium">Alert active for</span>
              <span className="text-xl font-black">{formatTime(escalationCountdown)}</span>
            </div>
          </div>

          {/* Upload status */}
          {uploadStatus === 'uploading' && (
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-2 mb-3 flex items-center gap-2 text-yellow-200 text-sm">
              <Upload className="animate-spin" size={14} /> Uploading video evidence... {Math.round(uploadProgress)}%
            </div>
          )}
          {uploadStatus === 'done' && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-2 mb-3 flex items-center gap-2 text-green-200 text-sm">
              <CheckCircle size={14} /> Video uploaded and sent to contacts
            </div>
          )}
          {uploadStatus === 'failed' && (
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 mb-3 flex items-center gap-2 text-white/80 text-sm">
              <AlertCircle size={14} /> Video upload failed
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="bg-red-700/40 rounded-xl px-4 py-2 mb-4 flex items-center gap-2 text-red-100 text-xs">
              <MapPin size={12} /> Live location being shared: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}

          {/* Safe check reminder */}
          {safeCheckReminder && (
            <div className="bg-yellow-400 text-yellow-900 rounded-xl px-4 py-3 mb-4 text-center text-sm font-bold animate-bounce">
              Are you okay? Press "I'm Safe" if you are safe now.
            </div>
          )}

          {/* I'M SAFE BUTTON - only way to dismiss */}
          <button
            onClick={handleImSafe}
            className="w-full bg-white text-red-600 font-black text-xl py-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <ShieldCheck size={28} />
            I'M SAFE - Cancel Alert
          </button>
          <p className="text-center text-red-200 text-xs mt-2">
            Alert will remain active until you press this button
          </p>
        </div>
      )}

      {/* Main SOS Button - hidden while alert active */}
      {!alertActive && (
        <>
          <button
            onPointerDown={handlePress}
            onPointerUp={handleRelease}
            onPointerCancel={handleRelease}
            onPointerLeave={handleRelease}
            className={`
              relative w-64 h-64 sm:w-72 sm:h-72 rounded-full transition-all duration-200 shadow-2xl
              active:scale-95 touch-manipulation select-none
              ${isPressed
                ? 'bg-red-800 scale-95 ring-4 ring-red-600/60'
                : 'bg-gradient-to-br from-red-500 to-rose-600 hover:scale-105 hover:ring-4 hover:ring-red-400/40'
              }
            `}
          >
            <div className="absolute inset-0 rounded-full bg-white/15 animate-pulse" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              {countdown !== null ? (
                <>
                  <div className="text-8xl sm:text-9xl font-black">{countdown}</div>
                  <div className="text-xl mt-2">{countdown > 0 ? 'Release to cancel' : 'Sending alert...'}</div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-20 h-20 sm:w-24 sm:h-24 mb-3" strokeWidth={2.2} />
                  <div className="text-4xl sm:text-5xl font-black tracking-tight">SOS</div>
                  <div className="text-sm mt-1 opacity-90">Hold {HOLD_SECONDS} seconds</div>
                </>
              )}
            </div>
          </button>

          {/* Voice status */}
          {voiceActive && (
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full shadow-sm text-sm font-medium ${listening ? 'bg-green-200 text-green-900 animate-pulse ring-2 ring-green-400' : 'bg-green-100 text-green-800'}`}>
              <Mic className="w-5 h-5" />
              {listening ? 'Listening... Speak now' : 'Voice SOS active'}
              {nightMode && <span className="text-purple-700 text-xs ml-1">(Night mode)</span>}
            </div>
          )}

          {/* Camera button */}
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <button
              onClick={async () => {
                if (!user) return;
                setUploadStatus('uploading');
                setUploadProgress(0);
                try {
                  const result = await stopAndUploadEvidence(user.id, supabase);
                  if (result?.previewUrl) { setLocalPreviewUrl(result.previewUrl); setShowPreview(true); }
                  if (result?.url) { setLastVideoUrl(result.url); setUploadStatus('done'); await sendVideoToContacts(result.url); }
                  else setUploadStatus('failed');
                } catch { setUploadStatus('failed'); }
              }}
              className={`px-5 py-3 ${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-900'} text-white rounded-lg font-medium text-sm min-w-[140px] transition shadow disabled:opacity-60`}
              disabled={uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} />Processing...</span>
              ) : 'Stop & Preview Camera'}
            </button>
          </div>

          {/* Location status */}
          {location && (
            <div className={`flex items-center gap-2 ${dark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} px-5 py-2.5 rounded-full text-sm shadow-sm`}>
              <MapPin className="w-4 h-4 text-rose-500" /> Live location tracking active
            </div>
          )}

          <p className={`text-center ${dark ? 'text-gray-400' : 'text-gray-500'} max-w-md mt-2 text-xs sm:text-sm`}>
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
  );
}

'@
[System.IO.File]::WriteAllText("src\components\SOSButton.tsx", $content, [System.Text.Encoding]::UTF8)
Write-Host "SOSButton.tsx written successfully!"
