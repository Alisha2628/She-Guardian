import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertTriangle, Shield, Radio } from 'lucide-react';
import { analyzeText, shouldTriggerAlert } from '../utils/distressDetector';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';

interface AIMonitorProps {
  onThreatDetected: () => void;
}

export function AIMonitor({ onThreatDetected }: AIMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [inputText, setInputText] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [threatStatus, setThreatStatus] = useState<{
    detected: boolean;
    level: string;
    keywords: string[];
    source: 'typed' | 'voice';
  } | null>(null);
  const [voiceError, setVoiceError] = useState('');
  const [interimText, setInterimText] = useState('');

  const { t } = useLanguage();
  const { user } = useAuth();
  const recognitionRef = useRef<any>(null);
  const alertedRef = useRef(false);

  // Analyze typed text
  useEffect(() => {
    if (!inputText || voiceMode) { if (!voiceMode) setThreatStatus(null); return; }
    const analysis = analyzeText(inputText);
    setThreatStatus({
      detected: analysis.isThreat,
      level: analysis.threatLevel,
      keywords: analysis.detectedKeywords,
      source: 'typed',
    });
    if (shouldTriggerAlert(analysis) && !alertedRef.current) {
      alertedRef.current = true;
      triggerAIAlert(analysis);
      setTimeout(() => { alertedRef.current = false; }, 10000);
    }
  }, [inputText, voiceMode]);

  // Analyze voice text
  useEffect(() => {
    if (!voiceText || !voiceMode) return;
    const analysis = analyzeText(voiceText);
    setThreatStatus({
      detected: analysis.isThreat,
      level: analysis.threatLevel,
      keywords: analysis.detectedKeywords,
      source: 'voice',
    });
    if (shouldTriggerAlert(analysis) && !alertedRef.current) {
      alertedRef.current = true;
      triggerAIAlert(analysis);
      setTimeout(() => { alertedRef.current = false; }, 10000);
    }
  }, [voiceText, voiceMode]);

  const triggerAIAlert = async (analysis: ReturnType<typeof analyzeText>) => {
    if (!user) return;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { error } = await supabase.from('sos_alerts').insert({
        user_id: user.id,
        alert_type: 'ai_detected',
        threat_level: analysis.threatLevel,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        detected_keywords: analysis.detectedKeywords,
        status: 'active',
      });
      if (error) throw error;
      onThreatDetected();
      setInputText('');
      setVoiceText('');
    } catch (error) {
      console.error('Error triggering AI alert:', error);
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice recognition not supported. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => { setIsListening(true); setVoiceError(''); };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (final) {
        setVoiceText(prev => (prev + ' ' + final).trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setVoiceError('Microphone permission denied. Please allow in browser settings.');
      } else if (event.error === 'no-speech') {
        setVoiceError('No speech detected. Please speak clearly.');
      } else {
        setVoiceError('Voice error: ' + event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      // Auto restart if still monitoring
      if (voiceMode && isMonitoring) {
        setTimeout(() => {
          try { recognition.start(); setIsListening(true); } catch {}
        }, 500);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setVoiceError('Failed to start voice recognition.');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  };

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    alertedRef.current = false;
    setThreatStatus(null);
    setInputText('');
    setVoiceText('');
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    stopVoiceRecognition();
    setVoiceMode(false);
    setThreatStatus(null);
    setInputText('');
    setVoiceText('');
    setInterimText('');
  };

  const handleVoiceModeToggle = () => {
    if (!voiceMode) {
      setVoiceMode(true);
      setInputText('');
      setVoiceText('');
      setThreatStatus(null);
      startVoiceRecognition();
    } else {
      setVoiceMode(false);
      stopVoiceRecognition();
      setVoiceText('');
      setInterimText('');
      setThreatStatus(null);
    }
  };

  const getThreatColor = (level: string) => {
    if (level === 'critical') return 'bg-red-600 text-white';
    if (level === 'high') return 'bg-orange-500 text-white';
    if (level === 'medium') return 'bg-yellow-400 text-gray-900';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.aiAssistantTitle}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {t.aiAssistantSubtitle}
          </p>
        </div>
        <button
          onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            isMonitoring
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isMonitoring ? (
            <><Mic className="w-4 h-4" /> Monitoring Active</>
          ) : (
            <><MicOff className="w-4 h-4" /> Start Monitoring</>
          )}
        </button>
      </div>

      {isMonitoring && (
        <>
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { if (voiceMode) handleVoiceModeToggle(); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                !voiceMode ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Type Mode
            </button>
            <button
              onClick={() => { if (!voiceMode) handleVoiceModeToggle(); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                voiceMode ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Radio className="w-4 h-4" /> Voice Mode
            </button>
          </div>

          {/* TYPE MODE */}
          {!voiceMode && (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type messages to analyze for distress signals..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none text-sm"
            />
          )}

          {/* VOICE MODE */}
          {voiceMode && (
            <div className="mb-4">
              {/* Mic indicator */}
              <div className={`flex items-center justify-center gap-3 py-4 rounded-xl border-2 mb-3 ${
                isListening
                  ? 'border-rose-400 bg-rose-50 animate-pulse'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-gray-300'}`} />
                <span className={`text-sm font-medium ${isListening ? 'text-rose-600' : 'text-gray-500'}`}>
                  {isListening ? 'Listening... Speak now' : 'Microphone inactive'}
                </span>
              </div>

              {/* Voice error */}
              {voiceError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mb-3">
                  {voiceError}
                </div>
              )}

              {/* Interim (live) text */}
              {interimText && (
                <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg mb-3">
                  <p className="text-xs text-blue-500 font-medium mb-1">Hearing now...</p>
                  <p className="text-sm text-blue-700 italic">{interimText}</p>
                </div>
              )}

              {/* Final transcribed text */}
              {voiceText && (
                <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium mb-1">Transcribed text:</p>
                  <p className="text-sm text-gray-800">{voiceText}</p>
                  <button
                    onClick={() => { setVoiceText(''); setThreatStatus(null); alertedRef.current = false; }}
                    className="text-xs text-gray-400 hover:text-red-500 mt-2 underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {!voiceText && !interimText && !voiceError && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  Speak clearly near your microphone. AI will analyze your words in real time.
                </p>
              )}
            </div>
          )}

          {/* Threat Status */}
          {threatStatus && (
            <div className={`mt-4 p-4 rounded-lg border ${
              threatStatus.detected
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {threatStatus.detected ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">Threat Detected</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-auto ${getThreatColor(threatStatus.level)}`}>
                      {threatStatus.level.toUpperCase()}
                    </span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">No Threat Detected</span>
                  </>
                )}
              </div>
              {threatStatus.detected && (
                <div className="text-sm space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    Source: <span className="font-medium text-gray-700 capitalize">{threatStatus.source} input</span>
                  </div>
                  {threatStatus.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {threatStatus.keywords.map(kw => (
                        <span key={kw} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* How it works */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">How It Works</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>— Type Mode: type or paste any message to analyze</li>
              <li>— Voice Mode: speak and AI converts to text instantly</li>
              <li>— Detects keywords like "help", "stop", "danger", "scared"</li>
              <li>— Automatically triggers SOS for high-threat situations</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
