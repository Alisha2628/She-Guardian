// src/components/AccessibilitySupport.tsx
import { useState, useEffect } from 'react';
import { Eye, Type, Volume2, MousePointer, Sun, Moon, Zap, RotateCcw } from 'lucide-react';

interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  largeButtons: boolean;
  darkMode: boolean;
  textSpacing: boolean;
  focusIndicators: boolean;
  voiceAnnouncements: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  largeButtons: false,
  darkMode: false,
  textSpacing: false,
  focusIndicators: false,
  voiceAnnouncements: false,
};

const STORAGE_KEY = 'ai_guardian_accessibility';

function loadSettings(): AccessibilitySettings {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return DEFAULT_SETTINGS; }
}

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;

  // Large text
  root.style.fontSize = settings.largeText ? '120%' : '';

  // High contrast
  if (settings.highContrast) {
    root.style.filter = 'contrast(1.5)';
  } else {
    root.style.filter = '';
  }

  // Reduce motion
  if (settings.reduceMotion) {
    const style = document.getElementById('reduce-motion-style') || document.createElement('style');
    style.id = 'reduce-motion-style';
    style.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }';
    document.head.appendChild(style);
  } else {
    document.getElementById('reduce-motion-style')?.remove();
  }

  // Large buttons
  if (settings.largeButtons) {
    const style = document.getElementById('large-buttons-style') || document.createElement('style');
    style.id = 'large-buttons-style';
    style.textContent = 'button { min-height: 52px !important; min-width: 52px !important; font-size: 1.1rem !important; }';
    document.head.appendChild(style);
  } else {
    document.getElementById('large-buttons-style')?.remove();
  }

  // Dark mode
  if (settings.darkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  // Text spacing
  if (settings.textSpacing) {
    root.style.letterSpacing = '0.05em';
    root.style.lineHeight = '1.8';
    root.style.wordSpacing = '0.1em';
  } else {
    root.style.letterSpacing = '';
    root.style.lineHeight = '';
    root.style.wordSpacing = '';
  }

  // Focus indicators
  if (settings.focusIndicators) {
    const style = document.getElementById('focus-style') || document.createElement('style');
    style.id = 'focus-style';
    style.textContent = '*:focus { outline: 3px solid #f97316 !important; outline-offset: 3px !important; }';
    document.head.appendChild(style);
  } else {
    document.getElementById('focus-style')?.remove();
  }
}

export function AccessibilitySupport() {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);
  const [announced, setAnnounced] = useState('');

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof AccessibilitySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    if (newSettings.voiceAnnouncements && 'speechSynthesis' in window) {
      const label = FEATURES.find(f => f.key === key)?.label || key;
      const msg = `${label} ${newSettings[key] ? 'enabled' : 'disabled'}`;
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      setAnnounced(msg);
      setTimeout(() => setAnnounced(''), 2000);
    }
  };

  const resetAll = () => {
    setSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    ['reduce-motion-style', 'large-buttons-style', 'focus-style'].forEach(id => document.getElementById(id)?.remove());
    document.documentElement.style.cssText = '';
    document.body.classList.remove('dark');
  };

  const activeCount = Object.values(settings).filter(Boolean).length;

  const FEATURES = [
    { key: 'largeText' as const, icon: <Type size={18} />, label: 'Large Text', desc: 'Increases font size by 20%', color: 'blue' },
    { key: 'highContrast' as const, icon: <Eye size={18} />, label: 'High Contrast', desc: 'Boosts color contrast for visibility', color: 'purple' },
    { key: 'largeButtons' as const, icon: <MousePointer size={18} />, label: 'Large Buttons', desc: 'Makes all buttons bigger & easier to tap', color: 'green' },
    { key: 'darkMode' as const, icon: <Moon size={18} />, label: 'Dark Mode', desc: 'Reduces eye strain in low light', color: 'gray' },
    { key: 'reduceMotion' as const, icon: <Zap size={18} />, label: 'Reduce Motion', desc: 'Stops animations & transitions', color: 'yellow' },
    { key: 'textSpacing' as const, icon: <Sun size={18} />, label: 'Text Spacing', desc: 'Increases letter & line spacing', color: 'orange' },
    { key: 'focusIndicators' as const, icon: <Eye size={18} />, label: 'Focus Indicators', desc: 'Shows orange outline on focused elements', color: 'rose' },
    { key: 'voiceAnnouncements' as const, icon: <Volume2 size={18} />, label: 'Voice Announcements', desc: 'Speaks aloud when settings change', color: 'teal' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-gray-200 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    rose: 'bg-rose-100 text-rose-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">♿</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Accessibility Support</h2>
            <p className="text-xs text-gray-500">Customize the app for your needs</p>
          </div>
        </div>
        {activeCount > 0 && (
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
            {activeCount} active
          </span>
        )}
      </div>

      {/* Voice announcement feedback */}
      {announced && (
        <div className="bg-teal-50 border border-teal-200 text-teal-700 text-xs px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
          <Volume2 size={13} /> {announced}
        </div>
      )}

      {/* Features grid */}
      <div className="grid grid-cols-1 gap-3 mb-5">
        {FEATURES.map(feature => (
          <div
            key={feature.key}
            onClick={() => toggle(feature.key)}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              settings[feature.key]
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${colorMap[feature.color]}`}>
                {feature.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{feature.label}</p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>

            {/* Toggle switch */}
            <div className={`relative w-12 h-6 rounded-full transition-colors ${settings[feature.key] ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[feature.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Text size preview */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview</p>
        <p className={`text-gray-800 ${settings.largeText ? 'text-xl' : 'text-base'} ${settings.textSpacing ? 'tracking-wider leading-loose' : ''}`}>
          AI Guardian keeps you safe 🛡️
        </p>
        <p className={`text-gray-500 mt-1 ${settings.largeText ? 'text-base' : 'text-sm'}`}>
          Your smart safety companion
        </p>
      </div>

      {/* Reset button */}
      {activeCount > 0 && (
        <button
          onClick={resetAll}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl text-sm font-medium transition-colors"
        >
          <RotateCcw size={16} /> Reset All Accessibility Settings
        </button>
      )}

      {activeCount === 0 && (
        <p className="text-center text-xs text-gray-400">
          No settings active. Toggle any option above to customize your experience.
        </p>
      )}
    </div>
  );
}
