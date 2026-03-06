import { useState, useEffect, useRef } from 'react';
import { LogOut, Shield, Bell, Plus, Trash2, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SOSButton } from './SOSButton';
import { EmergencyContacts } from './EmergencyContacts';
import { AIMonitor } from './AIMonitor';
import { SafeZones } from './SafeZones';
import { AlertHistory } from './AlertHistory';
import SafeZoneHeatmap, { Incident } from './SafeZoneHeatmap';

interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  type: 'danger' | 'safe';
  active: boolean;
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function Dashboard() {
  const { signOut } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [zones, setZones] = useState<Zone[]>(() => {
    try { return JSON.parse(localStorage.getItem('ai_geofences') || '[]'); } catch { return []; }
  });
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState('');
  const [geoAlerts, setGeoAlerts] = useState<{ id: string; msg: string; time: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRadius, setFormRadius] = useState(200);
  const [formType, setFormType] = useState<'danger' | 'safe'>('danger');
  const [useGps, setUseGps] = useState(true);
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const prevRef = useRef<{ id: string; inside: boolean }[]>([]);

  const handleAlertTriggered = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  useEffect(() => {
    try { localStorage.setItem('ai_geofences', JSON.stringify(zones)); } catch {}
  }, [zones]);

  useEffect(() => {
    if (!navigator.geolocation) { setGpsError('GPS not supported'); return; }
    const id = navigator.geolocation.watchPosition(
      (p) => { setGps({ lat: p.coords.latitude, lng: p.coords.longitude }); setGpsError(''); },
      () => setGpsError('Allow location permission for geofencing'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    if (!gps) return;
    const statuses = zones.filter(z => z.active).map(z => ({
      id: z.id,
      inside: getDistance(gps.lat, gps.lng, z.lat, z.lng) <= z.radius,
    }));
    statuses.forEach(s => {
      const prev = prevRef.current.find(p => p.id === s.id);
      const zone = zones.find(z => z.id === s.id);
      if (!zone) return;
      if (prev && !prev.inside && s.inside) {
        const msg = zone.type === 'danger' ? `⚠️ Entered DANGER zone: "${zone.name}"` : `✅ Entered safe zone: "${zone.name}"`;
        setGeoAlerts(a => [{ id: Date.now().toString(), msg, time: new Date().toLocaleTimeString() }, ...a.slice(0, 4)]);
        if (zone.type === 'danger') handleAlertTriggered();
      }
      if (prev && prev.inside && !s.inside) {
        const msg = zone.type === 'safe' ? `⚠️ Left safe zone: "${zone.name}"` : `ℹ️ Left zone: "${zone.name}"`;
        setGeoAlerts(a => [{ id: Date.now().toString(), msg, time: new Date().toLocaleTimeString() }, ...a.slice(0, 4)]);
      }
    });
    prevRef.current = statuses;
  }, [gps, zones]);

  const addZone = () => {
    if (!formName.trim()) { alert('Enter a zone name'); return; }
    let lat: number, lng: number;
    if (useGps && gps) { lat = gps.lat; lng = gps.lng; }
    else { lat = parseFloat(formLat); lng = parseFloat(formLng); if (isNaN(lat) || isNaN(lng)) { alert('Enter valid coordinates'); return; } }
    setZones(z => [...z, { id: Date.now().toString(), name: formName.trim(), lat, lng, radius: formRadius, type: formType, active: true }]);
    setFormName(''); setFormRadius(200); setFormLat(''); setFormLng(''); setShowForm(false);
  };

  const getDist = (zone: Zone) => {
    if (!gps) return null;
    const d = getDistance(gps.lat, gps.lng, zone.lat, zone.lng);
    return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`;
  };

  const isInside = (zone: Zone) => gps ? getDistance(gps.lat, gps.lng, zone.lat, zone.lng) <= zone.radius : false;
  const heatmapIncidents: Incident[] = [
    { location: { type: 'Point', coordinates: [72.85, 19.05] }, severity: 0.9 },
    { location: { type: 'Point', coordinates: [72.90, 19.12] }, severity: 0.3 },
    { location: { type: 'Point', coordinates: [72.82, 19.00] }, severity: 0.7 },
    { location: { type: 'Point', coordinates: [72.88, 19.08] }, severity: 0.5 },
    { location: { type: 'Point', coordinates: [72.87, 19.07] }, severity: 0.6 },
    { location: { type: 'Point', coordinates: [72.91, 19.15] }, severity: 0.2 },
  ];

  // Your location (Mumbai center) – later use navigator.geolocation
  const userLocation: [number, number] = [19.0760, 72.8777]; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <div className="font-bold">Emergency Alert Sent!</div>
              <div className="text-sm">Your contacts have been notified</div>
            </div>
          </div>
        </div>
      )}
      <nav className="bg-[#09254b] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Guardian</h1>
                <p className="text-xs text-gray-600">Your Smart Safety Companion</p>
              </div>
            </div>
            <button onClick={signOut} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut className="w-5 h-5" />Sign Out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <SOSButton onAlertTriggered={handleAlertTriggered} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AIMonitor onThreatDetected={handleAlertTriggered} />
          <AlertHistory />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EmergencyContacts />
          <SafeZones />
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">📡</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Geofence Alerts</h2>
              <p className="text-xs text-gray-500">Get alerted when entering/leaving zones</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Geofence feature coming soon. Add zones to monitor your safety.</p>
        </div>
        <div className="mb-12">
  <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
    Safe Zone Heatmap
  </h2>
  <p className="text-center text-gray-600 mb-6">
    Green = safer • Yellow/Orange = medium • Red = higher risk
  </p>
  <div
    style={{
      height: '600px',              // Use plain style + large value
      width: '100%',
      border: '4px solid blue',     // ← debug border – you should see blue frame
      background: '#f0f0f0',        // ← gray background if map fails
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }}
  >
    <SafeZoneHeatmap
      userLocation={userLocation}
      incidents={heatmapIncidents}
      height="100%"
    />
  </div>
</div>

        {/* GEOFENCE SECTION */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">📡</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Geofence Alerts</h2>
              <p className="text-xs text-gray-500">Get alerted when entering/leaving zones</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4 ${gps ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <Navigation size={13} />
            {gps ? `📍 GPS active — ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : gpsError || 'Waiting for GPS...'}
          </div>
          {geoAlerts.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Alerts</p>
              {geoAlerts.map(a => (
                <div key={a.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${a.msg.includes('DANGER') || a.msg.includes('Left safe') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  <span className="flex-1">{a.msg}</span><span className="text-gray-400">{a.time}</span>
                </div>
              ))}
            </div>
          )}
          {zones.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Zones ({zones.length})</p>
              {zones.map(zone => {
                const inside = isInside(zone);
                const dist = getDist(zone);
                return (
                  <div key={zone.id} className={`border rounded-xl p-3 ${inside && zone.type === 'danger' ? 'border-red-300 bg-red-50' : inside ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{zone.type === 'danger' ? '🚨' : '🛡️'}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{zone.name}</span>
                            {inside && <span className={`text-xs px-2 py-0.5 rounded-full ${zone.type === 'danger' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>📍 You are HERE</span>}
                          </div>
                          <div className="flex gap-2 mt-0.5 text-xs text-gray-400">
                            <span className={`px-1.5 py-0.5 rounded ${zone.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{zone.type}</span>
                            <span>r: {zone.radius}m</span>
                            {dist && <span>📍 {dist} away</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setZones(z => z.filter(x => x.id !== zone.id))} className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {showForm ? (
            <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
              <p className="text-sm font-semibold text-gray-700 mb-3">➕ Add New Zone</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Zone Name *</label>
                  <input type="text" placeholder="e.g. Home, Dark Alley..." value={formName} onChange={e => setFormName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Zone Type</label>
                  <div className="flex gap-2">
                    <button onClick={() => setFormType('danger')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${formType === 'danger' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>🚨 Danger</button>
                    <button onClick={() => setFormType('safe')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${formType === 'safe' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>🛡️ Safe</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Radius: <span className="font-semibold text-orange-600">{formRadius}m</span></label>
                  <input type="range" min={50} max={2000} step={50} value={formRadius} onChange={e => setFormRadius(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Location</label>
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setUseGps(true)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${useGps ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>📍 Current GPS</button>
                    <button onClick={() => setUseGps(false)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${!useGps ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>✏️ Manual</button>
                  </div>
                  {useGps && gps && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">✅ {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}</p>}
                  {useGps && !gps && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">⚠️ GPS unavailable — use manual</p>}
                  {!useGps && (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Latitude" value={formLat} onChange={e => setFormLat(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none" />
                      <input type="text" placeholder="Longitude" value={formLng} onChange={e => setFormLng(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={addZone} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold">✅ Save Zone</button>
                <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full border-2 border-dashed border-orange-300 hover:border-orange-400 text-orange-600 hover:bg-orange-50 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <Plus size={18} /> Add New Geofence Zone
            </button>
          )}
          {zones.length === 0 && !showForm && (
            <p className="text-center text-xs text-gray-400 mt-3">No zones yet. Add a danger or safe zone to start monitoring.</p>
          )}
        </div>
      </main>
    </div>
  );
}


