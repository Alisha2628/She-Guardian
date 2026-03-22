// src/components/OfflineEmergency.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Wifi, WifiOff, Send, Clock, CheckCircle, AlertTriangle, Trash2, RefreshCw, MapPin, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';

interface QueuedAlert {
  id: string;
  message: string;
  location: { lat: number; lng: number } | null;
  timestamp: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  retries: number;
}

const STORAGE_KEY = 'ai_guardian_offline_queue';
const CONTACTS_KEY = 'ai_guardian_contacts';

function loadQueue(): QueuedAlert[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveQueue(q: QueuedAlert[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(q)); } catch {}
}

export function OfflineEmergency() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const QUICK_ALERTS = [
    { label: t.needHelp,         msg: 'EMERGENCY: I need immediate help! Please contact me now.' },
    { label: t.beingFollowed,    msg: 'Someone is following me. Please send help or call me now.' },
    { label: t.medicalEmergency, msg: 'Medical emergency! Please send help immediately.' },
    { label: t.inDanger,         msg: 'I am in danger. Please call me or send help immediately.' },
  ];

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAlert[]>(loadQueue);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [contacts, setContacts] = useState<{ id: string; name: string; phone_number: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [justAutoSent, setJustAutoSent] = useState(false);
  const isSendingRef = useRef(false);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load + cache contacts for offline use
  useEffect(() => {
    const cached = localStorage.getItem(CONTACTS_KEY);
    if (cached) { try { setContacts(JSON.parse(cached)); } catch {} }
    if (user) {
      supabase.from('trusted_contacts').select('id, name, phone_number').eq('user_id', user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setContacts(data);
            localStorage.setItem(CONTACTS_KEY, JSON.stringify(data));
          }
        });
    }
  }, [user]);

  // GPS
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.watchPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => { saveQueue(queue); }, [queue]);

  // Auto-send via Supabase when data returns
  const flushQueue = useCallback(async () => {
    if (isSendingRef.current) return;
    const currentQueue = loadQueue();
    const pending = currentQueue.filter(a => a.status === 'pending' || a.status === 'failed');
    if (pending.length === 0) return;
    isSendingRef.current = true;
    setIsSending(true);
    let sentCount = 0;
    for (const alert of pending) {
      try {
        setQueue(q => q.map(a => a.id === alert.id ? { ...a, status: 'sending' } : a));
        if (user) {
          const { error } = await supabase.from('sos_alerts').insert({
            user_id: user.id,
            alert_type: 'offline_queued',
            threat_level: 'high',
            latitude: alert.location?.lat ?? 0,
            longitude: alert.location?.lng ?? 0,
            status: 'active',
          });
          if (error) throw error;
        }
        setQueue(q => q.map(a => a.id === alert.id ? { ...a, status: 'sent' } : a));
        sentCount++;
        setLastSynced(new Date().toLocaleTimeString());
      } catch {
        setQueue(q => q.map(a => a.id === alert.id ? { ...a, status: 'failed', retries: a.retries + 1 } : a));
      }
    }
    if (sentCount > 0) { setJustAutoSent(true); setTimeout(() => setJustAutoSent(false), 5000); }
    isSendingRef.current = false;
    setIsSending(false);
  }, [user]);

  // Ping every 5s - auto send when data returns
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD', cache: 'no-store',
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok || res.status === 400) {
          setIsOnline(true);
          const q = loadQueue();
          if (q.some(a => a.status === 'pending' || a.status === 'failed')) flushQueue();
        }
      } catch { setIsOnline(navigator.onLine); }
    };
    pingRef.current = setInterval(check, 5000);
    return () => { if (pingRef.current) clearInterval(pingRef.current); };
  }, [flushQueue]);

  useEffect(() => {
    const on = () => { setIsOnline(true); flushQueue(); };
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [flushQueue]);

  useEffect(() => {
    if (isOnline) { intervalRef.current = setInterval(flushQueue, 15000); }
    else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOnline, flushQueue]);

  // Open SMS app with message + location - user picks contact in SMS app
  const sendViaSMS = (message: string) => {
    const locationText = location
      ? `\nMy Location: https://maps.google.com/?q=${location.lat},${location.lng}`
      : '';
    const fullMessage = `EMERGENCY ALERT - She Guardian\n${message}${locationText}\nTime: ${new Date().toLocaleTimeString()}`;
    const isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const sep = isIphone ? '&' : '?';
    // Open SMS app with message pre-filled, no number so user can pick contact
    window.location.href = `sms:${sep}body=${encodeURIComponent(fullMessage)}`;
  };

  // Queue + open SMS
  const handleAlert = (message: string) => {
    // Save to queue for auto-send when data returns
    const newAlert: QueuedAlert = {
      id: Date.now().toString(),
      message,
      location,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retries: 0,
    };
    const newQueue = [newAlert, ...queue];
    setQueue(newQueue);
    saveQueue(newQueue);

    if (isOnline) {
      // Online - send via Supabase immediately
      setTimeout(() => flushQueue(), 300);
    } else {
      // Offline - open SMS app, message pre-filled, user picks contact
      sendViaSMS(message);
    }
  };

  const clearSent = () => setQueue(q => q.filter(a => a.status !== 'sent'));
  const deleteAlert = (id: string) => setQueue(q => q.filter(a => a.id !== id));
  const pendingCount = queue.filter(a => a.status === 'pending' || a.status === 'failed').length;
  const sentCount = queue.filter(a => a.status === 'sent').length;
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
            {isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.offlineEmergencyMode}</h2>
            <p className="text-xs text-gray-500">{t.offlineEmergencyDesc}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
          {isOnline ? t.online : t.offline}
        </div>
      </div>

      {/* Status bar */}
      <div className={`px-4 py-3 rounded-xl mb-4 text-sm border ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
        {isOnline ? (
          <div className="flex items-center justify-between">
            <span>{t.connectedInstant}</span>
            {lastSynced && <span className="text-xs text-green-500">Last synced: {lastSynced}</span>}
          </div>
        ) : (
          <div>
            <p className="font-semibold flex items-center gap-1.5"><Zap size={13} /> Offline - SMS mode active</p>
            <p className="text-xs mt-0.5">Press an alert - SMS app opens with message and your location ready. Pick your contact and tap Send.</p>
          </div>
        )}
      </div>

      {/* Auto-sent banner */}
      {justAutoSent && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl mb-4 text-sm font-semibold flex items-center gap-2">
          <Zap size={15} /> Queued alerts sent automatically when data returned!
        </div>
      )}

      {/* Pending banner */}
      {!isOnline && pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-xl mb-4 text-xs flex items-center gap-2">
          <Clock size={13} /> {pendingCount} alert{pendingCount > 1 ? 's' : ''} queued - auto-sends when data returns
        </div>
      )}

      {/* Location */}
      {location && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl mb-4 text-xs text-blue-700">
          <MapPin size={12} /> Location ready: {location.lat.toFixed(4)}, {location.lng.toFixed(4)} - will be attached to SMS
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center bg-yellow-50 rounded-xl p-3">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-xs text-yellow-600">{t.pendingLabel}</div>
        </div>
        <div className="text-center bg-blue-50 rounded-xl p-3">
          <div className="text-2xl font-bold text-blue-600">{queue.filter(a => a.status === 'sending').length}</div>
          <div className="text-xs text-blue-600">{t.sendingLabel}</div>
        </div>
        <div className="text-center bg-green-50 rounded-xl p-3">
          <div className="text-2xl font-bold text-green-600">{sentCount}</div>
          <div className="text-xs text-green-600">{t.sentLabel}</div>
        </div>
      </div>

      {/* Quick alerts */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.quickAlerts}</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {QUICK_ALERTS.map(({ label, msg }) => (
          <button
            key={label}
            onClick={() => handleAlert(msg)}
            className="py-3 px-3 bg-rose-50 hover:bg-rose-100 active:scale-95 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-all text-left"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom message */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.customMessage}</p>
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder={t.typeEmergencyMsg}
          value={customMessage}
          onChange={e => setCustomMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && customMessage.trim()) { handleAlert(customMessage); setCustomMessage(''); } }}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400"
        />
        <button
          onClick={() => { if (customMessage.trim()) { handleAlert(customMessage); setCustomMessage(''); } }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Queue ({queue.length})</p>
            <div className="flex gap-3">
              {pendingCount > 0 && isOnline && (
                <button onClick={flushQueue} disabled={isSending} className="text-xs text-blue-600 flex items-center gap-1">
                  <RefreshCw size={11} className={isSending ? 'animate-spin' : ''} /> Retry now
                </button>
              )}
              {sentCount > 0 && (
                <button onClick={clearSent} className="text-xs text-gray-400 flex items-center gap-1">
                  <Trash2 size={11} /> Clear sent
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {queue.map(alert => (
              <div key={alert.id} className={`border rounded-xl p-3 text-xs ${
                alert.status === 'sent' ? 'border-green-200 bg-green-50' :
                alert.status === 'failed' ? 'border-red-200 bg-red-50' :
                alert.status === 'sending' ? 'border-blue-200 bg-blue-50' :
                'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 mb-1 truncate">{alert.message}</p>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      {alert.status === 'pending' && <><Clock size={12} className="text-yellow-500" /><span>Queued - auto-sends when data returns</span></>}
                      {alert.status === 'sending' && <><RefreshCw size={12} className="text-blue-500 animate-spin" /><span>Sending...</span></>}
                      {alert.status === 'sent' && <><CheckCircle size={12} className="text-green-500" /><span>Sent successfully</span></>}
                      {alert.status === 'failed' && <><AlertTriangle size={12} className="text-red-500" /><span>Retrying automatically</span></>}
                    </div>
                    <div className="flex gap-3 mt-1 text-gray-400">
                      <span>{formatTime(alert.timestamp)}</span>
                      {alert.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin size={10} />{alert.location.lat.toFixed(3)}, {alert.location.lng.toFixed(3)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteAlert(alert.id)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
