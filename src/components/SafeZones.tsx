import { useState, useEffect } from "react";
import { MapPin, Navigation, Shield, Cross, Siren, Flame, Home as HomeIcon } from "lucide-react";
import { useLanguage } from "../contexts/useLanguage";

type SafeZone = {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
};

export function SafeZones() {
  const { t } = useLanguage();
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  const openSafeRoute = (zone: SafeZone & { distance: number | null }) => {
    if (!userLocation) return;
    // Walking + avoid highways = safest pedestrian route
    const url = `https://www.google.com/maps/dir/?api=1` +
      `&origin=${userLocation.lat},${userLocation.lng}` +
      `&destination=${zone.latitude},${zone.longitude}` +
      `&travelmode=walking`;
    window.open(url, '_blank');
  };

  const openNativeMaps = (zone: SafeZone & { distance: number | null }) => {
    if (!userLocation) return;
    // Works on both iOS (Apple Maps) and Android (Google Maps app)
    const url = `https://maps.google.com/?saddr=${userLocation.lat},${userLocation.lng}` +
      `&daddr=${zone.latitude},${zone.longitude}&dirflg=w`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // Get user's GPS location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLocation({ lat, lng });

        loadSafeZones(lat, lng);
      });
    }
  };

  // Fetch nearby safe places from OpenStreetMap
  const loadSafeZones = async (lat: number, lng: number) => {
    const query = `
    [out:json];
    (
      node["amenity"="police"](around:5000,${lat},${lng});
      node["amenity"="hospital"](around:5000,${lat},${lng});
      node["amenity"="fire_station"](around:5000,${lat},${lng});
      node["amenity"="shelter"](around:5000,${lat},${lng});
    );
    out;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    const data = await response.json();

    const zones = data.elements.map((place: any) => ({
      id: place.id,
      name: place.tags?.name || "Unknown Place",
      type: place.tags?.amenity,
      latitude: place.lat,
      longitude: place.lon,
    }));

    setSafeZones(zones);
  };

  // Calculate distance
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
      police:       { icon: <Siren size={22} />,    bg: 'bg-blue-100',   color: 'text-blue-700' },
      hospital:     { icon: <Cross size={22} />,    bg: 'bg-red-100',    color: 'text-red-600'  },
      fire_station: { icon: <Flame size={22} />,    bg: 'bg-orange-100', color: 'text-orange-600' },
      shelter:      { icon: <HomeIcon size={22} />, bg: 'bg-green-100',  color: 'text-green-700' },
    };
    return iconMap[type] || { icon: <MapPin size={22} />, bg: 'bg-gray-100', color: 'text-gray-600' };
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      police: t.policeStation,
      hospital: t.hospital,
      fire_station: t.fireStation,
      shelter: t.shelter,
    };

    return names[type] || type;
  };

  const filteredZones = safeZones
    .filter((zone) => filter === "all" || zone.type === filter)
    .map((zone) => ({
      ...zone,
      distance: userLocation
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            zone.latitude,
            zone.longitude
          )
        : null,
    }))
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.nearbySafeZones}</h2>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "police", "hospital", "fire_station", "shelter"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === type
                ? "bg-rose-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type === "all" ? t.allFilter : getTypeName(type)}
          </button>
        ))}
      </div>

      {/* Safe zone list */}
      <div className="space-y-3">
        {filteredZones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>{t.noSafeZones}</p>
          </div>
        ) : (
          filteredZones.map((zone) => (
            <div
              key={zone.id}
              className={`p-4 rounded-xl transition-all cursor-pointer border-2 ${
                selectedZone === zone.id
                  ? 'bg-rose-50 border-rose-300 shadow-md'
                  : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200'
              }`}
              onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
            >
              <div className="flex items-start gap-3">
                {(() => { const ic = getTypeIcon(zone.type); return (
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${ic.bg} ${ic.color}`}>
                    {ic.icon}
                  </div>
                ); })()}

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {zone.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getTypeName(zone.type)}
                      </p>
                    </div>

                    {zone.distance !== null && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-rose-600">
                          {zone.distance.toFixed(1)} km
                        </div>
                        <div className="text-xs text-gray-500">{t.away}</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${zone.latitude},${zone.longitude}`}
                      target="_blank"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.getDirections}
                    </a>
                  </div>

                  {/* Safe Navigation — shown when card is selected */}
                  {selectedZone === zone.id && (
                    <div className="mt-3 pt-3 border-t border-rose-200 space-y-2">
                      <p className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                        <Shield size={12} /> {t.navigateSafely}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openSafeRoute(zone); }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors"
                        >
                          <Navigation size={13} /> {t.safeWalkingRoute}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openNativeMaps(zone); }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors"
                        >
                          <MapPin size={13} /> {t.openInMaps}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        {t.walkingRouteNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
