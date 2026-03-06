// src/components/TrustedCircle.tsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Radio, Users, Shield, Navigation, Clock, CheckCircle, AlertTriangle, Loader2, WifiOff, Wifi } from 'lucide-react';

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationUpdate[]>([]);
  const [status, setStatus] = useState<'safe' | 'moving' | 'emergency'>('safe');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [movementCount, setMovementCount] = useState(0);
  const watchRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);
  const prevLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Load contacts
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase.from('trusted_contacts').select('*').eq('user_id', user.id).order('priority');
      setContacts(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  // Online/offline detection
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Calculate distance between two GPS points (meters)
  const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const startSharing = () => {
    if (selectedIds.size === 0) { setError('Please select at least one contact to share with.'); return; }
    if (!navigator.geolocation) { setError('Geolocation not supported on this device.'); return; }
    setError('');
    setIsSharing(true);
    setLocationHistory([]);
    setMovementCount(0);

    // Generate a share link (simulated)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setShareLink(`https://ai-guardian.app/track/${user?.id}?code=${code}`);

    // Set up Supabase realtime channel for broadcasting
    const channel = supabase.channel(`circle:${user?.id}`, {
      config: { broadcast: { self: false } }
    });
    channel.subscribe();
    channelRef.current = channel;

    // Start GPS watching
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(newLoc);
        setLastUpdate(new Date().toLocaleTimeString());

        // Detect movement
        if (prevLocationRef.current) {
          const dist = calcDistance(prevLocationRef.current.lat, prevLocationRef.current.lng, newLoc.lat, newLoc.lng);
          if (dist > 10) { // moved more than 10 meters
            setStatus('moving');
            setMovementCount(c => c + 1);
          } else {
            setStatus(prev => prev === 'emergency' ? 'emergency' : 'safe');
          }
        }
        prevLocationRef.current = newLoc;

        const update: LocationUpdate = {
          lat: newLoc.lat,
          lng: newLoc.lng,
          timestamp: Date.now(),
          status,
        };

        setLocationHistory(prev => [update, ...prev.slice(0, 9)]);

        // Broadcast to trusted circle via Supabase
        channelRef.current?.send({
          type: 'broadcast',
          event: 'location_update',
          payload: {
            user_id: user?.id,
            lat: newLoc.lat,
            lng: newLoc.lng,
            status,
            timestamp: Date.now(),
            contacts: Array.from(selectedIds),
          },
        });
      },
      (err) => setError('Location error: ' + err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const stopSharing = () => {
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    setIsSharing(false);
    setStatus('safe');
    setShareLink('');
    prevLocationRef.current = null;
  };

  const triggerEmergency = () => {
    setStatus('emergency');
    if (onAlertTriggered) onAlertTriggered();
    // Broadcast emergency to channel
    channelRef.current?.send({
      type: 'broadcast',
      event: 'emergency',
      payload: { user_id: user?.id, lat: location?.lat, lng: location?.lng, timestamp: Date.now() },
    });
  };

  const toggleContact = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Trusted Circle</h2>
              <p className="text-rose-100 text-xs">Live location sharing with your trusted contacts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full text-xs text-white">
                <Wifi size={11} /> Online
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-700/50 px-2 py-1 rounded-full text-xs text-white">
                <WifiOff size={11} /> Offline
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Live Status Bar */}
        {isSharing && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-5 ${
            status === 'emergency' ? 'bg-red-50 border-2 border-red-400 animate-pulse' :
            status === 'moving' ? 'bg-yellow-50 border border-yellow-300' :
            'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
              <div>
                <p className={`font-bold text-sm ${status === 'emergency' ? 'text-red-700' : status === 'moving' ? 'text-yellow-700' : 'text-green-700'}`}>
                  Status: {statusLabel}
                </p>
                {location && (
                  <p className="text-xs text-gray-500">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              {lastUpdate && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} /> {lastUpdate}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{movementCount} movements</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Contact selector */}
        {!isSharing && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Select contacts to share location with
            </p>
            {contacts.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Users size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No trusted contacts found.</p>
                <p className="text-xs text-gray-400">Add contacts in the Safety tab first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => toggleContact(contact.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedIds.has(contact.id)
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedIds.has(contact.id) ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {contact.name[0].toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{contact.name}</p>
                        <p className="text-xs text-gray-400">{contact.phone_number}</p>
                      </div>
                    </div>
                    {selectedIds.has(contact.id) && <CheckCircle size={18} className="text-rose-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sharing active view */}
        {isSharing && (
          <div className="mb-5 space-y-3">
            {/* Selected contacts */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sharing with</p>
            <div className="flex flex-wrap gap-2">
              {contacts.filter(c => selectedIds.has(c.id)).map(c => (
                <div key={c.id} className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-medium text-rose-700">
                  <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">{c.name[0]}</div>
                  {c.name}
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1" />
                </div>
              ))}
            </div>

            {/* Share link */}
            {shareLink && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Share tracking link</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-600 flex-1 truncate font-mono">{shareLink}</p>
                  <button
                    onClick={copyLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Location history */}
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
                        <span className={`px-1.5 py-0.5 rounded-full font-semibold text-xs ${
                          loc.status === 'emergency' ? 'bg-red-200' : loc.status === 'moving' ? 'bg-yellow-200' : 'bg-green-200'
                        }`}>{loc.status}</span>
                      </div>
                      <span className="text-gray-400">{new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {!isSharing ? (
            <button
              onClick={startSharing}
              disabled={selectedIds.size === 0 || contacts.length === 0}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-200"
            >
              <Radio size={18} /> Start Live Location Sharing
            </button>
          ) : (
            <>
              {status !== 'emergency' && (
                <button
                  onClick={triggerEmergency}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors animate-pulse shadow-lg shadow-red-200"
                >
                  <AlertTriangle size={18} /> Send Emergency Alert to Circle
                </button>
              )}
              {status === 'emergency' && (
                <div className="w-full bg-red-100 border-2 border-red-500 text-red-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse">
                  <AlertTriangle size={18} /> Emergency Alert Active — Circle Notified
                </div>
              )}
              <button
                onClick={() => setStatus('safe')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Shield size={16} /> I'm Safe — Update Status
              </button>
              <button
                onClick={stopSharing}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm"
              >
                Stop Sharing Location
              </button>
            </>
          )}
        </div>

        {/* Info */}
        {!isSharing && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
            <p className="font-semibold mb-1 flex items-center gap-1"><Shield size={12} /> How Trusted Circle works:</p>
            <p>Select contacts above, then tap Start. Your live GPS location broadcasts to them in real time via Supabase. They can track your movement and receive emergency alerts instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
