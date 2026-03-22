import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrustedChat } from './TrustedChat';
import { Shield, LogOut, Bell, AlertTriangle, MapPin, Clock } from 'lucide-react';

interface GuardianAlert {
  id: string;
  user_id: string;
  alert_type: string;
  threat_level: string;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  created_at: string | null;
  resolved_at: string | null;
  detected_keywords: string[] | null;
  address: string | null;
}

interface ContactViewProps {
  guardianUserId: string;
  guardianName: string;
}

function mapsUrl(lat: number, lng: number): string {
  return 'https://maps.google.com/?q=' + String(lat) + ',' + String(lng);
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'unknown';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return String(mins) + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return String(hrs) + 'h ago';
  return String(Math.floor(hrs / 24)) + 'd ago';
}

export function ContactView({ guardianUserId, guardianName }: ContactViewProps) {
  const { user, signOut } = useAuth();
  const [alerts, setAlerts] = useState<GuardianAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'alerts'>('chat');

  useEffect(() => {
    loadAlerts();

    const channel = supabase
      .channel('contact_view_alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_alerts',
          filter: 'user_id=eq.' + guardianUserId,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts((prev) => [payload.new as GuardianAlert, ...prev]);
          }
          if (payload.eventType === 'UPDATE') {
            setAlerts((prev) =>
              prev.map((a) =>
                a.id === (payload.new as GuardianAlert).id
                  ? (payload.new as GuardianAlert)
                  : a
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guardianUserId]);

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('sos_alerts')
      .select('*')
      .eq('user_id', guardianUserId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setAlerts(data as GuardianAlert[]);
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50/30 flex flex-col">

      <header className="bg-gradient-to-r from-[#09254b] to-[#0f3a72] text-white px-4 py-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base">Trusted Contact View</div>
              <div className="text-sm text-rose-300 mt-0.5">Monitoring: {guardianName}</div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-2xl text-sm font-medium transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-4 shadow-lg">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Bell size={20} className="flex-shrink-0" />
            <div>
              <div className="font-black text-lg tracking-wide">🚨 ACTIVE EMERGENCY ALERT</div>
              <div className="text-base text-red-100 mt-1">
                {guardianName} triggered an SOS — {timeAgo(activeAlerts[0].created_at)}
              </div>
              {activeAlerts[0].latitude !== null && activeAlerts[0].longitude !== null && (
                <a
                  href={mapsUrl(activeAlerts[0].latitude, activeAlerts[0].longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-red-200 underline flex items-center gap-1 mt-1"
                >
                  <MapPin size={11} /> View location on map
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto w-full px-4 mt-5 pb-10">

        <div className="flex bg-white rounded-2xl shadow-md border border-gray-100 p-1.5 mb-5">
          <button
            onClick={() => setActiveTab('chat')}
            className={
              'flex-1 py-3 rounded-xl text-base font-bold transition-colors ' +
              (activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700')
            }
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={
              'flex-1 py-3 rounded-xl text-base font-bold transition-colors relative ' +
              (activeTab === 'alerts'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700')
            }
          >
            Alerts
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {activeTab === 'chat' && (
          <TrustedChat
            currentUserId={user.id}
            currentUserName={user.email ? user.email.split('@')[0] : 'Contact'}
            guardianUserId={guardianUserId}
            isContactView={true}
          />
        )}

        {activeTab === 'alerts' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-5">
              <h2 className="text-white font-bold text-xl">Alert History</h2>
              <p className="text-rose-200 text-sm mt-0.5">{guardianName}'s recent alerts</p>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <AlertTriangle size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-base font-semibold text-gray-400">No alerts yet</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={
                      'rounded-2xl border p-4 transition-all ' +
                      (alert.status === 'active'
                        ? 'border-rose-300 bg-rose-50 shadow-sm shadow-rose-100'
                        : 'border-gray-100 bg-gray-50/80')
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={
                          'text-xs px-3 py-1 rounded-full font-bold tracking-wide ' +
                          (alert.status === 'active'
                            ? 'bg-rose-500 text-white'
                            : 'bg-gray-200 text-gray-600')
                        }
                      >
                        {alert.status === 'active' ? 'ACTIVE' : 'Resolved'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(alert.created_at)}
                      </span>
                    </div>
                    <div className="text-base text-gray-700 font-semibold capitalize mt-1">
                      {alert.alert_type.replace('_', ' ')} · {alert.threat_level}
                    </div>
                    {alert.latitude !== null && alert.longitude !== null && (
                <a
                  href={mapsUrl(alert.latitude, alert.longitude)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-rose-600 flex items-center gap-1 mt-1"
                      >
                        <MapPin size={11} /> View on map
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}