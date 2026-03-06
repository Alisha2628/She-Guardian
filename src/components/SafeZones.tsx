import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

type SafeZone = {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
};

export function SafeZones() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filter, setFilter] = useState<string>("all");

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
    const icons: Record<string, string> = {
      police: "🚓",
      hospital: "🏥",
      fire_station: "🚒",
      shelter: "🏠",
    };

    return icons[type] || "📍";
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      police: "Police Station",
      hospital: "Hospital",
      fire_station: "Fire Station",
      shelter: "Shelter",
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Safe Zones</h2>

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
            {type === "all" ? "All" : getTypeName(type)}
          </button>
        ))}
      </div>

      {/* Safe zone list */}
      <div className="space-y-3">
        {filteredZones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No nearby safe zones found</p>
          </div>
        ) : (
          filteredZones.map((zone) => (
            <div
              key={zone.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{getTypeIcon(zone.type)}</div>

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
                        <div className="text-xs text-gray-500">away</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${zone.latitude},${zone.longitude}`}
                      target="_blank"
                      className="text-rose-600 hover:text-rose-700"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}