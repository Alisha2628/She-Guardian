import { useState, useEffect } from 'react';
import {
  Shield, Bell, MapPin, Users, Wrench,
  MessageCircle, Globe, ChevronRight, Check,
  Moon, Star, Phone, X, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LANGUAGES } from '../lib/translations';

interface OnboardingProps {
  onComplete: () => void;
}

// Safety score tracker
function SafetyScore({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-orange-500' : 'text-red-500';
  const ring = score >= 80 ? 'stroke-green-500' : score >= 50 ? 'stroke-orange-500' : 'stroke-red-500';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            className={ring}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black ${color}`}>{score}</span>
          <span className="text-xs text-gray-400 font-medium">/ 100</span>
        </div>
      </div>
      <p className={`font-bold mt-2 ${color}`}>
        {score >= 80 ? 'Fully Protected' : score >= 50 ? 'Partially Set Up' : 'Needs Setup'}
      </p>
    </div>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [userName, setUserName] = useState('');

  // Step 3 — trusted contact
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSaved, setContactSaved] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  // Step 4 — SOS demo
  const [sosDemoPlayed, setSosDemoPlayed] = useState(false);
  const [sosAnimating, setSosAnimating] = useState(false);

  // Step 6 — night time
  const [nightTime, setNightTime] = useState('22:00');
  const [nightTimeSaved, setNightTimeSaved] = useState(false);

  // Step 7 — language
  const [selectedLang, setSelectedLang] = useState('en');

  // Step 8 — safety score
  const [locationGranted, setLocationGranted] = useState(false);

  const TOTAL_STEPS = 9;

  // Load user name from profiles
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) {
          setUserName(data.full_name.split(' ')[0]);
        } else {
          setUserName(user.email?.split('@')[0] ?? 'Guardian');
        }
      });
  }, [user]);

  // Request location on step 2
  useEffect(() => {
    if (step === 2) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setLocationGranted(true),
          () => setLocationGranted(false)
        );
      }
    }
  }, [step]);

  const safetyScore = (() => {
    let s = 20; // base
    if (locationGranted) s += 25;
    if (contactSaved) s += 30;
    if (nightTimeSaved) s += 15;
    if (selectedLang !== 'en') s += 10;
    return Math.min(s, 100);
  })();

  const goNext = () => {
    if (animating) return;
    if (step === TOTAL_STEPS - 1) {
      localStorage.setItem('sheguardian_onboarded', 'true');
      localStorage.setItem('sheguardian_night_time', nightTime);
      localStorage.setItem('app_language', selectedLang);
      onComplete();
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setAnimating(false);
    }, 200);
  };

  const skip = () => {
    localStorage.setItem('sheguardian_onboarded', 'true');
    onComplete();
  };

  const saveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      setContactError('Please enter both name and phone number.');
      return;
    }
    if (!user) return;
    setContactLoading(true);
    setContactError('');
    const { error } = await supabase.from('trusted_contacts').insert({
      user_id: user.id,
      name: contactName.trim(),
      phone_number: contactPhone.trim(),
    });
    setContactLoading(false);
    if (error) {
      setContactError('Could not save contact. Please try again.');
    } else {
      setContactSaved(true);
    }
  };

  const playSOSDemo = () => {
    setSosAnimating(true);
    setTimeout(() => {
      setSosAnimating(false);
      setSosDemoPlayed(true);
    }, 2500);
  };

  const progress = ((step) / (TOTAL_STEPS - 1)) * 100;

  const canProceed = () => {
    if (step === 3 && !contactSaved) return false; // soft block — show warning not hard block
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-rose-500" />
            <span className="text-sm font-bold text-rose-500">SheGuardian Setup</span>
          </div>
          <button onClick={skip} className="flex items-center gap-1 text-gray-400 hover:text-gray-500 text-xs">
            <X size={13} /> Skip setup
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-5">
          <div
            className="bg-rose-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card */}
        <div className={`bg-white rounded-3xl shadow-2xl p-7 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>

          {/* ── STEP 0: Welcome ── */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">
                Welcome{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-rose-500 font-bold mb-4">Your safety shield is ready</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Let's set up your personal safety profile in just <span className="font-bold text-gray-700">2 minutes.</span> We'll configure your emergency contacts, location, and preferences so SheGuardian works perfectly for you.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Bell, label: 'SOS Alert', color: 'bg-red-50 text-red-500' },
                  { icon: Users, label: 'Trusted Circle', color: 'bg-blue-50 text-blue-500' },
                  { icon: MapPin, label: 'Live Safety', color: 'bg-green-50 text-green-500' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={`${color} rounded-2xl p-3 flex flex-col items-center gap-1`}>
                    <Icon size={20} />
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1: How it works ── */}
          {step === 1 && (
            <div>
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 text-center mb-1">Emergency SOS</h2>
              <p className="text-orange-500 font-bold text-center text-sm mb-5">One tap. Instant help.</p>
              <div className="space-y-3 mb-5">
                {[
                  { num: '1', text: 'Press the SOS button once', color: 'bg-red-500' },
                  { num: '2', text: 'Auto-calls 100 (Police)', color: 'bg-orange-500' },
                  { num: '3', text: 'Sends live GPS to trusted contacts', color: 'bg-yellow-500' },
                  { num: '4', text: 'Records audio evidence automatically', color: 'bg-green-500' },
                ].map(({ num, text, color }) => (
                  <div key={num} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <div className={`w-7 h-7 ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-black">{num}</span>
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
              
                
              
            </div>
          )}

          {/* ── STEP 2: Location ── */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Location Access</h2>
              <p className="text-blue-500 font-bold text-sm mb-5">Required for emergency features</p>
              <div className={`rounded-2xl p-5 mb-5 ${locationGranted ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
                {locationGranted ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-bold text-green-600">Location Granted!</p>
                    <p className="text-green-500 text-xs">Your location is ready for emergency use</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-bold text-gray-500">Waiting for permission...</p>
                    <p className="text-gray-400 text-xs">Please allow location access in the popup</p>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-left">
                {[
                  'Send your exact location during SOS',
                  'Show your position on the safety heatmap',
                  'Help trusted contacts track you in real time',
                ].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                    <span className="text-gray-500 text-xs">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: Trusted Contact ── */}
          {step === 3 && (
            <div>
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 text-center mb-1">Add Trusted Contact</h2>
              <p className="text-purple-500 font-bold text-center text-sm mb-5">They'll be your emergency guardian</p>

              {contactSaved ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-green-600 text-lg">{contactName} added!</p>
                  <p className="text-green-500 text-sm mt-1">They will be notified in emergencies</p>
                  <div className="mt-3 bg-white rounded-xl px-4 py-2 border border-green-100">
                    <p className="text-xs text-gray-500">SOS message preview:</p>
                    <p className="text-xs text-gray-700 font-medium mt-1">
                      "EMERGENCY: [Your Name] needs help! Live location: maps.google.com/..."
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="e.g. Mum, Sister, Best Friend"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm outline-none"
                    />
                  </div>
                  {contactError && (
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl">
                      <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                      <p className="text-red-500 text-xs">{contactError}</p>
                    </div>
                  )}
                  <button
                    onClick={saveContact}
                    disabled={contactLoading}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    {contactLoading ? 'Saving...' : 'Save Contact'}
                  </button>
                  <button
                    onClick={goNext}
                    className="w-full text-gray-400 text-xs py-1 hover:text-gray-500"
                  >
                    Skip for now (not recommended)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: SOS Demo ── */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Try the SOS Button</h2>
              <p className="text-red-500 font-bold text-sm mb-5">Demo mode — nothing will actually be sent</p>

              <div className="relative flex items-center justify-center mb-6">
                {sosAnimating && (
                  <>
                    <div className="absolute w-32 h-32 bg-red-400 rounded-full animate-ping opacity-30" />
                    <div className="absolute w-24 h-24 bg-red-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.3s' }} />
                  </>
                )}
                <button
                  onClick={playSOSDemo}
                  disabled={sosAnimating || sosDemoPlayed}
                  className={`relative w-24 h-24 rounded-full font-black text-white text-xl shadow-2xl transition-all ${
                    sosDemoPlayed
                      ? 'bg-green-500 scale-95'
                      : 'bg-red-600 hover:bg-red-700 active:scale-95'
                  }`}
                >
                  {sosDemoPlayed ? <Check className="w-8 h-8 mx-auto" /> : 'SOS'}
                </button>
              </div>

              {sosAnimating && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 animate-pulse">
                  <p className="text-red-600 font-bold text-sm">Sending SOS alert...</p>
                  <p className="text-red-400 text-xs mt-1">Notifying trusted contacts with live location</p>
                  <p className="text-red-400 text-xs">Auto-calling 100...</p>
                </div>
              )}

              {sosDemoPlayed && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                  <p className="text-green-600 font-bold">You're ready!</p>
                  <p className="text-green-500 text-xs mt-1">You know how to trigger SOS. In a real emergency this would alert everyone instantly.</p>
                </div>
              )}

              {!sosDemoPlayed && !sosAnimating && (
                <p className="text-gray-400 text-xs">Tap the SOS button above to see how it works</p>
              )}
            </div>
          )}

          {/* ── STEP 5: Stealth Mode ── */}
          {step === 5 && (
            <div>
              <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 text-center mb-1">Stealth Mode</h2>
              <p className="text-gray-500 font-bold text-center text-sm mb-5">The app disguises itself as a calculator</p>

              <div className="bg-gray-900 rounded-2xl p-4 mb-5">
                <div className="text-right text-white text-2xl font-light mb-3 pr-2">0</div>
                <div className="grid grid-cols-4 gap-2">
                  {['AC', '+/-', '%', '/', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((k, i) => (
                    <div
                      key={i}
                      className={`rounded-full h-10 flex items-center justify-center text-sm font-semibold cursor-pointer
                        ${k === '=' ? 'bg-orange-500 text-white col-span-1' :
                          ['/', 'x', '-', '+'].includes(k) ? 'bg-orange-400 text-white' :
                          ['AC', '+/-', '%'].includes(k) ? 'bg-gray-500 text-white' :
                          'bg-gray-600 text-white'}
                      `}
                    >
                      {k}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                <p className="text-yellow-700 text-xs font-semibold">To unlock: Enter your secret PIN in the calculator and press =</p>
                <p className="text-yellow-600 text-xs mt-1">You can set your PIN in Settings after setup.</p>
              </div>
            </div>
          )}

          {/* ── STEP 6: Night Mode ── */}
          {step === 6 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Moon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Night Safety Mode</h2>
              <p className="text-indigo-500 font-bold text-sm mb-5">Auto-activates when you travel at night</p>

              <p className="text-gray-500 text-sm mb-4">What time do you usually travel alone at night?</p>

              <input
                type="time"
                value={nightTime}
                onChange={e => { setNightTime(e.target.value); setNightTimeSaved(false); }}
                className="w-full px-4 py-4 border-2 border-indigo-200 rounded-2xl text-center text-2xl font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-400 outline-none mb-4"
              />

              <button
                onClick={() => {
                  localStorage.setItem('sheguardian_night_time', nightTime);
                  setNightTimeSaved(true);
                }}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                  nightTimeSaved
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                {nightTimeSaved ? 'Saved!' : 'Set Night Mode Time'}
              </button>

              <p className="text-gray-400 text-xs mt-3">Night mode increases alert sensitivity and dims the screen to save battery.</p>
            </div>
          )}

          {/* ── STEP 7: Language ── */}
          {step === 7 && (
            <div>
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 text-center mb-1">Choose Your Language</h2>
              <p className="text-teal-500 font-bold text-center text-sm mb-5">The whole app will switch instantly</p>

              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left transition-all ${
                      selectedLang === lang.code
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-gray-100 bg-gray-50 hover:border-teal-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                      selectedLang === lang.code ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {lang.flag}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-800">{lang.nativeName}</p>
                      <p className="text-xs text-gray-400">{lang.name}</p>
                    </div>
                    {selectedLang === lang.code && <Check size={14} className="ml-auto text-teal-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 8: Safety Score ── */}
          {step === 8 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Your Safety Score</h2>
              <p className="text-rose-500 font-bold text-sm mb-5">Based on your setup</p>

              <div className="flex justify-center mb-5">
                <SafetyScore score={safetyScore} />
              </div>

              <div className="space-y-2 mb-5">
                {[
                  { label: 'App Unlocked', done: true, points: 20 },
                  { label: 'Location Access', done: locationGranted, points: 25 },
                  { label: 'Trusted Contact Added', done: contactSaved, points: 30 },
                  { label: 'Night Mode Configured', done: nightTimeSaved, points: 15 },
                  { label: 'Language Selected', done: selectedLang !== 'en', points: 10 },
                ].map(({ label, done, points }) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${done ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {done ? <Check size={11} className="text-white" /> : <X size={11} className="text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${done ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
                    </div>
                    <span className={`text-xs font-bold ${done ? 'text-green-500' : 'text-gray-300'}`}>+{points}</span>
                  </div>
                ))}
              </div>

              {safetyScore < 70 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-orange-600 text-xs font-semibold">You can complete the remaining steps in Settings anytime to boost your score.</p>
                </div>
              )}

              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                <p className="text-rose-600 text-sm font-bold">SheGuardian is active and protecting you.</p>
                <p className="text-rose-400 text-xs mt-1">Welcome to your safety shield, {userName}.</p>
              </div>
            </div>
          )}

          {/* ── Bottom nav ── */}
          <div className="mt-6">
            {/* Skip contact step softly */}
            {step !== 3 && (
              <button
                onClick={goNext}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                {step === TOTAL_STEPS - 1 ? (
                  <><Check size={18} /> Start Using SheGuardian</>
                ) : (
                  <>Next <ChevronRight size={18} /></>
                )}
              </button>
            )}

            {step === 3 && contactSaved && (
              <button
                onClick={goNext}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* Step counter + dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === step ? 'w-5 h-2 bg-rose-500' : i < step ? 'w-2 h-2 bg-rose-300' : 'w-2 h-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-300 text-xs mt-2">{step + 1} of {TOTAL_STEPS}</p>

        </div>
      </div>
    </div>
  );
}
