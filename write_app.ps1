$content = @'
// src/App.tsx
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StealthCalculator } from './components/StealthMode';
import { Auth } from './components/Auth';
import { SOSButton } from './components/SOSButton';
import { EmergencyContacts } from './components/EmergencyContacts';
import { AlertHistory } from './components/AlertHistory';
import { SafeZones } from './components/SafeZones';
import { AIMonitor } from './components/AIMonitor';
import { AISafetyChatbot } from './components/AISafetyChatbot';
import { OfflineEmergency } from './components/OfflineEmergency';
import { EncryptedAlerts } from './components/EncryptedAlerts';
import { DeadMansSwitch } from './components/DeadMansSwitch';
import { AccessibilitySupport } from './components/AccessibilitySupport';
import { TrustedCircle } from './components/TrustedCircle';
import SafeZoneHeatmap from './components/SafeZoneHeatmap';
import { Shield, LogOut, Bell, Moon, Sun, Home, MessageCircle, Map, Wrench, Settings } from 'lucide-react';

type Tab = 'home' | 'ai' | 'safety' | 'tools' | 'settings';

const TABS: { id: Tab; label: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'ai', label: 'AI Chat', Icon: MessageCircle },
  { id: 'safety', label: 'Safety', Icon: Map },
  { id: 'tools', label: 'Tools', Icon: Wrench },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

const SAMPLE_INCIDENTS = [
  { location: { type: 'Point' as const, coordinates: [72.878, 19.076] as [number, number] }, severity: 0.8 },
  { location: { type: 'Point' as const, coordinates: [72.882, 19.079] as [number, number] }, severity: 0.6 },
  { location: { type: 'Point' as const, coordinates: [72.875, 19.073] as [number, number] }, severity: 0.9 },
  { location: { type: 'Point' as const, coordinates: [72.885, 19.082] as [number, number] }, severity: 0.4 },
  { location: { type: 'Point' as const, coordinates: [72.870, 19.070] as [number, number] }, severity: 0.7 },
  { location: { type: 'Point' as const, coordinates: [72.890, 19.085] as [number, number] }, severity: 0.5 },
];

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showNotification, setShowNotification] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>(undefined);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation([19.076, 72.878])
      );
    }
  }, []);

  const handleAlertTriggered = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading AI Guardian...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  // Dark mode styles
  const bg = nightMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = nightMode ? 'bg-gray-900 border border-gray-800' : 'bg-white';
  const cardHeader = nightMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-100';
  const textMain = nightMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = nightMode ? 'text-gray-400' : 'text-gray-500';
  const navBg = nightMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const tabActive = nightMode ? 'text-rose-400' : 'text-rose-600';
  const tabInactive = nightMode ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors duration-500`}>

      {/* Emergency notification */}
      {showNotification && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <div className="font-bold text-lg">Emergency Alert Sent!</div>
              <div className="text-sm text-red-100">Your contacts have been notified with your location</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`${nightMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500'} text-white shadow-xl sticky top-0 z-40 transition-colors duration-500`}>

        {/* Top row */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${nightMode ? 'bg-gray-700' : 'bg-white/20'} rounded-xl flex items-center justify-center`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AI Guardian</h1>
              <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-rose-200'}`}>Women's Safety Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 ${nightMode ? 'bg-gray-700' : 'bg-white/10'} px-3 py-1.5 rounded-xl`}>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-white">{user.email?.split('@')[0]}</span>
            </div>
            <button
              onClick={signOut}
              className={`flex items-center gap-1.5 ${nightMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white/20 hover:bg-white/30'} px-3 py-1.5 rounded-xl text-sm transition-colors text-white`}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* Night Mode Switch Row */}
        <div className={`max-w-6xl mx-auto px-4 pb-3 flex items-center justify-between ${nightMode ? 'border-t border-gray-800 pt-2' : ''}`}>
          <div className="flex items-center gap-2">
            {nightMode ? <Moon size={15} className="text-purple-400" /> : <Sun size={15} className="text-yellow-200" />}
            <span className="text-sm font-medium text-white">Night Safety Mode</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${nightMode ? 'bg-purple-600 text-white' : 'bg-white/20 text-white/70'}`}>
              {nightMode ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => setNightMode(prev => !prev)}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${nightMode ? 'bg-purple-600' : 'bg-white/30'}`}
            aria-label="Toggle Night Safety Mode"
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${nightMode ? 'translate-x-7' : 'translate-x-0.5'}`}>
              {nightMode ? <Moon size={12} className="text-purple-600" /> : <Sun size={12} className="text-yellow-400" />}
            </div>
          </button>
        </div>

        {/* Night mode active banner */}
        {nightMode && (
          <div className="bg-purple-900/80 text-purple-200 text-xs text-center py-1.5 px-4">
            Night Safety Mode active — Screen darkened, voice monitoring heightened
          </div>
        )}

        {/* Desktop Tab Bar */}
        <div className={`hidden sm:flex max-w-6xl mx-auto px-4 gap-1 ${nightMode ? 'border-t border-gray-800 mt-1' : ''}`}>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-xl transition-all ${
                activeTab === id
                  ? nightMode ? 'bg-gray-950 text-rose-400' : 'bg-white text-rose-600'
                  : nightMode ? 'text-gray-400 hover:bg-gray-800' : 'text-rose-100 hover:bg-white/10'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 sm:pb-6">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-2xl shadow-lg overflow-hidden`}>
              <div className={`${cardHeader} px-6 py-4`}>
                <h2 className={`text-lg font-bold ${textMain}`}>Emergency SOS</h2>
                <p className={`text-xs ${textSub}`}>Press to instantly alert all your trusted contacts</p>
              </div>
              <div className="p-6">
                <SOSButton onAlertTriggered={handleAlertTriggered} nightModeEnabled={nightMode} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${cardBg} rounded-2xl shadow-lg overflow-hidden`}>
                <div className={`${nightMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100'} px-6 py-3`}>
                  <h2 className={`text-sm font-bold ${textMain}`}>AI Threat Monitor</h2>
                </div>
                <div className="p-4">
                  <AIMonitor onThreatDetected={handleAlertTriggered} />
                </div>
              </div>
              <div className={`${cardBg} rounded-2xl shadow-lg overflow-hidden`}>
                <div className={`${nightMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100'} px-6 py-3`}>
                  <h2 className={`text-sm font-bold ${textMain}`}>Alert History</h2>
                </div>
                <div className="p-4">
                  <AlertHistory />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI CHAT TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h2 className={`text-2xl font-bold ${textMain}`}>AI Safety Assistant</h2>
              <p className={`${textSub} text-sm`}>Get instant safety advice, trigger fake calls, and more</p>
            </div>
            <AISafetyChatbot />
          </div>
        )}

        {/* SAFETY TAB */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h2 className={`text-2xl font-bold ${textMain}`}>Safety Network</h2>
              <p className={`${textSub} text-sm`}>Contacts, safe zones and live danger heatmap</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmergencyContacts />
              <SafeZones />
            </div>
            <TrustedCircle onAlertTriggered={handleAlertTriggered} />
            <div className={`${cardBg} rounded-2xl shadow-lg overflow-hidden`}>
              <div className={`${nightMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100'} px-6 py-4`}>
                <h2 className={`text-lg font-bold ${textMain}`}>Live Safety Heatmap</h2>
                <p className={`text-xs ${textSub}`}>Red = danger zones · Green = safe areas · Your location shown with pin</p>
              </div>
              <div className="p-4">
                <SafeZoneHeatmap userLocation={userLocation} incidents={SAMPLE_INCIDENTS} height="400px" />
              </div>
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h2 className={`text-2xl font-bold ${textMain}`}>Safety Tools</h2>
              <p className={`${textSub} text-sm`}>Advanced features to keep you protected</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeadMansSwitch onAlertTriggered={handleAlertTriggered} />
              <OfflineEmergency />
            </div>
            <EncryptedAlerts />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h2 className={`text-2xl font-bold ${textMain}`}>Settings</h2>
              <p className={`${textSub} text-sm`}>Customize your AI Guardian experience</p>
            </div>
            <AccessibilitySupport />

            {/* App info card */}
            <div className={`${cardBg} rounded-2xl shadow-lg p-6`}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${textMain}`}>AI Guardian</h3>
                  <p className={`${textSub} text-sm`}>Women's Safety Companion</p>
                  <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">v2.0.0</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  'SOS Button',
                  'AI Monitor',
                  'Fake Call',
                  'Stealth Mode',
                  'Offline Mode',
                  'Encryption',
                  "Dead Man's Switch",
                  'Accessibility',
                  'Safety Heatmap',
                  'Night Safety Mode',
                  'Geofence Alerts',
                  'Voice Activation',
                ].map(label => (
                  <div key={label} className={`flex items-center gap-2 ${nightMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl px-3 py-2`}>
                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                    <span className={`${textMain} font-medium text-xs`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className={`sm:hidden fixed bottom-0 left-0 right-0 ${navBg} border-t shadow-2xl z-40 transition-colors duration-500`}>
        <div className="flex justify-around items-center py-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${activeTab === id ? tabActive : tabInactive}`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
              {activeTab === id && <div className={`w-1 h-1 ${nightMode ? 'bg-rose-400' : 'bg-rose-600'} rounded-full`} />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function App() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <StealthCalculator onUnlock={() => setUnlocked(true)} />;
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

'@
[System.IO.File]::WriteAllText("src\App.tsx", $content, [System.Text.Encoding]::UTF8)
Write-Host "Done! App.tsx written successfully."
