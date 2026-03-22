$content = @'
// src/components/AlertHistory.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, MapPin, CheckCircle, AlertCircle, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';

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
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAlerts = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('user_id', user.id)
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

  useEffect(() => { loadAlerts(); }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('alert_history_' + user.id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sos_alerts',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlerts(prev => [payload.new as Alert, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new as Alert : a));
        } else if (payload.eventType === 'DELETE') {
          setAlerts(prev => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const resolveAlert = async (id: string) => {
    try {
      await supabase.from('sos_alerts').update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      }).eq('id', id);
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

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center gap-3 min-h-32">
      <Loader2 className="animate-spin text-rose-500" size={24} />
      <span className="text-gray-500 text-sm">Loading alerts...</span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Alert History</h2>
              <p className="text-rose-100 text-xs">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} recorded</p>
            </div>
          </div>
          <button
            onClick={loadAlerts}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs text-white transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
            <button onClick={loadAlerts} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && alerts.length === 0 && !error && (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No alerts yet</p>
            <p className="text-xs mt-1">Trigger an SOS to see alerts here</p>
          </div>
        )}

        {/* Alerts list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-xl border overflow-hidden ${
                alert.status === 'active'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              {/* Alert row */}
              <div className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {alert.status === 'active'
                    ? <AlertCircle size={18} className="text-red-500 animate-pulse shrink-0" />
                    : <CheckCircle size={18} className="text-green-500 shrink-0" />
                  }
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getTypeColor(alert.alert_type)}`}>
                        {getTypeLabel(alert.alert_type)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getThreatColor(alert.threat_level)}`}>
                        {alert.threat_level.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock size={11} />
                      <span>{getTimeAgo(alert.created_at)}</span>
                      <span>·</span>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedId === alert.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded */}
              {expandedId === alert.id && (
                <div className="px-4 py-3 border-t border-gray-200 bg-white text-xs space-y-2">
                  {alert.latitude && alert.longitude && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={12} className="text-rose-500" />
                      <span>{alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}</span>
                      <a
                        href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rose-600 flex items-center gap-0.5 hover:underline"
                      >
                        <ExternalLink size={11} /> Maps
                      </a>
                    </div>
                  )}
                  {alert.detected_keywords && alert.detected_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {alert.detected_keywords.map((kw, i) => (
                        <span key={i} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{kw}</span>
                      ))}
                    </div>
                  )}
                  {alert.resolved_at && (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle size={11} /> Resolved: {new Date(alert.resolved_at).toLocaleString()}
                    </div>
                  )}
                  <div className="text-gray-300 text-xs">ID: {alert.id}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("src\components\AlertHistory.tsx", $content, [System.Text.Encoding]::UTF8)
Write-Host "AlertHistory.tsx written successfully!"
