// src/components/AlertHistory.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Alert {
  id: string;
  user_id: string;
  alert_type: string;
  threat_level: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  detected_keywords: string[] | null;
}

export function AlertHistory() {

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAlerts = async () => {

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAlerts(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // REALTIME GLOBAL ALERT LISTENER
  useEffect(() => {

    const channel = supabase
      .channel('alert_history_global')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_alerts',
        },
        (payload) => {

          if (payload.eventType === 'INSERT') {
            setAlerts((prev) => [payload.new as Alert, ...prev].slice(0, 50));
          }

          if (payload.eventType === 'UPDATE') {
            setAlerts((prev) =>
              prev.map((a) =>
                a.id === (payload.new as Alert).id
                  ? (payload.new as Alert)
                  : a
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            setAlerts((prev) =>
              prev.filter((a) => a.id !== (payload.old as Alert)?.id)
            );
          }

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await supabase
        .from('sos_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (err: any) {
      alert('Failed to resolve: ' + err.message);
    }
  };

  const getTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;

    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'manual') return 'Manual SOS';
    if (type === 'voice') return 'Voice SOS';
    if (type === 'ai_detected') return 'AI Detected';
    if (type === 'offline_queued') return 'Offline Alert';
    return type;
  };

  const getTypeColor = (type: string) => {
    if (type === 'manual') return 'bg-red-100 text-red-700';
    if (type === 'voice') return 'bg-blue-100 text-blue-700';
    if (type === 'ai_detected') return 'bg-purple-100 text-purple-700';
    if (type === 'offline_queued') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getThreatColor = (level: string) => {
    if (level === 'critical') return 'bg-red-500 text-white';
    if (level === 'high') return 'bg-orange-500 text-white';
    if (level === 'medium') return 'bg-yellow-400 text-gray-900';
    return 'bg-gray-200 text-gray-700';
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center gap-3 min-h-32">
        <Loader2 className="animate-spin text-rose-500" size={24} />
        <span className="text-gray-500 text-sm">Loading alerts...</span>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

      <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="text-white font-bold text-lg">Alert History</h2>
              <p className="text-rose-100 text-xs">
                {alerts.length} alert{alerts.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>

          <button
            onClick={loadAlerts}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs text-white"
          >
            <RefreshCw size={13} /> Refresh
          </button>

        </div>
      </div>

      <div className="p-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {alerts.length === 0 && !error && (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No alerts yet</p>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">

          {alerts.map((alert) => (

            <div
              key={alert.id}
              className={`rounded-xl border overflow-hidden ${
                alert.status === 'active'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >

              <div className="flex items-center justify-between px-4 py-3">

                <div className="flex items-center gap-3">

                  {alert.status === 'active'
                    ? <AlertCircle size={18} className="text-red-500 animate-pulse"/>
                    : <CheckCircle size={18} className="text-green-500"/>
                  }

                  <div>

                    <div className="flex gap-2 mb-1">

                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(alert.alert_type)}`}>
                        {getTypeLabel(alert.alert_type)}
                      </span>

                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getThreatColor(alert.threat_level)}`}>
                        {alert.threat_level.toUpperCase()}
                      </span>

                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11}/>
                      {getTimeAgo(alert.created_at)}
                    </div>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setExpandedId(expandedId === alert.id ? null : alert.id)
                  }
                >
                  {expandedId === alert.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>

              </div>

              {expandedId === alert.id && (

                <div className="px-4 py-3 border-t border-gray-200 bg-white text-xs space-y-2">

                  {alert.latitude && alert.longitude && (

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={12}/>
                      {alert.latitude}, {alert.longitude}

                      <a
                        href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-600 flex items-center gap-1"
                      >
                        <ExternalLink size={11}/> Maps
                      </a>

                    </div>

                  )}

                  {alert.status === 'active' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Resolve
                    </button>
                  )}

                </div>

              )}

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}