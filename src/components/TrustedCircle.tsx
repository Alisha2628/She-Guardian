// src/components/TrustedCircle.tsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';
import { Radio, Users, Shield, Navigation, Clock, CheckCircle, AlertTriangle, Loader2, WifiOff, Wifi, MessageSquare } from 'lucide-react';

type Contact = {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  priority?: number;
  user_id: string;
};

type LocationUpdate = {
  lat: number;
  lng: number;
  timestamp: number;
  status: 'safe' | 'moving' | 'emergency';
};

interface TrustedCircleProps {
  onAlertTriggered?: () => void;
}

export function TrustedCircle({ onAlertTriggered }: TrustedCircleProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationUpdate[]>([]);
  const [status, setStatus] = useState<'safe' | 'moving' | 'emergency'>('safe');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [movementCount, setMovementCount] = useState(0);
  const [smsSent, setSmsSent] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [copied, setCopied] = useState(false);
  const watchRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);
  const prevLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  // Use a ref to always have latest selectedIds in async callbacks
  const selectedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      setContacts(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Send SMS via Supabase Edge Function (Twilio)
  const sendSMSToContacts = async (lat: number, lng: number, selectedContacts: Contact[], isEmergency = false) => {
    if (selectedContacts.length === 0) {
      console.warn('No contacts selected for SMS');
      setError('No contacts selected!');
      return;
    }

    setSendingSMS(true);
    setError('');
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const time = new Date().toLocaleTimeString();

   const message = isEmergency
  ? `SOS! Need help! Location: ${mapsLink} Time: ${time}`
  : `Live location: ${mapsLink} Time: ${time} - SheGuardian`;

    const numbers = selectedContacts.map(c =>
      c.phone_number.replace(/\s+/g, '').replace(/-/g, '')
    );

    console.log('Sending SMS to:', numbers);
    console.log('Message:', message);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-sms', {
        body: { to: numbers, message },
      });

      console.log('SMS response:', data, fnError);

      if (fnError) throw fnError;

      setSmsSent(true);
      setTimeout(() => setSmsSent(false), 4000);
    } catch (err: any) {
      console.error('SMS error:', err);
      setError('SMS failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSendingSMS(false);
    }
  };

  const startSharing = () => {
    if (selectedIds.size === 0) { setError('Please select at least one contact to share with.'); return; }
    if (!navigator.geolocation) { setError('Geolocation not supported on this device.'); return; }
    setError('');
    setGettingLocation(true);

    // Capture selected contacts BEFORE async operation
    const currentSelectedIds = new Set(selectedIds);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(newLoc);
        setGettingLocation(false);
        setIsSharing(true);
        setLocationHistory([]);
        setMovementCount(0);

        // Use captured IDs to filter contacts
        const selectedContacts = contacts.filter(c => currentSelectedIds.has(c.id));
        console.log('Selected contacts for SMS:', selectedContacts);

        // Send SMS automatically
        await sendSMSToContacts(newLoc.lat, newLoc.lng, selectedContacts, false);

        // Start live GPS + Supabase broadcast
        const channel = supabase.channel(`circle:${user?.id}`, {
          config: { broadcast: { self: false } }
        });
        channel.subscribe();
        channelRef.current = channel;

        watchRef.current = navigator.geolocation.watchPosition(
          (pos2) => {
            const loc2 = { lat: pos2.coords.latitude, lng: pos2.coords.longitude };
            setLocation(loc2);
            setLastUpdate(new Date().toLocaleTimeString());

            if (prevLocationRef.current) {
              const dist = calcDistance(prevLocationRef.current.lat, prevLocationRef.current.lng, loc2.lat, loc2.lng);
              if (dist > 10) {
                setStatus('moving');
                setMovementCount(c => c + 1);
              } else {
                setStatus(prev => prev === 'emergency' ? 'emergency' : 'safe');
              }
            }
            prevLocationRef.current = loc2;

            setLocationHistory(prev => [
              { lat: loc2.lat, lng: loc2.lng, timestamp: Date.now(), status },
              ...prev.slice(0, 9),
            ]);

            channelRef.current?.send({
              type: 'broadcast',
              event: 'location_update',
              payload: { user_id: user?.id, lat: loc2.lat, lng: loc2.lng, status, timestamp: Date.now() },
            });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
      },
      (err) => {
        setGettingLocation(false);
        setError('Could not get location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const stopSharing = () => {
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    setIsSharing(false);
    setStatus('safe');
    prevLocationRef.current = null;
    setSmsSent(false);
  };

  const triggerEmergency = async () => {
    setStatus('emergency');
    if (onAlertTriggered) onAlertTriggered();

    if (location) {
      // Use ref to get latest selectedIds
      const selectedContacts = contacts.filter(c => selectedIdsRef.current.has(c.id));
      console.log('Emergency contacts:', selectedContacts);
      await sendSMSToContacts(location.lat, location.lng, selectedContacts, true);
    }

    channelRef.current?.send({
      type: 'broadcast',
      event: 'emergency',
      payload: { user_id: user?.id, lat: location?.lat, lng: location?.lng, timestamp: Date.now() },
    });
  };

  const resendSMS = async () => {
    if (!location) return;
    const selectedContacts = contacts.filter(c => selectedIdsRef.current.has(c.id));
    await sendSMSToContacts(location.lat, location.lng, selectedContacts, false);
  };

  const toggleContact = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const copyLocation = () => {
    if (!location) return;
    navigator.clipboard.writeText(`https://maps.google.com/?q=${location.lat},${location.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = status === 'emergency' ? 'bg-red-500' : status === 'moving' ? 'bg-yellow-500' : 'bg-green-500';
  const statusLabel = status === 'emergency' ? 'EMERGENCY' : status === 'moving' ? 'Moving' : 'Safe';

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-rose-600" size={24} />
        <span className="text-gray-500">Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-rose-100/60">
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">{t.trustedCircleTitle}</h2>
              <p className="text-rose-200 text-sm mt-0.5">{t.trustedCircleDesc}</p>
            </div>
          </div>
          {isOnline ? (
            <div className="flex items-center gap-1.5 bg-emerald-400/30 border border-emerald-300/40 px-3 py-1.5 rounded-full text-sm text-white font-medium">
              <Wifi size={13} /> {t.online}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-700/60 border border-red-500/40 px-3 py-1.5 rounded-full text-sm text-white font-medium">
              <WifiOff size={13} /> {t.offline}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">

        {smsSent && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle size={16} /> SMS sent successfully to your trusted contacts! ✅
          </div>
        )}

        {sendingSMS && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Sending SMS to contacts...
          </div>
        )}

        {isSharing && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${
            status === 'emergency' ? 'bg-rose-50 border-2 border-rose-400' :
            status === 'moving' ? 'bg-amber-50 border border-amber-300' :
            'bg-emerald-50 border border-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
              <div>
                <p className={`font-bold text-sm ${status === 'emergency' ? 'text-rose-700' : status === 'moving' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  Status: {statusLabel}
                </p>
                {location && <p className="text-xs text-gray-500">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
              </div>
            </div>
            <div className="text-right">
              {lastUpdate && <div className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} /> {lastUpdate}</div>}
              <p className="text-xs text-gray-400 mt-0.5">{movementCount} movements</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {!isSharing && (
          <div>
            <p className="text-sm font-bold text-gray-600 mb-3">{t.selectContacts}</p>
            {contacts.length === 0 ? (
              <div className="text-center py-8 bg-rose-50/40 rounded-2xl border border-dashed border-rose-200">
                <Users size={28} className="text-rose-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">No trusted contacts found.</p>
                <p className="text-xs text-gray-400">Add contacts in the Safety tab first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => toggleContact(contact.id)}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all ${
                      selectedIds.has(contact.id) ? 'border-rose-400 bg-rose-50' : 'border-gray-100 bg-gray-50 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black ${
                        selectedIds.has(contact.id) ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {contact.name[0].toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-base font-bold text-gray-800">{contact.name}</p>
                        <p className="text-sm text-gray-400">{contact.phone_number}</p>
                      </div>
                    </div>
                    {selectedIds.has(contact.id) && <CheckCircle size={18} className="text-rose-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isSharing && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sharing with</p>
            <div className="flex flex-wrap gap-2">
              {contacts.filter(c => selectedIds.has(c.id)).map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-2 rounded-full text-sm font-semibold text-rose-700">
                  <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">{c.name[0]}</div>
                  {c.name}
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1" />
                </div>
              ))}
            </div>

            <button
              onClick={resendSMS}
              disabled={sendingSMS || !location}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {sendingSMS ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><MessageSquare size={14} /> Resend Location SMS</>}
            </button>

            {location && (
              <button onClick={copyLocation} className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors">
                {copied ? <><CheckCircle size={14} className="text-green-500" /> Copied!</> : <><Navigation size={14} /> Copy Location Link</>}
              </button>
            )}

            {locationHistory.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location History</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {locationHistory.map((loc, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                      loc.status === 'emergency' ? 'bg-red-50 text-red-700' :
                      loc.status === 'moving' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Navigation size={11} />
                        <span>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                      </div>
                      <span className="text-gray-400">{new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {!isSharing ? (
            <button
              onClick={startSharing}
              disabled={selectedIds.size === 0 || contacts.length === 0 || gettingLocation}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-xl shadow-rose-200"
            >
              {gettingLocation ? (
                <><Loader2 size={18} className="animate-spin" /> Getting your location...</>
              ) : (
                <><Radio size={18} /> {t.startLiveLocation}</>
              )}
            </button>
          ) : (
            <>
              {status !== 'emergency' && (
                <button
                  onClick={triggerEmergency}
                  disabled={sendingSMS}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-200"
                >
                  {sendingSMS ? <><Loader2 size={18} className="animate-spin" /> Sending Emergency SMS...</> : <><AlertTriangle size={18} /> Send Emergency Alert via SMS</>}
                </button>
              )}
              {status === 'emergency' && (
                <div className="w-full bg-red-100 border-2 border-red-500 text-red-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse">
                  <AlertTriangle size={18} /> Emergency SMS Sent — Circle Notified
                </div>
              )}
              <button onClick={() => setStatus('safe')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors">
                <Shield size={16} /> I'm Safe — Update Status
              </button>
              <button onClick={stopSharing} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors text-sm border border-gray-200">
                Stop Sharing Location
              </button>
            </>
          )}
        </div>

        {!isSharing && (
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 text-sm text-violet-700">
            <p className="font-bold mb-2 flex items-center gap-1.5 text-violet-800"><Shield size={14} /> {t.howTrustedCircleWorks}</p>
            <p>Select contacts → tap Start → SMS is automatically sent with your live Google Maps location. Emergency alert sends 🚨 SMS instantly to all contacts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
