// src/lib/translations.ts

export type Language =
  | 'en' | 'hi' | 'mr' | 'te' | 'ur'
  | 'ta' | 'gu' | 'sa' | 'kn' | 'bn';

export interface TranslationKeys {
  // App shell
  appName: string;
  appTagline: string;
  version: string;
  loading: string;
  signOut: string;
  signIn: string;
  signUp: string;
  home: string;
  aiChat: string;
  safety: string;
  tools: string;
  chat: string;
  settings: string;
  chooseLanguage: string;
  nightSafetyMode: string;
  nightSafetyModeActive: string;
  on: string;
  off: string;
  emergencyAlertSent: string;
  emergencyAlertDesc: string;
  emergencySOS: string;
  emergencySOSDesc: string;
  aiThreatMonitor: string;
  alertHistory: string;
  safetyNetwork: string;
  safetyNetworkDesc: string;
  liveSafetyHeatmap: string;
  heatmapDesc: string;
  safetyTools: string;
  safetyToolsDesc: string;
  trustedChat: string;
  trustedChatDesc: string;
  settingsTitle: string;
  settingsDesc: string;

  // AI Safety Chatbot
  aiAssistantTitle: string;
  aiAssistantSubtitle: string;
  aiAssistantStatus: string;
  aiAssistantPlaceholder: string;
  fakeCall: string;
  quickPrompt1: string;
  quickPrompt2: string;
  quickPrompt3: string;
  quickPrompt4: string;
  quickPrompt5: string;
  quickPrompt6: string;

  // Emergency Contacts
  emergencyContacts: string;
  addContact: string;
  noContacts: string;
  noContactsDesc: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  emailOptional: string;
  saveContact: string;
  cancel: string;

  // Safe Zones
  nearbySafeZones: string;
  allFilter: string;
  policeStation: string;
  hospital: string;
  fireStation: string;
  shelter: string;
  noSafeZones: string;
  getDirections: string;
  safeWalkingRoute: string;
  openInMaps: string;
  navigateSafely: string;
  walkingRouteNote: string;
  away: string;

  // Dead Man's Switch
  deadMansSwitch: string;
  deadMansSwitchDesc: string;
  inactive: string;
  active: string;
  warning: string;
  sosSent: string;
  chooseTimer: string;
  customMinutes: string;
  activateSwitch: string;
  warningNote: string;
  imSafe: string;
  sendSOSNow: string;
  stop: string;
  resetSwitch: string;
  emergencyAlertSentDMS: string;
  contactsNotified: string;
  locationShared: string;
  checkedInSafe: string;
  missedSOSTriggered: string;
  checkInHistory: string;
  timerTooShort: string;
  remaining: string;
  dmsSwitchInfo: string;

  // Offline Emergency
  offlineEmergencyMode: string;
  offlineEmergencyDesc: string;
  online: string;
  offline: string;
  connectedInstant: string;
  pendingLabel: string;
  sendingLabel: string;
  sentLabel: string;
  quickAlerts: string;
  needHelp: string;
  beingFollowed: string;
  medicalEmergency: string;
  inDanger: string;
  customMessage: string;
  typeEmergencyMsg: string;

  // Accessibility
  accessibilityTitle: string;
  accessibilityDesc: string;
  largeText: string;
  largeTextDesc: string;
  highContrast: string;
  highContrastDesc: string;
  largeButtons: string;
  largeButtonsDesc: string;
  darkMode: string;
  darkModeDesc: string;
  reduceMotion: string;
  reduceMotionDesc: string;
  textSpacing: string;
  textSpacingDesc: string;
  focusIndicators: string;
  focusIndicatorsDesc: string;
  voiceAnnouncements: string;
  voiceAnnouncementsDesc: string;
  resetAccessibility: string;
  accessibilityPreview: string;
  accessibilityPreviewText: string;
  accessibilityPreviewSub: string;
  noSettingsActive: string;
  activeCount: string;

  // Trusted Circle / Chat
  trustedCircleTitle: string;
  trustedCircleDesc: string;
  trustedChatTitle: string;
  allContacts: string;
  selectContacts: string;
  startLiveLocation: string;
  howTrustedCircleWorks: string;
}

export const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English',  nativeName: 'English',    flag: 'EN' },
  { code: 'hi', name: 'Hindi',    nativeName: 'हिन्दी',      flag: 'HI' },
  { code: 'mr', name: 'Marathi',  nativeName: 'मराठी',       flag: 'MR' },
  { code: 'te', name: 'Telugu',   nativeName: 'తెలుగు',      flag: 'TE' },
  { code: 'ur', name: 'Urdu',     nativeName: 'اردو',        flag: 'UR' },
  { code: 'ta', name: 'Tamil',    nativeName: 'தமிழ்',       flag: 'TA' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી',     flag: 'GU' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्',    flag: 'SA' },
  { code: 'kn', name: 'Kannada',  nativeName: 'ಕನ್ನಡ',       flag: 'KN' },
  { code: 'bn', name: 'Bengali',  nativeName: 'বাংলা',       flag: 'BN' },
];

const translations: Record<Language, TranslationKeys> = {

  en: {
    appName: 'SheGuardian', appTagline: 'Your Personal Safety Shield', version: 'v2.0 Pro',
    loading: 'Loading SheGuardian...', signOut: 'Sign Out', signIn: 'Sign In', signUp: 'Sign Up',
    home: 'Home', aiChat: 'AI Chat', safety: 'Safety', tools: 'Tools', chat: 'Chat', settings: 'Settings',
    chooseLanguage: 'Choose Language', nightSafetyMode: 'Night Safety Mode',
    nightSafetyModeActive: 'Night Safety Mode Active - Stay alert, help is one tap away',
    on: 'ON', off: 'OFF', emergencyAlertSent: 'Emergency Alert Sent!',
    emergencyAlertDesc: 'Your trusted contacts have been notified with your location.',
    emergencySOS: 'Emergency SOS', emergencySOSDesc: 'Tap to instantly alert your trusted contacts',
    aiThreatMonitor: 'AI Threat Monitor', alertHistory: 'Alert History',
    safetyNetwork: 'Safety Network', safetyNetworkDesc: 'Manage your trusted circle and safe zones',
    liveSafetyHeatmap: 'Live Safety Heatmap', heatmapDesc: 'Real-time incident data in your area',
    safetyTools: 'Safety Tools', safetyToolsDesc: 'Advanced tools to keep you protected',
    trustedChat: 'Trusted Chat', trustedChatDesc: 'Encrypted messaging with your trusted circle',
    settingsTitle: 'Settings', settingsDesc: 'Customize your SheGuardian experience',
    aiAssistantTitle: 'AI Safety Assistant', aiAssistantSubtitle: 'Get instant safety advice, trigger fake calls, and more',
    aiAssistantStatus: 'Always online • Here to help', aiAssistantPlaceholder: 'Ask me anything about safety...',
    fakeCall: 'Fake Call',
    quickPrompt1: 'I feel unsafe right now', quickPrompt2: 'Someone is following me',
    quickPrompt3: 'Walking alone at night', quickPrompt4: 'Trigger a fake call',
    quickPrompt5: 'How to escape danger?', quickPrompt6: 'Share my location tips',
    emergencyContacts: 'Emergency Contacts', addContact: 'Add Contact',
    noContacts: 'No emergency contacts added yet', noContactsDesc: 'Add contacts who will be alerted in case of emergency',
    nameLabel: 'Name', phoneLabel: 'Phone Number', emailLabel: 'Email', emailOptional: 'Email (Optional)',
    saveContact: 'Save Contact', cancel: 'Cancel',
    nearbySafeZones: 'Nearby Safe Zones', allFilter: 'All', policeStation: 'Police Station',
    hospital: 'Hospital', fireStation: 'Fire Station', shelter: 'Shelter',
    noSafeZones: 'No nearby safe zones found', getDirections: 'Get Directions',
    safeWalkingRoute: 'Safest Walking Route', openInMaps: 'Open in Maps App',
    navigateSafely: 'Navigate safely to this location',
    walkingRouteNote: 'Walking route avoids highways · stays on footpaths', away: 'away',
    deadMansSwitch: "Dead Man's Switch", deadMansSwitchDesc: "Auto-SOS if you don't check in",
    inactive: 'INACTIVE', active: 'ACTIVE', warning: 'WARNING', sosSent: 'SOS SENT',
    chooseTimer: 'Choose Timer', customMinutes: 'Custom minutes...', activateSwitch: 'Activate Switch',
    warningNote: 'Warning alert 60 seconds before SOS triggers',
    imSafe: "I'M SAFE", sendSOSNow: 'Send SOS Now', stop: 'Stop', resetSwitch: 'Reset Switch',
    emergencyAlertSentDMS: 'Emergency Alert Sent!', contactsNotified: 'Your trusted contacts have been notified',
    locationShared: 'Location shared', checkedInSafe: 'Checked in safe', missedSOSTriggered: 'Missed — SOS triggered',
    checkInHistory: 'Check-in History', timerTooShort: 'Minimum timer is 1 minute', remaining: 'remaining',
    dmsSwitchInfo: 'Set a timer. If you don\'t tap "I\'m Safe" before it ends, your emergency contacts are automatically notified with your location.',
    offlineEmergencyMode: 'Offline Emergency Mode', offlineEmergencyDesc: 'SMS works without internet. Auto-sends when data returns.',
    online: 'Online', offline: 'Offline', connectedInstant: 'Connected - alerts send instantly',
    pendingLabel: 'Pending', sendingLabel: 'Sending', sentLabel: 'Sent',
    quickAlerts: 'QUICK EMERGENCY ALERTS', needHelp: 'I need help!', beingFollowed: 'Being followed',
    medicalEmergency: 'Medical emergency', inDanger: 'I am in danger',
    customMessage: 'CUSTOM MESSAGE', typeEmergencyMsg: 'Type emergency message...',
    accessibilityTitle: 'Accessibility Support', accessibilityDesc: 'Customize the app for your needs',
    largeText: 'Large Text', largeTextDesc: 'Increases font size by 20%',
    highContrast: 'High Contrast', highContrastDesc: 'Boosts color contrast for visibility',
    largeButtons: 'Large Buttons', largeButtonsDesc: 'Makes all buttons bigger & easier to tap',
    darkMode: 'Dark Mode', darkModeDesc: 'Reduces eye strain in low light',
    reduceMotion: 'Reduce Motion', reduceMotionDesc: 'Stops animations & transitions',
    textSpacing: 'Text Spacing', textSpacingDesc: 'Increases letter & line spacing',
    focusIndicators: 'Focus Indicators', focusIndicatorsDesc: 'Shows orange outline on focused elements',
    voiceAnnouncements: 'Voice Announcements', voiceAnnouncementsDesc: 'Speaks aloud when settings change',
    resetAccessibility: 'Reset All Accessibility Settings',
    accessibilityPreview: 'Preview', accessibilityPreviewText: 'AI Guardian keeps you safe',
    accessibilityPreviewSub: 'Your smart safety companion',
    noSettingsActive: 'No settings active. Toggle any option above to customize your experience.',
    activeCount: 'active',
    trustedCircleTitle: 'Trusted Circle', trustedCircleDesc: 'Live location sharing with your trusted contacts',
    trustedChatTitle: 'Trusted Chat', allContacts: 'All',
    selectContacts: 'Select contacts to share location with',
    startLiveLocation: 'Start Live Location Sharing',
    howTrustedCircleWorks: 'How Trusted Circle works',
  },

  hi: {
    appName: 'शीगार्जियन', appTagline: 'आपकी व्यक्तिगत सुरक्षा ढाल', version: 'v2.0 प्रो',
    loading: 'शीगार्जियन लोड हो रहा है...', signOut: 'साइन आउट', signIn: 'साइन इन', signUp: 'साइन अप',
    home: 'होम', aiChat: 'AI चैट', safety: 'सुरक्षा', tools: 'टूल्स', chat: 'चैट', settings: 'सेटिंग्स',
    chooseLanguage: 'भाषा चुनें', nightSafetyMode: 'रात्रि सुरक्षा मोड',
    nightSafetyModeActive: 'रात्रि सुरक्षा मोड सक्रिय - सतर्क रहें, मदद एक टैप दूर है',
    on: 'चालू', off: 'बंद', emergencyAlertSent: 'आपातकालीन अलर्ट भेजा गया!',
    emergencyAlertDesc: 'आपके विश्वसनीय संपर्कों को आपकी लोकेशन के साथ सूचित किया गया है।',
    emergencySOS: 'आपातकालीन SOS', emergencySOSDesc: 'अपने विश्वसनीय संपर्कों को तुरंत सतर्क करने के लिए टैप करें',
    aiThreatMonitor: 'AI खतरा मॉनिटर', alertHistory: 'अलर्ट इतिहास',
    safetyNetwork: 'सुरक्षा नेटवर्क', safetyNetworkDesc: 'अपने विश्वसनीय सर्कल और सुरक्षित क्षेत्रों का प्रबंधन करें',
    liveSafetyHeatmap: 'लाइव सुरक्षा हीटमैप', heatmapDesc: 'आपके क्षेत्र में वास्तविक समय की घटना डेटा',
    safetyTools: 'सुरक्षा टूल्स', safetyToolsDesc: 'आपकी सुरक्षा के लिए उन्नत टूल्स',
    trustedChat: 'विश्वसनीय चैट', trustedChatDesc: 'अपने विश्वसनीय सर्कल के साथ एन्क्रिप्टेड संदेश',
    settingsTitle: 'सेटिंग्स', settingsDesc: 'अपना शीगार्जियन अनुभव अनुकूलित करें',
    aiAssistantTitle: 'AI सुरक्षा सहायक', aiAssistantSubtitle: 'तत्काल सुरक्षा सलाह पाएं, फेक कॉल करें और अधिक',
    aiAssistantStatus: 'हमेशा ऑनलाइन • मदद के लिए यहाँ', aiAssistantPlaceholder: 'सुरक्षा के बारे में कुछ भी पूछें...',
    fakeCall: 'नकली कॉल',
    quickPrompt1: 'मुझे अभी असुरक्षित महसूस हो रहा है', quickPrompt2: 'कोई मेरा पीछा कर रहा है',
    quickPrompt3: 'रात को अकेले चल रहा हूं', quickPrompt4: 'नकली कॉल करें',
    quickPrompt5: 'खतरे से कैसे बचें?', quickPrompt6: 'मेरी लोकेशन शेयर करें',
    emergencyContacts: 'आपातकालीन संपर्क', addContact: 'संपर्क जोड़ें',
    noContacts: 'अभी तक कोई आपातकालीन संपर्क नहीं जोड़ा गया', noContactsDesc: 'वे संपर्क जोड़ें जिन्हें आपात स्थिति में सतर्क किया जाएगा',
    nameLabel: 'नाम', phoneLabel: 'फोन नंबर', emailLabel: 'ईमेल', emailOptional: 'ईमेल (वैकल्पिक)',
    saveContact: 'संपर्क सहेजें', cancel: 'रद्द करें',
    nearbySafeZones: 'नजदीकी सुरक्षित क्षेत्र', allFilter: 'सभी', policeStation: 'पुलिस स्टेशन',
    hospital: 'अस्पताल', fireStation: 'अग्निशमन केंद्र', shelter: 'आश्रय',
    noSafeZones: 'कोई नजदीकी सुरक्षित क्षेत्र नहीं मिला', getDirections: 'दिशा-निर्देश पाएं',
    safeWalkingRoute: 'सबसे सुरक्षित पैदल मार्ग', openInMaps: 'मैप्स ऐप में खोलें',
    navigateSafely: 'इस स्थान तक सुरक्षित रूप से नेविगेट करें',
    walkingRouteNote: 'पैदल मार्ग राजमार्गों से बचता है · फुटपाथ पर रहता है', away: 'दूर',
    deadMansSwitch: 'डेड मैन्स स्विच', deadMansSwitchDesc: 'अगर आप चेक इन नहीं करते तो स्वचालित SOS',
    inactive: 'निष्क्रिय', active: 'सक्रिय', warning: 'चेतावनी', sosSent: 'SOS भेजा',
    chooseTimer: 'टाइमर चुनें', customMinutes: 'कस्टम मिनट...', activateSwitch: 'स्विच सक्रिय करें',
    warningNote: 'SOS ट्रिगर होने से 60 सेकंड पहले चेतावनी',
    imSafe: 'मैं सुरक्षित हूं', sendSOSNow: 'अभी SOS भेजें', stop: 'रोकें', resetSwitch: 'स्विच रीसेट करें',
    emergencyAlertSentDMS: 'आपातकालीन अलर्ट भेजा गया!', contactsNotified: 'आपके विश्वसनीय संपर्कों को सूचित किया गया',
    locationShared: 'स्थान साझा किया गया', checkedInSafe: 'सुरक्षित चेक इन किया',
    missedSOSTriggered: 'चूक गए — SOS ट्रिगर हुआ', checkInHistory: 'चेक-इन इतिहास',
    timerTooShort: 'न्यूनतम टाइमर 1 मिनट है', remaining: 'शेष',
    dmsSwitchInfo: 'टाइमर सेट करें। अगर आप समाप्त होने से पहले "मैं सुरक्षित हूं" नहीं टैप करते, तो आपके संपर्कों को स्वचालित रूप से सूचित किया जाएगा।',
    offlineEmergencyMode: 'ऑफलाइन आपातकाल मोड', offlineEmergencyDesc: 'SMS बिना इंटरनेट के काम करता है। डेटा वापस आने पर स्वचालित भेजता है।',
    online: 'ऑनलाइन', offline: 'ऑफलाइन', connectedInstant: 'कनेक्टेड - अलर्ट तुरंत भेजे जाते हैं',
    pendingLabel: 'लंबित', sendingLabel: 'भेज रहे हैं', sentLabel: 'भेजा गया',
    quickAlerts: 'त्वरित आपातकालीन अलर्ट', needHelp: 'मुझे मदद चाहिए!', beingFollowed: 'पीछा किया जा रहा है',
    medicalEmergency: 'चिकित्सा आपातकाल', inDanger: 'मैं खतरे में हूं',
    customMessage: 'कस्टम संदेश', typeEmergencyMsg: 'आपातकालीन संदेश टाइप करें...',
    accessibilityTitle: 'पहुंच सहायता', accessibilityDesc: 'अपनी जरूरतों के अनुसार ऐप कस्टमाइज़ करें',
    largeText: 'बड़ा टेक्स्ट', largeTextDesc: 'फ़ॉन्ट आकार 20% बढ़ाता है',
    highContrast: 'उच्च कंट्रास्ट', highContrastDesc: 'दृश्यता के लिए रंग कंट्रास्ट बढ़ाता है',
    largeButtons: 'बड़े बटन', largeButtonsDesc: 'सभी बटन बड़े और आसानी से टैप करने योग्य बनाता है',
    darkMode: 'डार्क मोड', darkModeDesc: 'कम रोशनी में आंखों का तनाव कम करता है',
    reduceMotion: 'गति कम करें', reduceMotionDesc: 'एनिमेशन और ट्रांजिशन बंद करता है',
    textSpacing: 'टेक्स्ट स्पेसिंग', textSpacingDesc: 'अक्षर और लाइन स्पेसिंग बढ़ाता है',
    focusIndicators: 'फोकस संकेतक', focusIndicatorsDesc: 'फोकस किए गए तत्वों पर नारंगी रेखा दिखाता है',
    voiceAnnouncements: 'वॉइस घोषणाएं', voiceAnnouncementsDesc: 'सेटिंग्स बदलने पर बोलता है',
    resetAccessibility: 'सभी पहुंच सेटिंग्स रीसेट करें',
    accessibilityPreview: 'पूर्वावलोकन', accessibilityPreviewText: 'AI Guardian आपको सुरक्षित रखता है',
    accessibilityPreviewSub: 'आपका स्मार्ट सुरक्षा साथी',
    noSettingsActive: 'कोई सेटिंग सक्रिय नहीं। अपना अनुभव कस्टमाइज़ करने के लिए ऊपर कोई विकल्प चालू करें।',
    activeCount: 'सक्रिय',
    trustedCircleTitle: 'विश्वसनीय सर्कल', trustedCircleDesc: 'अपने विश्वसनीय संपर्कों के साथ लाइव लोकेशन शेयरिंग',
    trustedChatTitle: 'विश्वसनीय चैट', allContacts: 'सभी',
    selectContacts: 'लोकेशन शेयर करने के लिए संपर्क चुनें',
    startLiveLocation: 'लाइव लोकेशन शेयरिंग शुरू करें',
    howTrustedCircleWorks: 'विश्वसनीय सर्कल कैसे काम करता है',
  },

  mr: {
    appName: 'शीगार्डियन', appTagline: 'तुमची वैयक्तिक सुरक्षा ढाल', version: 'v2.0 प्रो',
    loading: 'शीगार्डियन लोड होत आहे...', signOut: 'साइन आउट', signIn: 'साइन इन', signUp: 'साइन अप',
    home: 'मुख्यपृष्ठ', aiChat: 'AI चॅट', safety: 'सुरक्षा', tools: 'साधने', chat: 'चॅट', settings: 'सेटिंग्ज',
    chooseLanguage: 'भाषा निवडा', nightSafetyMode: 'रात्र सुरक्षा मोड',
    nightSafetyModeActive: 'रात्र सुरक्षा मोड सक्रिय - सतर्क राहा, मदत एका टॅपवर आहे',
    on: 'चालू', off: 'बंद', emergencyAlertSent: 'आपत्कालीन अलर्ट पाठवला!',
    emergencyAlertDesc: 'तुमच्या विश्वासू संपर्कांना तुमच्या स्थानासह सूचित केले आहे.',
    emergencySOS: 'आपत्कालीन SOS', emergencySOSDesc: 'तुमच्या विश्वासू संपर्कांना त्वरित सूचित करण्यासाठी टॅप करा',
    aiThreatMonitor: 'AI धोका मॉनिटर', alertHistory: 'अलर्ट इतिहास',
    safetyNetwork: 'सुरक्षा नेटवर्क', safetyNetworkDesc: 'तुमचे विश्वासू मंडळ आणि सुरक्षित क्षेत्रे व्यवस्थापित करा',
    liveSafetyHeatmap: 'थेट सुरक्षा हीटमॅप', heatmapDesc: 'तुमच्या परिसरातील रिअल-टाइम घटना डेटा',
    safetyTools: 'सुरक्षा साधने', safetyToolsDesc: 'तुमच्या संरक्षणासाठी प्रगत साधने',
    trustedChat: 'विश्वासू चॅट', trustedChatDesc: 'तुमच्या विश्वासू मंडळासोबत एन्क्रिप्टेड संदेश',
    settingsTitle: 'सेटिंग्ज', settingsDesc: 'तुमचा शीगार्डियन अनुभव सानुकूलित करा',
    aiAssistantTitle: 'AI सुरक्षा सहाय्यक', aiAssistantSubtitle: 'तत्काळ सुरक्षा सल्ला मिळवा, बनावट कॉल करा आणि बरेच काही',
    aiAssistantStatus: 'नेहमी ऑनलाइन • मदतीसाठी येथे', aiAssistantPlaceholder: 'सुरक्षेबद्दल काहीही विचारा...',
    fakeCall: 'बनावट कॉल',
    quickPrompt1: 'मला आत्ता असुरक्षित वाटत आहे', quickPrompt2: 'कोणीतरी माझा पाठलाग करत आहे',
    quickPrompt3: 'रात्री एकटे चालत आहे', quickPrompt4: 'बनावट कॉल करा',
    quickPrompt5: 'धोक्यातून कसे सुटायचे?', quickPrompt6: 'माझे स्थान शेअर करा',
    emergencyContacts: 'आपत्कालीन संपर्क', addContact: 'संपर्क जोडा',
    noContacts: 'अद्याप कोणतेही आपत्कालीन संपर्क जोडले नाहीत', noContactsDesc: 'आपत्कालीन परिस्थितीत ज्यांना सतर्क केले जाईल असे संपर्क जोडा',
    nameLabel: 'नाव', phoneLabel: 'फोन नंबर', emailLabel: 'ईमेल', emailOptional: 'ईमेल (पर्यायी)',
    saveContact: 'संपर्क जतन करा', cancel: 'रद्द करा',
    nearbySafeZones: 'जवळील सुरक्षित क्षेत्रे', allFilter: 'सर्व', policeStation: 'पोलीस स्थानक',
    hospital: 'रुग्णालय', fireStation: 'अग्निशमन केंद्र', shelter: 'आश्रय',
    noSafeZones: 'कोणतेही जवळील सुरक्षित क्षेत्र आढळले नाही', getDirections: 'दिशानिर्देश मिळवा',
    safeWalkingRoute: 'सर्वात सुरक्षित पायी मार्ग', openInMaps: 'मॅप्स ॲपमध्ये उघडा',
    navigateSafely: 'या ठिकाणी सुरक्षितपणे नेव्हिगेट करा',
    walkingRouteNote: 'पायी मार्ग महामार्ग टाळतो · फुटपाथवर राहतो', away: 'दूर',
    deadMansSwitch: 'डेड मॅन्स स्विच', deadMansSwitchDesc: 'तुम्ही चेक इन न केल्यास स्वयंचलित SOS',
    inactive: 'निष्क्रिय', active: 'सक्रिय', warning: 'इशारा', sosSent: 'SOS पाठवला',
    chooseTimer: 'टायमर निवडा', customMinutes: 'कस्टम मिनिटे...', activateSwitch: 'स्विच सक्रिय करा',
    warningNote: 'SOS ट्रिगर होण्याच्या 60 सेकंद आधी इशारा',
    imSafe: 'मी सुरक्षित आहे', sendSOSNow: 'आत्ता SOS पाठवा', stop: 'थांबा', resetSwitch: 'स्विच रीसेट करा',
    emergencyAlertSentDMS: 'आपत्कालीन अलर्ट पाठवला!', contactsNotified: 'तुमच्या विश्वासू संपर्कांना सूचित केले आहे',
    locationShared: 'स्थान सामायिक केले', checkedInSafe: 'सुरक्षितपणे चेक इन केले',
    missedSOSTriggered: 'चुकले — SOS ट्रिगर झाला', checkInHistory: 'चेक-इन इतिहास',
    timerTooShort: 'किमान टायमर 1 मिनिट आहे', remaining: 'शिल्लक',
    dmsSwitchInfo: 'टायमर सेट करा. संपण्यापूर्वी "मी सुरक्षित आहे" टॅप न केल्यास, तुमच्या संपर्कांना स्वयंचलितपणे सूचित केले जाईल.',
    offlineEmergencyMode: 'ऑफलाइन आपत्कालीन मोड', offlineEmergencyDesc: 'SMS इंटरनेटशिवाय काम करते. डेटा परत आल्यावर स्वयंचलित पाठवते.',
    online: 'ऑनलाइन', offline: 'ऑफलाइन', connectedInstant: 'कनेक्टेड - अलर्ट लगेच पाठवले जातात',
    pendingLabel: 'प्रलंबित', sendingLabel: 'पाठवत आहे', sentLabel: 'पाठवले',
    quickAlerts: 'त्वरित आपत्कालीन अलर्ट', needHelp: 'मला मदत हवी आहे!', beingFollowed: 'पाठलाग होत आहे',
    medicalEmergency: 'वैद्यकीय आपत्कालीन', inDanger: 'मी धोक्यात आहे',
    customMessage: 'सानुकूल संदेश', typeEmergencyMsg: 'आपत्कालीन संदेश टाइप करा...',
    accessibilityTitle: 'प्रवेशयोग्यता सहाय्य', accessibilityDesc: 'तुमच्या गरजेनुसार ॲप सानुकूलित करा',
    largeText: 'मोठा मजकूर', largeTextDesc: 'फॉन्ट आकार 20% वाढवतो',
    highContrast: 'उच्च कॉन्ट्रास्ट', highContrastDesc: 'दृश्यमानतेसाठी रंग कॉन्ट्रास्ट वाढवतो',
    largeButtons: 'मोठे बटण', largeButtonsDesc: 'सर्व बटणे मोठी आणि टॅप करण्यास सोपी बनवते',
    darkMode: 'डार्क मोड', darkModeDesc: 'कमी प्रकाशात डोळ्यांचा ताण कमी करतो',
    reduceMotion: 'गती कमी करा', reduceMotionDesc: 'अॅनिमेशन आणि ट्रांझिशन थांबवते',
    textSpacing: 'मजकूर अंतर', textSpacingDesc: 'अक्षर आणि ओळ अंतर वाढवते',
    focusIndicators: 'फोकस संकेतक', focusIndicatorsDesc: 'फोकस केलेल्या घटकांवर नारिंगी बाह्यरेखा दाखवते',
    voiceAnnouncements: 'आवाज घोषणा', voiceAnnouncementsDesc: 'सेटिंग्ज बदलल्यावर बोलते',
    resetAccessibility: 'सर्व प्रवेशयोग्यता सेटिंग्ज रीसेट करा',
    accessibilityPreview: 'पूर्वावलोकन', accessibilityPreviewText: 'AI Guardian तुम्हाला सुरक्षित ठेवते',
    accessibilityPreviewSub: 'तुमचा स्मार्ट सुरक्षा साथी',
    noSettingsActive: 'कोणतीही सेटिंग सक्रिय नाही. तुमचा अनुभव सानुकूलित करण्यासाठी वर पर्याय चालू करा.',
    activeCount: 'सक्रिय',
    trustedCircleTitle: 'विश्वासू मंडळ', trustedCircleDesc: 'तुमच्या विश्वासू संपर्कांसोबत थेट स्थान सामायिकरण',
    trustedChatTitle: 'विश्वासू चॅट', allContacts: 'सर्व',
    selectContacts: 'स्थान सामायिक करण्यासाठी संपर्क निवडा',
    startLiveLocation: 'थेट स्थान सामायिकरण सुरू करा',
    howTrustedCircleWorks: 'विश्वासू मंडळ कसे काम करते',
  },

  te: {
    appName: 'షీగార్డియన్', appTagline: 'మీ వ్యక్తిగత భద్రతా కవచం', version: 'v2.0 ప్రో',
    loading: 'షీగార్డియన్ లోడ్ అవుతోంది...', signOut: 'సైన్ అవుట్', signIn: 'సైన్ ఇన్', signUp: 'సైన్ అప్',
    home: 'హోమ్', aiChat: 'AI చాట్', safety: 'భద్రత', tools: 'టూల్స్', chat: 'చాట్', settings: 'సెట్టింగ్స్',
    chooseLanguage: 'భాష ఎంచుకోండి', nightSafetyMode: 'రాత్రి భద్రతా మోడ్',
    nightSafetyModeActive: 'రాత్రి భద్రతా మోడ్ సక్రియంగా ఉంది - అప్రమత్తంగా ఉండండి',
    on: 'ఆన్', off: 'ఆఫ్', emergencyAlertSent: 'అత్యవసర హెచ్చరిక పంపబడింది!',
    emergencyAlertDesc: 'మీ విశ్వసనీయ పరిచయాలకు మీ స్థానంతో సూచించబడింది.',
    emergencySOS: 'అత్యవసర SOS', emergencySOSDesc: 'మీ విశ్వసనీయ పరిచయాలను వెంటనే హెచ్చరించడానికి నొక్కండి',
    aiThreatMonitor: 'AI ముప్పు మానిటర్', alertHistory: 'హెచ్చరిక చరిత్ర',
    safetyNetwork: 'భద్రతా నెట్‌వర్క్', safetyNetworkDesc: 'మీ విశ్వసనీయ వృత్తం మరియు సురక్షిత జోన్‌లను నిర్వహించండి',
    liveSafetyHeatmap: 'లైవ్ సేఫ్టీ హీట్‌మ్యాప్', heatmapDesc: 'మీ ప్రాంతంలో రియల్-టైమ్ సంఘటన డేటా',
    safetyTools: 'భద్రతా సాధనాలు', safetyToolsDesc: 'మిమ్మల్ని రక్షించడానికి అధునాతన సాధనాలు',
    trustedChat: 'విశ్వసనీయ చాట్', trustedChatDesc: 'మీ విశ్వసనీయ వృత్తంతో గుప్తీకరించిన సందేశాలు',
    settingsTitle: 'సెట్టింగ్స్', settingsDesc: 'మీ షీగార్డియన్ అనుభవాన్ని అనుకూలీకరించండి',
    aiAssistantTitle: 'AI భద్రతా సహాయకుడు', aiAssistantSubtitle: 'తక్షణ భద్రతా సలహా పొందండి, నకిలీ కాల్‌లు ట్రిగ్గర్ చేయండి',
    aiAssistantStatus: 'ఎల్లప్పుడూ ఆన్‌లైన్ • సహాయానికి ఇక్కడ', aiAssistantPlaceholder: 'భద్రత గురించి ఏదైనా అడగండి...',
    fakeCall: 'నకిలీ కాల్',
    quickPrompt1: 'నాకు ఇప్పుడు అసురక్షితంగా అనిపిస్తోంది', quickPrompt2: 'ఎవరో నన్ను వెంబడిస్తున్నారు',
    quickPrompt3: 'రాత్రి ఒంటరిగా నడుస్తున్నాను', quickPrompt4: 'నకిలీ కాల్ ట్రిగ్గర్ చేయండి',
    quickPrompt5: 'ప్రమాదం నుండి ఎలా తప్పించుకోవాలి?', quickPrompt6: 'నా స్థానాన్ని షేర్ చేయండి',
    emergencyContacts: 'అత్యవసర పరిచయాలు', addContact: 'పరిచయం జోడించండి',
    noContacts: 'ఇంకా అత్యవసర పరిచయాలు జోడించబడలేదు', noContactsDesc: 'అత్యవసర సమయంలో హెచ్చరించబడే పరిచయాలను జోడించండి',
    nameLabel: 'పేరు', phoneLabel: 'ఫోన్ నంబర్', emailLabel: 'ఇమెయిల్', emailOptional: 'ఇమెయిల్ (ఐచ్ఛికం)',
    saveContact: 'పరిచయం సేవ్ చేయండి', cancel: 'రద్దు చేయండి',
    nearbySafeZones: 'సమీప సురక్షిత జోన్‌లు', allFilter: 'అన్నీ', policeStation: 'పోలీస్ స్టేషన్',
    hospital: 'ఆసుపత్రి', fireStation: 'అగ్నిమాపక కేంద్రం', shelter: 'ఆశ్రయం',
    noSafeZones: 'సమీప సురక్షిత జోన్‌లు కనుగొనబడలేదు', getDirections: 'దిశలు పొందండి',
    safeWalkingRoute: 'సురక్షితమైన నడక మార్గం', openInMaps: 'మ్యాప్స్ యాప్‌లో తెరవండి',
    navigateSafely: 'ఈ స్థానానికి సురక్షితంగా నావిగేట్ చేయండి',
    walkingRouteNote: 'నడక మార్గం హైవేలను నివారిస్తుంది · ఫుట్‌పాత్‌లో ఉంటుంది', away: 'దూరం',
    deadMansSwitch: 'డెడ్ మ్యాన్స్ స్విచ్', deadMansSwitchDesc: 'చెక్ ఇన్ చేయకపోతే స్వయంచాలక SOS',
    inactive: 'నిష్క్రియంగా', active: 'సక్రియంగా', warning: 'హెచ్చరిక', sosSent: 'SOS పంపబడింది',
    chooseTimer: 'టైమర్ ఎంచుకోండి', customMinutes: 'కస్టమ్ నిమిషాలు...', activateSwitch: 'స్విచ్ సక్రియం చేయండి',
    warningNote: 'SOS ట్రిగ్గర్ అవడానికి 60 సెకన్లముందు హెచ్చరిక',
    imSafe: 'నేను సురక్షితంగా ఉన్నాను', sendSOSNow: 'ఇప్పుడు SOS పంపండి', stop: 'ఆపండి', resetSwitch: 'స్విచ్ రీసెట్ చేయండి',
    emergencyAlertSentDMS: 'అత్యవసర హెచ్చరిక పంపబడింది!', contactsNotified: 'మీ విశ్వసనీయ పరిచయాలకు తెలియజేయబడింది',
    locationShared: 'స్థానం షేర్ చేయబడింది', checkedInSafe: 'సురక్షితంగా చెక్ ఇన్ చేయబడింది',
    missedSOSTriggered: 'మిస్ అయింది — SOS ట్రిగ్గర్ అయింది', checkInHistory: 'చెక్-ఇన్ చరిత్ర',
    timerTooShort: 'కనీస టైమర్ 1 నిమిషం', remaining: 'మిగిలింది',
    dmsSwitchInfo: 'టైమర్ సెట్ చేయండి. ముగిసే ముందు "నేను సురక్షితంగా ఉన్నాను" నొక్కకపోతే, మీ పరిచయాలకు స్వయంచాలకంగా తెలియజేయబడుతుంది.',
    offlineEmergencyMode: 'ఆఫ్‌లైన్ అత్యవసర మోడ్', offlineEmergencyDesc: 'SMS ఇంటర్నెట్ లేకుండా పనిచేస్తుంది. డేటా తిరిగి వచ్చినప్పుడు స్వయంచాలకంగా పంపుతుంది.',
    online: 'ఆన్‌లైన్', offline: 'ఆఫ్‌లైన్', connectedInstant: 'కనెక్ట్ అయింది - హెచ్చరికలు వెంటనే పంపబడతాయి',
    pendingLabel: 'పెండింగ్', sendingLabel: 'పంపుతోంది', sentLabel: 'పంపబడింది',
    quickAlerts: 'శీఘ్ర అత్యవసర హెచ్చరికలు', needHelp: 'నాకు సహాయం కావాలి!', beingFollowed: 'వెంబడించబడుతున్నాను',
    medicalEmergency: 'వైద్య అత్యవసరం', inDanger: 'నేను ప్రమాదంలో ఉన్నాను',
    customMessage: 'కస్టమ్ సందేశం', typeEmergencyMsg: 'అత్యవసర సందేశం టైప్ చేయండి...',
    accessibilityTitle: 'యాక్సెసిబిలిటీ సపోర్ట్', accessibilityDesc: 'మీ అవసరాలకు అనుగుణంగా యాప్‌ను అనుకూలీకరించండి',
    largeText: 'పెద్ద వచనం', largeTextDesc: 'ఫాంట్ పరిమాణాన్ని 20% పెంచుతుంది',
    highContrast: 'అధిక కాంట్రాస్ట్', highContrastDesc: 'దృశ్యమానత కోసం రంగు కాంట్రాస్ట్ పెంచుతుంది',
    largeButtons: 'పెద్ద బటన్లు', largeButtonsDesc: 'అన్ని బటన్లను పెద్దవిగా మరియు తాకడానికి సులభంగా చేస్తుంది',
    darkMode: 'డార్క్ మోడ్', darkModeDesc: 'తక్కువ వెలుతురులో కంటి అలసటను తగ్గిస్తుంది',
    reduceMotion: 'మోషన్ తగ్గించండి', reduceMotionDesc: 'యానిమేషన్‌లు మరియు ట్రాన్సిషన్‌లను ఆపుతుంది',
    textSpacing: 'వచన అంతరం', textSpacingDesc: 'అక్షరం మరియు లైన్ అంతరాన్ని పెంచుతుంది',
    focusIndicators: 'ఫోకస్ సూచికలు', focusIndicatorsDesc: 'ఫోకస్ అయిన అంశాలపై నారింజ రేఖను చూపిస్తుంది',
    voiceAnnouncements: 'వాయిస్ ప్రకటనలు', voiceAnnouncementsDesc: 'సెట్టింగ్‌లు మారినప్పుడు గట్టిగా చదువుతుంది',
    resetAccessibility: 'అన్ని యాక్సెసిబిలిటీ సెట్టింగ్‌లను రీసెట్ చేయండి',
    accessibilityPreview: 'ప్రివ్యూ', accessibilityPreviewText: 'AI Guardian మిమ్మల్ని సురక్షితంగా ఉంచుతుంది',
    accessibilityPreviewSub: 'మీ స్మార్ట్ సేఫ్టీ సహాయకుడు',
    noSettingsActive: 'సెట్టింగ్‌లు ఏవీ సక్రియంగా లేవు. మీ అనుభవాన్ని అనుకూలీకరించడానికి పైన ఏదైనా టోగుల్ చేయండి.',
    activeCount: 'సక్రియం',
    trustedCircleTitle: 'విశ్వసనీయ వృత్తం', trustedCircleDesc: 'మీ విశ్వసనీయ పరిచయాలతో లైవ్ లొకేషన్ షేరింగ్',
    trustedChatTitle: 'విశ్వసనీయ చాట్', allContacts: 'అన్నీ',
    selectContacts: 'స్థానం షేర్ చేయడానికి పరిచయాలు ఎంచుకోండి',
    startLiveLocation: 'లైవ్ లొకేషన్ షేరింగ్ ప్రారంభించండి',
    howTrustedCircleWorks: 'విశ్వసనీయ వృత్తం ఎలా పనిచేస్తుంది',
  },

  ur: {
    appName: 'شی گارڈین', appTagline: 'آپ کی ذاتی حفاظتی ڈھال', version: 'v2.0 پرو',
    loading: 'شی گارڈین لوڈ ہو رہا ہے...', signOut: 'سائن آؤٹ', signIn: 'سائن ان', signUp: 'سائن اپ',
    home: 'ہوم', aiChat: 'AI چیٹ', safety: 'حفاظت', tools: 'ٹولز', chat: 'چیٹ', settings: 'ترتیبات',
    chooseLanguage: 'زبان چنیں', nightSafetyMode: 'رات حفاظتی موڈ',
    nightSafetyModeActive: 'رات حفاظتی موڈ فعال - چوکنا رہیں، مدد ایک ٹیپ دور ہے',
    on: 'آن', off: 'آف', emergencyAlertSent: 'ہنگامی الرٹ بھیجا گیا!',
    emergencyAlertDesc: 'آپ کے قابل اعتماد رابطوں کو آپ کے مقام کے ساتھ مطلع کیا گیا ہے۔',
    emergencySOS: 'ہنگامی SOS', emergencySOSDesc: 'اپنے قابل اعتماد رابطوں کو فوری طور پر الرٹ کرنے کے لیے ٹیپ کریں',
    aiThreatMonitor: 'AI خطرہ مانیٹر', alertHistory: 'الرٹ تاریخ',
    safetyNetwork: 'حفاظتی نیٹ ورک', safetyNetworkDesc: 'اپنے قابل اعتماد حلقے اور محفوظ زونز کا انتظام کریں',
    liveSafetyHeatmap: 'لائیو سیفٹی ہیٹ میپ', heatmapDesc: 'آپ کے علاقے میں ریئل ٹائم واقعات کا ڈیٹا',
    safetyTools: 'حفاظتی ٹولز', safetyToolsDesc: 'آپ کی حفاظت کے لیے جدید ٹولز',
    trustedChat: 'قابل اعتماد چیٹ', trustedChatDesc: 'اپنے قابل اعتماد حلقے کے ساتھ خفیہ پیغام رسانی',
    settingsTitle: 'ترتیبات', settingsDesc: 'اپنا شی گارڈین تجربہ حسب ضرورت بنائیں',
    aiAssistantTitle: 'AI سیفٹی اسسٹنٹ', aiAssistantSubtitle: 'فوری حفاظتی مشورہ پائیں، جعلی کالز کریں اور مزید',
    aiAssistantStatus: 'ہمیشہ آن لائن • مدد کے لیے یہاں', aiAssistantPlaceholder: 'حفاظت کے بارے میں کچھ بھی پوچھیں...',
    fakeCall: 'جعلی کال',
    quickPrompt1: 'مجھے ابھی غیر محفوظ محسوس ہو رہا ہے', quickPrompt2: 'کوئی میرا پیچھا کر رہا ہے',
    quickPrompt3: 'رات کو اکیلے چل رہی ہوں', quickPrompt4: 'جعلی کال کریں',
    quickPrompt5: 'خطرے سے کیسے بچیں؟', quickPrompt6: 'میرا مقام شیئر کریں',
    emergencyContacts: 'ہنگامی رابطے', addContact: 'رابطہ شامل کریں',
    noContacts: 'ابھی تک کوئی ہنگامی رابطہ شامل نہیں کیا گیا', noContactsDesc: 'وہ رابطے شامل کریں جنہیں ہنگامی صورت میں الرٹ کیا جائے گا',
    nameLabel: 'نام', phoneLabel: 'فون نمبر', emailLabel: 'ای میل', emailOptional: 'ای میل (اختیاری)',
    saveContact: 'رابطہ محفوظ کریں', cancel: 'منسوخ کریں',
    nearbySafeZones: 'قریبی محفوظ زونز', allFilter: 'سب', policeStation: 'پولیس اسٹیشن',
    hospital: 'ہسپتال', fireStation: 'فائر اسٹیشن', shelter: 'پناہ گاہ',
    noSafeZones: 'کوئی قریبی محفوظ زون نہیں ملا', getDirections: 'راستہ دیکھیں',
    safeWalkingRoute: 'سب سے محفوظ پیدل راستہ', openInMaps: 'میپس ایپ میں کھولیں',
    navigateSafely: 'اس مقام پر محفوظ طریقے سے جائیں',
    walkingRouteNote: 'پیدل راستہ ہائی ویز سے بچتا ہے · فٹ پاتھ پر رہتا ہے', away: 'دور',
    deadMansSwitch: 'ڈیڈ مین سوئچ', deadMansSwitchDesc: 'اگر چیک ان نہ کریں تو خودکار SOS',
    inactive: 'غیر فعال', active: 'فعال', warning: 'انتباہ', sosSent: 'SOS بھیجا گیا',
    chooseTimer: 'ٹائمر چنیں', customMinutes: 'کسٹم منٹ...', activateSwitch: 'سوئچ فعال کریں',
    warningNote: 'SOS ٹرگر ہونے سے 60 سیکنڈ پہلے انتباہ',
    imSafe: 'میں محفوظ ہوں', sendSOSNow: 'ابھی SOS بھیجیں', stop: 'رکیں', resetSwitch: 'سوئچ ری سیٹ کریں',
    emergencyAlertSentDMS: 'ہنگامی الرٹ بھیجا گیا!', contactsNotified: 'آپ کے قابل اعتماد رابطوں کو مطلع کیا گیا',
    locationShared: 'مقام شیئر کیا گیا', checkedInSafe: 'محفوظ طریقے سے چیک ان کیا',
    missedSOSTriggered: 'مس ہوا — SOS ٹرگر ہوا', checkInHistory: 'چیک-ان تاریخ',
    timerTooShort: 'کم از کم ٹائمر 1 منٹ ہے', remaining: 'باقی',
    dmsSwitchInfo: 'ٹائمر سیٹ کریں۔ ختم ہونے سے پہلے "میں محفوظ ہوں" ٹیپ نہ کرنے پر آپ کے رابطوں کو خودکار طریقے سے مطلع کیا جائے گا۔',
    offlineEmergencyMode: 'آف لائن ہنگامی موڈ', offlineEmergencyDesc: 'SMS انٹرنیٹ کے بغیر کام کرتا ہے۔ ڈیٹا واپس آنے پر خودکار بھیجتا ہے۔',
    online: 'آن لائن', offline: 'آف لائن', connectedInstant: 'منسلک - الرٹ فوری بھیجے جاتے ہیں',
    pendingLabel: 'زیر التواء', sendingLabel: 'بھیج رہے ہیں', sentLabel: 'بھیجا گیا',
    quickAlerts: 'فوری ہنگامی الرٹ', needHelp: 'مجھے مدد چاہیے!', beingFollowed: 'پیچھا کیا جا رہا ہے',
    medicalEmergency: 'طبی ہنگامی', inDanger: 'میں خطرے میں ہوں',
    customMessage: 'کسٹم پیغام', typeEmergencyMsg: 'ہنگامی پیغام ٹائپ کریں...',
    accessibilityTitle: 'قابل رسائی معاونت', accessibilityDesc: 'اپنی ضروریات کے مطابق ایپ کو کسٹمائز کریں',
    largeText: 'بڑا متن', largeTextDesc: 'فونٹ سائز 20٪ بڑھاتا ہے',
    highContrast: 'اعلی کنٹراسٹ', highContrastDesc: 'نمائش کے لیے رنگ کنٹراسٹ بڑھاتا ہے',
    largeButtons: 'بڑے بٹن', largeButtonsDesc: 'تمام بٹنوں کو بڑا اور آسانی سے ٹیپ کرنے کے قابل بناتا ہے',
    darkMode: 'ڈارک موڈ', darkModeDesc: 'کم روشنی میں آنکھوں کی تھکاوٹ کم کرتا ہے',
    reduceMotion: 'حرکت کم کریں', reduceMotionDesc: 'اینیمیشن اور ٹرانزیشن روکتا ہے',
    textSpacing: 'متن وقفہ', textSpacingDesc: 'حروف اور لائن وقفہ بڑھاتا ہے',
    focusIndicators: 'فوکس اشارے', focusIndicatorsDesc: 'فوکس شدہ عناصر پر نارنجی خاکہ دکھاتا ہے',
    voiceAnnouncements: 'آواز اعلانات', voiceAnnouncementsDesc: 'ترتیبات بدلنے پر بولتا ہے',
    resetAccessibility: 'تمام قابل رسائی ترتیبات ری سیٹ کریں',
    accessibilityPreview: 'پیش نظارہ', accessibilityPreviewText: 'AI Guardian آپ کو محفوظ رکھتا ہے',
    accessibilityPreviewSub: 'آپ کا ذہین حفاظتی ساتھی',
    noSettingsActive: 'کوئی ترتیب فعال نہیں۔ اپنا تجربہ کسٹمائز کرنے کے لیے اوپر کوئی آپشن آن کریں۔',
    activeCount: 'فعال',
    trustedCircleTitle: 'قابل اعتماد حلقہ', trustedCircleDesc: 'اپنے قابل اعتماد رابطوں کے ساتھ لائیو مقام شیئرنگ',
    trustedChatTitle: 'قابل اعتماد چیٹ', allContacts: 'سب',
    selectContacts: 'مقام شیئر کرنے کے لیے رابطے منتخب کریں',
    startLiveLocation: 'لائیو مقام شیئرنگ شروع کریں',
    howTrustedCircleWorks: 'قابل اعتماد حلقہ کیسے کام کرتا ہے',
  },

  ta: {
    appName: 'ஷீகார்டியன்', appTagline: 'உங்கள் தனிப்பட்ட பாதுகாப்பு கவசம்', version: 'v2.0 புரோ',
    loading: 'ஷீகார்டியன் ஏற்றப்படுகிறது...', signOut: 'வெளியேறு', signIn: 'உள்நுழை', signUp: 'பதிவு செய்',
    home: 'முகப்பு', aiChat: 'AI அரட்டை', safety: 'பாதுகாப்பு', tools: 'கருவிகள்', chat: 'அரட்டை', settings: 'அமைப்புகள்',
    chooseLanguage: 'மொழி தேர்ந்தெடுக்கவும்', nightSafetyMode: 'இரவு பாதுகாப்பு முறை',
    nightSafetyModeActive: 'இரவு பாதுகாப்பு முறை செயலில் உள்ளது - விழிப்புடன் இருங்கள்',
    on: 'ஆன்', off: 'ஆஃப்', emergencyAlertSent: 'அவசர எச்சரிக்கை அனுப்பப்பட்டது!',
    emergencyAlertDesc: 'உங்கள் நம்பகமான தொடர்புகளுக்கு உங்கள் இருப்பிடத்துடன் அறிவிக்கப்பட்டது.',
    emergencySOS: 'அவசர SOS', emergencySOSDesc: 'உங்கள் நம்பகமான தொடர்புகளை உடனடியாக எச்சரிக்க தட்டவும்',
    aiThreatMonitor: 'AI அச்சுறுத்தல் கண்காணிப்பு', alertHistory: 'எச்சரிக்கை வரலாறு',
    safetyNetwork: 'பாதுகாப்பு வலையமைப்பு', safetyNetworkDesc: 'உங்கள் நம்பகமான வட்டம் மற்றும் பாதுகாப்பான மண்டலங்களை நிர்வகிக்கவும்',
    liveSafetyHeatmap: 'நேரடி பாதுகாப்பு வெப்பவரைபடம்', heatmapDesc: 'உங்கள் பகுதியில் நிகழ்நேர சம்பவ தரவு',
    safetyTools: 'பாதுகாப்பு கருவிகள்', safetyToolsDesc: 'உங்களை பாதுகாக்க மேம்பட்ட கருவிகள்',
    trustedChat: 'நம்பகமான அரட்டை', trustedChatDesc: 'உங்கள் நம்பகமான வட்டத்துடன் மறைகுறியாக்கப்பட்ட செய்திகள்',
    settingsTitle: 'அமைப்புகள்', settingsDesc: 'உங்கள் ஷீகார்டியன் அனுபவத்தை தனிப்பயனாக்கவும்',
    aiAssistantTitle: 'AI பாதுகாப்பு உதவியாளர்', aiAssistantSubtitle: 'உடனடி பாதுகாப்பு ஆலோசனை பெறுங்கள்',
    aiAssistantStatus: 'எப்போதும் ஆன்லைன் • உதவ இங்கே', aiAssistantPlaceholder: 'பாதுகாப்பு பற்றி எதையும் கேளுங்கள்...',
    fakeCall: 'போலி அழைப்பு',
    quickPrompt1: 'எனக்கு இப்போது பாதுகாப்பற்றதாக உணர்கிறேன்', quickPrompt2: 'யாரோ என்னை பின்தொடர்கிறார்கள்',
    quickPrompt3: 'இரவில் தனியாக நடக்கிறேன்', quickPrompt4: 'போலி அழைப்பை தூண்டவும்',
    quickPrompt5: 'ஆபத்திலிருந்து எப்படி தப்பிக்கலாம்?', quickPrompt6: 'என் இருப்பிடத்தை பகிரவும்',
    emergencyContacts: 'அவசர தொடர்புகள்', addContact: 'தொடர்பு சேர்க்கவும்',
    noContacts: 'இன்னும் அவசர தொடர்புகள் சேர்க்கப்படவில்லை', noContactsDesc: 'அவசரகாலத்தில் எச்சரிக்கப்படும் தொடர்புகளை சேர்க்கவும்',
    nameLabel: 'பெயர்', phoneLabel: 'தொலைபேசி எண்', emailLabel: 'மின்னஞ்சல்', emailOptional: 'மின்னஞ்சல் (விருப்பம்)',
    saveContact: 'தொடர்பை சேமிக்கவும்', cancel: 'ரத்து செய்',
    nearbySafeZones: 'அருகிலுள்ள பாதுகாப்பான மண்டலங்கள்', allFilter: 'அனைத்தும்', policeStation: 'காவல் நிலையம்',
    hospital: 'மருத்துவமனை', fireStation: 'தீயணைப்பு நிலையம்', shelter: 'தங்குமிடம்',
    noSafeZones: 'அருகில் பாதுகாப்பான மண்டலங்கள் கிடைக்கவில்லை', getDirections: 'வழிகாட்டுதல் பெறவும்',
    safeWalkingRoute: 'பாதுகாப்பான நடைப்பாதை', openInMaps: 'வரைபட பயன்பாட்டில் திறக்கவும்',
    navigateSafely: 'இந்த இடத்திற்கு பாதுகாப்பாக செல்லவும்',
    walkingRouteNote: 'நடைப்பாதை நெடுஞ்சாலைகளை தவிர்க்கிறது', away: 'தூரம்',
    deadMansSwitch: 'டெட் மேன்ஸ் சுவிட்ச்', deadMansSwitchDesc: 'செக் இன் செய்யாவிட்டால் தானியங்கு SOS',
    inactive: 'செயலற்று', active: 'செயலில்', warning: 'எச்சரிக்கை', sosSent: 'SOS அனுப்பப்பட்டது',
    chooseTimer: 'டைமர் தேர்வு', customMinutes: 'தனிப்பயன் நிமிடங்கள்...', activateSwitch: 'சுவிட்சை செயல்படுத்து',
    warningNote: 'SOS தூண்டப்படுவதற்கு 60 வினாடிகள் முன் எச்சரிக்கை',
    imSafe: 'நான் பாதுகாப்பாக இருக்கிறேன்', sendSOSNow: 'இப்போது SOS அனுப்பவும்', stop: 'நிறுத்து', resetSwitch: 'சுவிட்சை மீட்டமைக்கவும்',
    emergencyAlertSentDMS: 'அவசர எச்சரிக்கை அனுப்பப்பட்டது!', contactsNotified: 'உங்கள் நம்பகமான தொடர்புகளுக்கு தெரிவிக்கப்பட்டது',
    locationShared: 'இருப்பிடம் பகிரப்பட்டது', checkedInSafe: 'பாதுகாப்பாக செக் இன் செய்யப்பட்டது',
    missedSOSTriggered: 'தவறவிட்டது — SOS தூண்டப்பட்டது', checkInHistory: 'செக்-இன் வரலாறு',
    timerTooShort: 'குறைந்தபட்ச டைமர் 1 நிமிடம்', remaining: 'மீதமுள்ளது',
    dmsSwitchInfo: 'டைமர் அமைக்கவும். முடிவதற்கு முன் "நான் பாதுகாப்பாக இருக்கிறேன்" தட்டாவிட்டால், உங்கள் தொடர்புகளுக்கு தானாக தெரிவிக்கப்படும்.',
    offlineEmergencyMode: 'ஆஃப்லைன் அவசர முறை', offlineEmergencyDesc: 'SMS இணையம் இல்லாமல் வேலை செய்கிறது.',
    online: 'ஆன்லைன்', offline: 'ஆஃப்லைன்', connectedInstant: 'இணைக்கப்பட்டது - எச்சரிக்கைகள் உடனே அனுப்பப்படுகின்றன',
    pendingLabel: 'நிலுவையில்', sendingLabel: 'அனுப்புகிறது', sentLabel: 'அனுப்பப்பட்டது',
    quickAlerts: 'விரைவான அவசர எச்சரிக்கைகள்', needHelp: 'எனக்கு உதவி வேண்டும்!', beingFollowed: 'பின்தொடரப்படுகிறேன்',
    medicalEmergency: 'மருத்துவ அவசரம்', inDanger: 'நான் ஆபத்தில் இருக்கிறேன்',
    customMessage: 'தனிப்பயன் செய்தி', typeEmergencyMsg: 'அவசர செய்தி தட்டச்சு செய்யவும்...',
    accessibilityTitle: 'அணுகல் ஆதரவு', accessibilityDesc: 'உங்கள் தேவைகளுக்கு பயன்பாட்டை தனிப்பயனாக்கவும்',
    largeText: 'பெரிய உரை', largeTextDesc: 'எழுத்துரு அளவை 20% அதிகரிக்கிறது',
    highContrast: 'அதிக மாறுபாடு', highContrastDesc: 'தெரிவுநிலைக்கு வண்ண மாறுபாட்டை அதிகரிக்கிறது',
    largeButtons: 'பெரிய பொத்தான்கள்', largeButtonsDesc: 'அனைத்து பொத்தான்களையும் பெரியதாக்குகிறது',
    darkMode: 'இருண்ட முறை', darkModeDesc: 'குறைந்த வெளிச்சத்தில் கண் அழுத்தத்தை குறைக்கிறது',
    reduceMotion: 'இயக்கம் குறைக்கவும்', reduceMotionDesc: 'அனிமேஷன்களை நிறுத்துகிறது',
    textSpacing: 'உரை இடைவெளி', textSpacingDesc: 'எழுத்து மற்றும் வரி இடைவெளியை அதிகரிக்கிறது',
    focusIndicators: 'கவனம் குறிகாட்டிகள்', focusIndicatorsDesc: 'கவனம் செலுத்திய உறுப்புகளில் ஆரஞ்சு வரை காட்டுகிறது',
    voiceAnnouncements: 'குரல் அறிவிப்புகள்', voiceAnnouncementsDesc: 'அமைப்புகள் மாறும்போது சத்தமாக படிக்கிறது',
    resetAccessibility: 'அனைத்து அணுகல் அமைப்புகளையும் மீட்டமைக்கவும்',
    accessibilityPreview: 'முன்னோட்டம்', accessibilityPreviewText: 'AI Guardian உங்களை பாதுகாப்பாக வைக்கிறது',
    accessibilityPreviewSub: 'உங்கள் ஸ்மார்ட் பாதுகாப்பு தோழர்',
    noSettingsActive: 'எந்த அமைப்பும் செயலில் இல்லை. மேலே ஏதாவது மாற்றவும்.',
    activeCount: 'செயலில்',
    trustedCircleTitle: 'நம்பகமான வட்டம்', trustedCircleDesc: 'உங்கள் நம்பகமான தொடர்புகளுடன் நேரடி இருப்பிட பகிர்வு',
    trustedChatTitle: 'நம்பகமான அரட்டை', allContacts: 'அனைத்தும்',
    selectContacts: 'இருப்பிடம் பகிர தொடர்புகளை தேர்ந்தெடுக்கவும்',
    startLiveLocation: 'நேரடி இருப்பிட பகிர்வை தொடங்கவும்',
    howTrustedCircleWorks: 'நம்பகமான வட்டம் எவ்வாறு செயல்படுகிறது',
  },

  gu: {
    appName: 'શીગાર્ડિયન', appTagline: 'તમારી વ્યક્તિગત સુરક્ષા ઢાલ', version: 'v2.0 પ્રો',
    loading: 'શીગાર્ડિયન લોડ થઈ રહ્યું છે...', signOut: 'સાઇન આઉટ', signIn: 'સાઇન ઇન', signUp: 'સાઇન અપ',
    home: 'હોમ', aiChat: 'AI ચેટ', safety: 'સુરક્ષા', tools: 'સાધનો', chat: 'ચેટ', settings: 'સેટિંગ્સ',
    chooseLanguage: 'ભાષા પસંદ કરો', nightSafetyMode: 'રાત્રિ સુરક્ષા મોડ',
    nightSafetyModeActive: 'રાત્રિ સુરક્ષા મોડ સક્રિય - સજાગ રહો, મદદ એક ટૅપ દૂર છે',
    on: 'ચાલુ', off: 'બંધ', emergencyAlertSent: 'કટોકટી ચેતવણી મોકલાઈ!',
    emergencyAlertDesc: 'તમારા વિશ્વસનીય સંપર્કોને તમારા સ્થાન સાથે સૂચિત કરવામાં આવ્યા છે.',
    emergencySOS: 'કટોકટી SOS', emergencySOSDesc: 'તમારા વિશ્વસનીય સંપર્કોને તરત જ સૂચિત કરવા ટૅપ કરો',
    aiThreatMonitor: 'AI ખતરો મોનિટર', alertHistory: 'ચેતવણી ઇતિહાસ',
    safetyNetwork: 'સુરક્ષા નેટવર્ક', safetyNetworkDesc: 'તમારા વિશ્વસનીય વર્તુળ અને સુરક્ષિત ઝોન્સ મેનેજ કરો',
    liveSafetyHeatmap: 'લાઇવ સેફ્ટી હીટમેપ', heatmapDesc: 'તમારા વિસ્તારમાં રીઅલ-ટાઇમ ઘટના ડેટા',
    safetyTools: 'સુરક્ષા સાધનો', safetyToolsDesc: 'તમારી સુરક્ષા માટે અદ્યતન સાધનો',
    trustedChat: 'વિશ્વસનીય ચેટ', trustedChatDesc: 'તમારા વિશ્વસનીય વર્તુળ સાથે એન્ક્રિપ્ટેડ સંદેશ',
    settingsTitle: 'સેટિંગ્સ', settingsDesc: 'તમારો શીગાર્ડિયન અનુભવ કસ્ટમાઇઝ કરો',
    aiAssistantTitle: 'AI સુરક્ષા સહાયક', aiAssistantSubtitle: 'તાત્કાલિક સુરક્ષા સલાહ મેળવો, નકલી કૉલ કરો',
    aiAssistantStatus: 'હંમેશા ઓનલાઇન • મદદ માટે અહીં', aiAssistantPlaceholder: 'સુરક્ષા વિશે કંઈ પણ પૂછો...',
    fakeCall: 'નકલી કૉલ',
    quickPrompt1: 'મને અત્યારે અસુરક્ષિત લાગે છે', quickPrompt2: 'કોઈ મારો પીછો કરી રહ્યું છે',
    quickPrompt3: 'રાત્રે એકલા ચાલી રહ્યો/રહી છું', quickPrompt4: 'નકલી કૉલ કરો',
    quickPrompt5: 'ખતરામાંથી કેવી રીતે બચવું?', quickPrompt6: 'મારું સ્થાન શેર કરો',
    emergencyContacts: 'કટોકટી સંપર્કો', addContact: 'સંપર્ક ઉમેરો',
    noContacts: 'હજી સુધી કોઈ કટોકટી સંપર્ક ઉમેર્યા નથી', noContactsDesc: 'એ સંપર્કો ઉમેરો જેમને કટોકટીમાં ચેતવવામાં આવશે',
    nameLabel: 'નામ', phoneLabel: 'ફોન નંબર', emailLabel: 'ઇમેઇલ', emailOptional: 'ઇમેઇલ (વૈકલ્પિક)',
    saveContact: 'સંપર્ક સાચવો', cancel: 'રદ કરો',
    nearbySafeZones: 'નજીકના સુરક્ષિત ઝોન', allFilter: 'બધા', policeStation: 'પોલીસ સ્ટેશન',
    hospital: 'હોસ્પિટલ', fireStation: 'ફાયર સ્ટેશન', shelter: 'આશ્રય',
    noSafeZones: 'કોઈ નજીકના સુરક્ષિત ઝોન મળ્યા નથી', getDirections: 'દિશાઓ મેળવો',
    safeWalkingRoute: 'સૌથી સુરક્ષિત ચાલવાનો રસ્તો', openInMaps: 'મેપ્સ એપ્પમાં ખોલો',
    navigateSafely: 'આ સ્થાન પર સુરક્ષિત રીતે નેવિગેટ કરો',
    walkingRouteNote: 'ચાલવાનો રસ્તો હાઇવે ટાળે છે · ફૂટપાથ પર રહે છે', away: 'દૂર',
    deadMansSwitch: 'ડેડ મેન્સ સ્વિચ', deadMansSwitchDesc: 'ચેક ઇન ન કરો તો આપોઆપ SOS',
    inactive: 'નિષ્ક્રિય', active: 'સક્રિય', warning: 'ચેતવણી', sosSent: 'SOS મોકલ્યો',
    chooseTimer: 'ટાઇમર પસંદ કરો', customMinutes: 'કસ્ટમ મિનિટ...', activateSwitch: 'સ્વિચ સક્રિય કરો',
    warningNote: 'SOS ટ્રિગર થવાના 60 સેકન્ડ પહેલા ચેતવણી',
    imSafe: 'હું સુરક્ષિત છું', sendSOSNow: 'અત્યારે SOS મોકલો', stop: 'રોકો', resetSwitch: 'સ્વિચ રીસેટ કરો',
    emergencyAlertSentDMS: 'કટોકટી ચેતવણી મોકલાઈ!', contactsNotified: 'તમારા વિશ્વસનીય સંપર્કોને સૂચિત કર્યા',
    locationShared: 'સ્થાન શેર કર્યું', checkedInSafe: 'સુરક્ષિત રીતે ચેક ઇન કર્યું',
    missedSOSTriggered: 'ચૂકી ગયા — SOS ટ્રિગર થયો', checkInHistory: 'ચેક-ઇન ઇતિહાસ',
    timerTooShort: 'ન્યૂનતમ ટાઇમર 1 મિનિટ છે', remaining: 'બાકી',
    dmsSwitchInfo: 'ટાઇમર સેટ કરો. સમાપ્ત થાય તે પહેલા "હું સુરક્ષિત છું" ટૅપ ન કરો તો સંપર્કોને આપોઆપ સૂચિત કરવામાં આવશે.',
    offlineEmergencyMode: 'ઓફલાઇન ઇમર્જન્સી મોડ', offlineEmergencyDesc: 'SMS ઇન્ટરનેટ વગર કામ કરે છે. ડેટા પાછો આવે ત્યારે આપોઆપ મોકલે છે.',
    online: 'ઓનલાઇન', offline: 'ઓફલાઇન', connectedInstant: 'કનેક્ટ - ચેતવણીઓ તરત મોકલાય છે',
    pendingLabel: 'પ્રલંબિત', sendingLabel: 'મોકલી રહ્યા છીએ', sentLabel: 'મોકલ્યું',
    quickAlerts: 'ઝડપી ઇમર્જન્સી ચેતવણીઓ', needHelp: 'મને મદદ જોઈએ છે!', beingFollowed: 'પીછો કરવામાં આવી રહ્યો છે',
    medicalEmergency: 'તબીબી ઇમર્જન્સી', inDanger: 'હું ખતરામાં છું',
    customMessage: 'કસ્ટમ સંદેશ', typeEmergencyMsg: 'ઇમર્જન્સી સંદેશ ટાઇપ કરો...',
    accessibilityTitle: 'ઍક્સેસિબિલિટી સહાય', accessibilityDesc: 'તમારી જરૂરિયાતો અનુસાર એપ કસ્ટમાઇઝ કરો',
    largeText: 'મોટો ટેક્સ્ટ', largeTextDesc: 'ફોન્ટ કદ 20% વધારે છે',
    highContrast: 'ઉચ્ચ કોન્ટ્રાસ્ટ', highContrastDesc: 'દૃશ્યતા માટે રંગ કોન્ટ્રાસ્ટ વધારે છે',
    largeButtons: 'મોટા બટન', largeButtonsDesc: 'બધા બટન મોટા અને ટૅપ કરવામાં સહેલા બનાવે છે',
    darkMode: 'ડાર્ક મોડ', darkModeDesc: 'ઓછા પ્રકાશમાં આંખોનો તણાવ ઘટાડે છે',
    reduceMotion: 'ગતિ ઘટાડો', reduceMotionDesc: 'એનિમેશન અને ટ્રાન્ઝિશન બંધ કરે છે',
    textSpacing: 'ટેક્સ્ટ અંતર', textSpacingDesc: 'અક્ષર અને લાઇન અંતર વધારે છે',
    focusIndicators: 'ફોકસ સૂચકો', focusIndicatorsDesc: 'ફોકસ કરેલ ઘટકો પર નારંગી રૂપરેખા દર્શાવે છે',
    voiceAnnouncements: 'વૉઇસ ઘોષણાઓ', voiceAnnouncementsDesc: 'સેટિંગ્સ બદલાય ત્યારે બોલે છે',
    resetAccessibility: 'બધી ઍક્સેસિબિલિટી સેટિંગ્સ રીસેટ કરો',
    accessibilityPreview: 'પૂર્વાવલોકન', accessibilityPreviewText: 'AI Guardian તમને સુરક્ષિત રાખે છે',
    accessibilityPreviewSub: 'તમારો સ્માર્ટ સુરક્ષા સાથી',
    noSettingsActive: 'કોઈ સેટિંગ સક્રિય નથી. ઉપર કોઈ વિકલ્પ ચાલુ કરો.',
    activeCount: 'સક્રિય',
    trustedCircleTitle: 'વિશ્વસનીય વર્તુળ', trustedCircleDesc: 'તમારા વિશ્વસનીય સંપર્કો સાથે લાઇવ સ્થાન શેરિંગ',
    trustedChatTitle: 'વિશ્વસનીય ચેટ', allContacts: 'બધા',
    selectContacts: 'સ્થાન શેર કરવા સંપર્કો પસંદ કરો',
    startLiveLocation: 'લાઇવ સ્થાન શેરિંગ શરૂ કરો',
    howTrustedCircleWorks: 'વિશ્વસનીય વર્તુળ કેવી રીતે કાર્ય કરે છે',
  },

  sa: {
    appName: 'शीगार्डियन', appTagline: 'भवत्याः व्यक्तिगतं सुरक्षाकवचम्', version: 'v2.0 प्रो',
    loading: 'शीगार्डियन लोड्यते...', signOut: 'निर्गच्छतु', signIn: 'प्रविशतु', signUp: 'नाम लिखतु',
    home: 'मुखपृष्ठम्', aiChat: 'AI संवादः', safety: 'सुरक्षा', tools: 'उपकरणानि', chat: 'संवादः', settings: 'व्यवस्थाः',
    chooseLanguage: 'भाषां वरयतु', nightSafetyMode: 'रात्रि सुरक्षा विधानम्',
    nightSafetyModeActive: 'रात्रि सुरक्षा विधानं सक्रियम् - सावधानाः भवन्तु',
    on: 'सक्रियम्', off: 'निष्क्रियम्', emergencyAlertSent: 'आपत्कालीन सूचना प्रेषिता!',
    emergencyAlertDesc: 'भवतः विश्वस्तसंपर्काः स्थानसहितं सूचिताः।',
    emergencySOS: 'आपत्कालीन SOS', emergencySOSDesc: 'विश्वस्तसंपर्कान् तत्काल सूचयितुं स्पृशतु',
    aiThreatMonitor: 'AI भयसूचक', alertHistory: 'सूचना इतिहासः',
    safetyNetwork: 'सुरक्षा जालम्', safetyNetworkDesc: 'विश्वस्तमण्डलं सुरक्षितक्षेत्राणि च प्रबन्धयतु',
    liveSafetyHeatmap: 'सक्रिय सुरक्षा तापचित्रम्', heatmapDesc: 'भवतः क्षेत्रे वास्तविककाल-घटना-दत्तांशः',
    safetyTools: 'सुरक्षा उपकरणानि', safetyToolsDesc: 'रक्षणाय उन्नत उपकरणानि',
    trustedChat: 'विश्वस्त संवादः', trustedChatDesc: 'विश्वस्तमण्डलेन सह गूढ-संदेश-विनिमयः',
    settingsTitle: 'व्यवस्थाः', settingsDesc: 'शीगार्डियन अनुभवं स्वेच्छानुकूलयतु',
    aiAssistantTitle: 'AI सुरक्षा सहायकः', aiAssistantSubtitle: 'तत्काल सुरक्षा परामर्शं लभताम्',
    aiAssistantStatus: 'सर्वदा ऑनलाइन • सहाय्याय अत्र', aiAssistantPlaceholder: 'सुरक्षाविषये किमपि पृच्छतु...',
    fakeCall: 'कृत्रिम आह्वानम्',
    quickPrompt1: 'अहम् अधुना असुरक्षितः अनुभवामि', quickPrompt2: 'कोऽपि मम अनुसरणं करोति',
    quickPrompt3: 'रात्रौ एकाकी गच्छामि', quickPrompt4: 'कृत्रिम आह्वानं करोतु',
    quickPrompt5: 'भयात् कथं मुच्यते?', quickPrompt6: 'मम स्थानं साझां करोतु',
    emergencyContacts: 'आपत्कालीन संपर्काः', addContact: 'संपर्कं योजयतु',
    noContacts: 'आपत्कालीन संपर्काः न योजिताः', noContactsDesc: 'तान् संपर्कान् योजयतु ये आपत्काले सूचिताः भविष्यन्ति',
    nameLabel: 'नाम', phoneLabel: 'दूरभाष संख्या', emailLabel: 'विद्युत्पत्रम्', emailOptional: 'विद्युत्पत्रम् (ऐच्छिकम्)',
    saveContact: 'संपर्कं रक्षतु', cancel: 'रद्दं करोतु',
    nearbySafeZones: 'समीपस्थ सुरक्षितक्षेत्राणि', allFilter: 'सर्वे', policeStation: 'पुलिस केन्द्रम्',
    hospital: 'चिकित्सालयम्', fireStation: 'अग्निशमन केन्द्रम्', shelter: 'आश्रयः',
    noSafeZones: 'समीपे सुरक्षितक्षेत्राणि न लब्धानि', getDirections: 'मार्गदर्शनं लभताम्',
    safeWalkingRoute: 'सुरक्षिततमः पादचारी मार्गः', openInMaps: 'मानचित्र-अनुप्रयोगे उद्घाटयतु',
    navigateSafely: 'अस्मिन् स्थाने सुरक्षितरूपेण गन्तुम्',
    walkingRouteNote: 'पादचारी मार्गः राजमार्गान् वर्जयति', away: 'दूरे',
    deadMansSwitch: 'डेड मेन्स स्विच', deadMansSwitchDesc: 'चेक इन न कृते स्वयंचालित SOS',
    inactive: 'निष्क्रियम्', active: 'सक्रियम्', warning: 'सावधानम्', sosSent: 'SOS प्रेषितम्',
    chooseTimer: 'टाइमरं वरयतु', customMinutes: 'स्वेच्छा मिनटानि...', activateSwitch: 'स्विचं सक्रियं करोतु',
    warningNote: 'SOS ट्रिगर होण्यापूर्वी ६० सेकन्द सावधानम्',
    imSafe: 'अहं सुरक्षितः अस्मि', sendSOSNow: 'अधुना SOS प्रेषयतु', stop: 'स्थगयतु', resetSwitch: 'स्विचं पुनःस्थापयतु',
    emergencyAlertSentDMS: 'आपत्कालीन सूचना प्रेषिता!', contactsNotified: 'विश्वस्तसंपर्काः सूचिताः',
    locationShared: 'स्थानं साझां कृतम्', checkedInSafe: 'सुरक्षितरूपेण चेक इन कृतम्',
    missedSOSTriggered: 'विस्मृतम् — SOS ट्रिगर अभवत्', checkInHistory: 'चेक-इन इतिहासः',
    timerTooShort: 'न्यूनतम टाइमर १ मिनटम्', remaining: 'शेषम्',
    dmsSwitchInfo: 'टाइमरं स्थापयतु। समाप्तेः पूर्वं "अहं सुरक्षितः" न स्पृशेत् चेत् संपर्काः स्वयं सूचिताः भविष्यन्ति।',
    offlineEmergencyMode: 'ऑफलाइन आपत्कालीन विधानम्', offlineEmergencyDesc: 'SMS अन्तर्जालं विना कार्यं करोति।',
    online: 'ऑनलाइन', offline: 'ऑफलाइन', connectedInstant: 'संयुक्तम् - सूचनाः तत्काल प्रेष्यन्ते',
    pendingLabel: 'प्रतीक्षायाम्', sendingLabel: 'प्रेषयति', sentLabel: 'प्रेषितम्',
    quickAlerts: 'शीघ्र आपत्कालीन सूचनाः', needHelp: 'मह्यं साहाय्यम् आवश्यकम्!', beingFollowed: 'अनुसर्यते',
    medicalEmergency: 'चिकित्सा आपत्कालः', inDanger: 'अहं भये अस्मि',
    customMessage: 'स्वेच्छा संदेशः', typeEmergencyMsg: 'आपत्कालीन संदेशं लिखतु...',
    accessibilityTitle: 'सुलभता सहायता', accessibilityDesc: 'स्वावश्यकतानुसारम् अनुप्रयोगं अनुकूलयतु',
    largeText: 'बृहत् पाठः', largeTextDesc: 'अक्षरमापं २०% वर्धयति',
    highContrast: 'उच्च विषमता', highContrastDesc: 'दर्शनाय वर्णविषमतां वर्धयति',
    largeButtons: 'बृहत् बटनानि', largeButtonsDesc: 'सर्वाणि बटनानि बृहत् करोति',
    darkMode: 'तम विधानम्', darkModeDesc: 'अल्पप्रकाशे नेत्रपीडां न्यूनीकरोति',
    reduceMotion: 'गतिं न्यूनीकरोतु', reduceMotionDesc: 'एनिमेशनानि स्थगयति',
    textSpacing: 'पाठ अन्तरालः', textSpacingDesc: 'अक्षर-पंक्ति-अन्तरालं वर्धयति',
    focusIndicators: 'केन्द्रीकरण सूचकाः', focusIndicatorsDesc: 'केन्द्रीकृत घटकेषु नारंग रेखां दर्शयति',
    voiceAnnouncements: 'स्वर घोषणाः', voiceAnnouncementsDesc: 'व्यवस्था परिवर्तने उच्चैः पठति',
    resetAccessibility: 'सर्वाः सुलभता व्यवस्थाः पुनःस्थापयतु',
    accessibilityPreview: 'पूर्वावलोकनम्', accessibilityPreviewText: 'AI Guardian भवन्तं सुरक्षितं रक्षति',
    accessibilityPreviewSub: 'भवतः बुद्धिमान् सुरक्षा सहायकः',
    noSettingsActive: 'कापि व्यवस्था सक्रिया नास्ति। उपरि किमपि सक्रियं करोतु।',
    activeCount: 'सक्रियम्',
    trustedCircleTitle: 'विश्वस्त मण्डलम्', trustedCircleDesc: 'विश्वस्तसंपर्कैः सह सक्रिय स्थान-साझां',
    trustedChatTitle: 'विश्वस्त संवादः', allContacts: 'सर्वे',
    selectContacts: 'स्थानं साझां कर्तुं संपर्कान् वरयतु',
    startLiveLocation: 'सक्रिय स्थान-साझां प्रारभताम्',
    howTrustedCircleWorks: 'विश्वस्त मण्डलं कथं कार्यं करोति',
  },

  kn: {
    appName: 'ಶೀಗಾರ್ಡಿಯನ್', appTagline: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸುರಕ್ಷತೆಯ ಗುರಾಣಿ', version: 'v2.0 ಪ್ರೊ',
    loading: 'ಶೀಗಾರ್ಡಿಯನ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...', signOut: 'ಸೈನ್ ಔಟ್', signIn: 'ಸೈನ್ ಇನ್', signUp: 'ಸೈನ್ ಅಪ್',
    home: 'ಮುಖಪುಟ', aiChat: 'AI ಚಾಟ್', safety: 'ಸುರಕ್ಷತೆ', tools: 'ಸಾಧನಗಳು', chat: 'ಚಾಟ್', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    chooseLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ', nightSafetyMode: 'ರಾತ್ರಿ ಸುರಕ್ಷತಾ ಮೋಡ್',
    nightSafetyModeActive: 'ರಾತ್ರಿ ಸುರಕ್ಷತಾ ಮೋಡ್ ಸಕ್ರಿಯ - ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ',
    on: 'ಆನ್', off: 'ಆಫ್', emergencyAlertSent: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ!',
    emergencyAlertDesc: 'ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕಗಳಿಗೆ ನಿಮ್ಮ ಸ್ಥಳದೊಂದಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.',
    emergencySOS: 'ತುರ್ತು SOS', emergencySOSDesc: 'ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕಗಳನ್ನು ತಕ್ಷಣ ಎಚ್ಚರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    aiThreatMonitor: 'AI ಬೆದರಿಕೆ ಮಾನಿಟರ್', alertHistory: 'ಎಚ್ಚರಿಕೆ ಇತಿಹಾಸ',
    safetyNetwork: 'ಸುರಕ್ಷತಾ ನೆಟ್‌ವರ್ಕ್', safetyNetworkDesc: 'ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ವಲಯ ಮತ್ತು ಸುರಕ್ಷಿತ ವಲಯಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
    liveSafetyHeatmap: 'ಲೈವ್ ಸೇಫ್ಟಿ ಹೀಟ್‌ಮ್ಯಾಪ್', heatmapDesc: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನೈಜ-ಸಮಯದ ಘಟನಾ ಡೇಟಾ',
    safetyTools: 'ಸುರಕ್ಷತಾ ಸಾಧನಗಳು', safetyToolsDesc: 'ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸಲು ಸುಧಾರಿತ ಸಾಧನಗಳು',
    trustedChat: 'ವಿಶ್ವಾಸಾರ್ಹ ಚಾಟ್', trustedChatDesc: 'ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ವಲಯದೊಂದಿಗೆ ಎನ್‌ಕ್ರಿಪ್ಟೆಡ್ ಸಂದೇಶಗಳು',
    settingsTitle: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', settingsDesc: 'ನಿಮ್ಮ ಶೀಗಾರ್ಡಿಯನ್ ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ',
    aiAssistantTitle: 'AI ಸುರಕ್ಷತಾ ಸಹಾಯಕ', aiAssistantSubtitle: 'ತಕ್ಷಣ ಸುರಕ್ಷತಾ ಸಲಹೆ ಪಡೆಯಿರಿ',
    aiAssistantStatus: 'ಯಾವಾಗಲೂ ಆನ್‌ಲೈನ್ • ಸಹಾಯಕ್ಕೆ ಇಲ್ಲಿ', aiAssistantPlaceholder: 'ಸುರಕ್ಷತೆ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...',
    fakeCall: 'ನಕಲಿ ಕರೆ',
    quickPrompt1: 'ನನಗೆ ಈಗ ಅಸುರಕ್ಷಿತ ಭಾವನೆ ಆಗುತ್ತಿದೆ', quickPrompt2: 'ಯಾರೋ ನನ್ನನ್ನು ಹಿಂಬಾಲಿಸುತ್ತಿದ್ದಾರೆ',
    quickPrompt3: 'ರಾತ್ರಿ ಏಕಾಂಗಿಯಾಗಿ ನಡೆಯುತ್ತಿದ್ದೇನೆ', quickPrompt4: 'ನಕಲಿ ಕರೆ ಮಾಡಿ',
    quickPrompt5: 'ಅಪಾಯದಿಂದ ಹೇಗೆ ತಪ್ಪಿಸಿಕೊಳ್ಳಬೇಕು?', quickPrompt6: 'ನನ್ನ ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ',
    emergencyContacts: 'ತುರ್ತು ಸಂಪರ್ಕಗಳು', addContact: 'ಸಂಪರ್ಕ ಸೇರಿಸಿ',
    noContacts: 'ಇನ್ನೂ ತುರ್ತು ಸಂಪರ್ಕಗಳು ಸೇರಿಸಲಾಗಿಲ್ಲ', noContactsDesc: 'ತುರ್ತು ಸಮಯದಲ್ಲಿ ಎಚ್ಚರಿಸಲ್ಪಡುವ ಸಂಪರ್ಕಗಳನ್ನು ಸೇರಿಸಿ',
    nameLabel: 'ಹೆಸರು', phoneLabel: 'ಫೋನ್ ನಂಬರ್', emailLabel: 'ಇಮೇಲ್', emailOptional: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)',
    saveContact: 'ಸಂಪರ್ಕ ಉಳಿಸಿ', cancel: 'ರದ್ದುಮಾಡಿ',
    nearbySafeZones: 'ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ವಲಯಗಳು', allFilter: 'ಎಲ್ಲಾ', policeStation: 'ಪೊಲೀಸ್ ಠಾಣೆ',
    hospital: 'ಆಸ್ಪತ್ರೆ', fireStation: 'ಅಗ್ನಿಶಾಮಕ ಕೇಂದ್ರ', shelter: 'ಆಶ್ರಯ',
    noSafeZones: 'ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ವಲಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ', getDirections: 'ದಿಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ',
    safeWalkingRoute: 'ಸುರಕ್ಷಿತ ನಡಿಗೆ ಮಾರ್ಗ', openInMaps: 'ಮ್ಯಾಪ್ಸ್ ಆಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ',
    navigateSafely: 'ಈ ಸ್ಥಳಕ್ಕೆ ಸುರಕ್ಷಿತವಾಗಿ ಹೋಗಿ',
    walkingRouteNote: 'ನಡಿಗೆ ಮಾರ್ಗ ಹೆದ್ದಾರಿಗಳನ್ನು ತಪ್ಪಿಸುತ್ತದೆ', away: 'ದೂರ',
    deadMansSwitch: 'ಡೆಡ್ ಮ್ಯಾನ್ಸ್ ಸ್ವಿಚ್', deadMansSwitchDesc: 'ಚೆಕ್ ಇನ್ ಮಾಡದಿದ್ದರೆ ಸ್ವಯಂಚಾಲಿತ SOS',
    inactive: 'ನಿಷ್ಕ್ರಿಯ', active: 'ಸಕ್ರಿಯ', warning: 'ಎಚ್ಚರಿಕೆ', sosSent: 'SOS ಕಳುಹಿಸಲಾಗಿದೆ',
    chooseTimer: 'ಟೈಮರ್ ಆಯ್ಕೆಮಾಡಿ', customMinutes: 'ಕಸ್ಟಮ್ ನಿಮಿಷಗಳು...', activateSwitch: 'ಸ್ವಿಚ್ ಸಕ್ರಿಯಗೊಳಿಸಿ',
    warningNote: 'SOS ಪ್ರಚೋದಿಸಲ್ಪಡುವ 60 ಸೆಕೆಂಡ್ ಮೊದಲು ಎಚ್ಚರಿಕೆ',
    imSafe: 'ನಾನು ಸುರಕ್ಷಿತ', sendSOSNow: 'ಈಗ SOS ಕಳುಹಿಸಿ', stop: 'ನಿಲ್ಲಿಸಿ', resetSwitch: 'ಸ್ವಿಚ್ ರೀಸೆಟ್ ಮಾಡಿ',
    emergencyAlertSentDMS: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ!', contactsNotified: 'ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕಗಳಿಗೆ ತಿಳಿಸಲಾಗಿದೆ',
    locationShared: 'ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಲಾಗಿದೆ', checkedInSafe: 'ಸುರಕ್ಷಿತವಾಗಿ ಚೆಕ್ ಇನ್ ಮಾಡಲಾಗಿದೆ',
    missedSOSTriggered: 'ತಪ್ಪಿಸಿಕೊಂಡಿತು — SOS ಪ್ರಚೋದಿಸಲ್ಪಟ್ಟಿತು', checkInHistory: 'ಚೆಕ್-ಇನ್ ಇತಿಹಾಸ',
    timerTooShort: 'ಕನಿಷ್ಠ ಟೈಮರ್ 1 ನಿಮಿಷ', remaining: 'ಉಳಿದಿದೆ',
    dmsSwitchInfo: 'ಟೈಮರ್ ಹೊಂದಿಸಿ. ಮುಗಿಯುವ ಮೊದಲು "ನಾನು ಸುರಕ್ಷಿತ" ಟ್ಯಾಪ್ ಮಾಡದಿದ್ದರೆ ಸಂಪರ್ಕಗಳಿಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತಿಳಿಸಲಾಗುತ್ತದೆ.',
    offlineEmergencyMode: 'ಆಫ್‌ಲೈನ್ ತುರ್ತು ಮೋಡ್', offlineEmergencyDesc: 'SMS ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ.',
    online: 'ಆನ್‌ಲೈನ್', offline: 'ಆಫ್‌ಲೈನ್', connectedInstant: 'ಸಂಪರ್ಕಿಸಲಾಗಿದೆ - ಎಚ್ಚರಿಕೆಗಳು ತಕ್ಷಣ ಕಳುಹಿಸಲ್ಪಡುತ್ತವೆ',
    pendingLabel: 'ಬಾಕಿ', sendingLabel: 'ಕಳುಹಿಸುತ್ತಿದೆ', sentLabel: 'ಕಳುಹಿಸಲಾಗಿದೆ',
    quickAlerts: 'ತ್ವರಿತ ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು', needHelp: 'ನನಗೆ ಸಹಾಯ ಬೇಕು!', beingFollowed: 'ಹಿಂಬಾಲಿಸಲ್ಪಡುತ್ತಿದ್ದೇನೆ',
    medicalEmergency: 'ವೈದ್ಯಕೀಯ ತುರ್ತು', inDanger: 'ನಾನು ಅಪಾಯದಲ್ಲಿದ್ದೇನೆ',
    customMessage: 'ಕಸ್ಟಮ್ ಸಂದೇಶ', typeEmergencyMsg: 'ತುರ್ತು ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...',
    accessibilityTitle: 'ಪ್ರವೇಶಸಾಧ್ಯತೆ ಬೆಂಬಲ', accessibilityDesc: 'ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಆಪ್ ಕಸ್ಟಮೈಸ್ ಮಾಡಿ',
    largeText: 'ದೊಡ್ಡ ಪಠ್ಯ', largeTextDesc: 'ಅಕ್ಷರ ಗಾತ್ರವನ್ನು 20% ಹೆಚ್ಚಿಸುತ್ತದೆ',
    highContrast: 'ಹೆಚ್ಚಿನ ವ್ಯತ್ಯಾಸ', highContrastDesc: 'ದೃಶ್ಯಮಾನತೆಗೆ ಬಣ್ಣ ವ್ಯತ್ಯಾಸ ಹೆಚ್ಚಿಸುತ್ತದೆ',
    largeButtons: 'ದೊಡ್ಡ ಬಟನ್‌ಗಳು', largeButtonsDesc: 'ಎಲ್ಲಾ ಬಟನ್‌ಗಳನ್ನು ದೊಡ್ಡದಾಗಿ ಮಾಡುತ್ತದೆ',
    darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್', darkModeDesc: 'ಕಡಿಮೆ ಬೆಳಕಿನಲ್ಲಿ ಕಣ್ಣಿನ ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ',
    reduceMotion: 'ಚಲನೆ ಕಡಿಮೆ ಮಾಡಿ', reduceMotionDesc: 'ಅನಿಮೇಷನ್‌ಗಳನ್ನು ನಿಲ್ಲಿಸುತ್ತದೆ',
    textSpacing: 'ಪಠ್ಯ ಅಂತರ', textSpacingDesc: 'ಅಕ್ಷರ ಮತ್ತು ಸಾಲಿನ ಅಂತರ ಹೆಚ್ಚಿಸುತ್ತದೆ',
    focusIndicators: 'ಫೋಕಸ್ ಸೂಚಕಗಳು', focusIndicatorsDesc: 'ಫೋಕಸ್ ಮಾಡಿದ ಅಂಶಗಳ ಮೇಲೆ ಕಿತ್ತಳೆ ರೇಖೆ ತೋರಿಸುತ್ತದೆ',
    voiceAnnouncements: 'ವಾಯ್ಸ್ ಘೋಷಣೆಗಳು', voiceAnnouncementsDesc: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಬದಲಾದಾಗ ಗಟ್ಟಿಯಾಗಿ ಓದುತ್ತದೆ',
    resetAccessibility: 'ಎಲ್ಲಾ ಪ್ರವೇಶಸಾಧ್ಯತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ರೀಸೆಟ್ ಮಾಡಿ',
    accessibilityPreview: 'ಪೂರ್ವವೀಕ್ಷಣೆ', accessibilityPreviewText: 'AI Guardian ನಿಮ್ಮನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇಡುತ್ತದೆ',
    accessibilityPreviewSub: 'ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಸುರಕ್ಷತಾ ಸಹಾಯಕ',
    noSettingsActive: 'ಯಾವ ಸೆಟ್ಟಿಂಗ್ ಸಕ್ರಿಯವಾಗಿಲ್ಲ. ಮೇಲೆ ಯಾವುದಾದರೂ ಆಯ್ಕೆ ಮಾಡಿ.',
    activeCount: 'ಸಕ್ರಿಯ',
    trustedCircleTitle: 'ವಿಶ್ವಾಸಾರ್ಹ ವಲಯ', trustedCircleDesc: 'ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪರ್ಕಗಳೊಂದಿಗೆ ನೇರ ಸ್ಥಳ ಹಂಚಿಕೆ',
    trustedChatTitle: 'ವಿಶ್ವಾಸಾರ್ಹ ಚಾಟ್', allContacts: 'ಎಲ್ಲಾ',
    selectContacts: 'ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಲು ಸಂಪರ್ಕಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
    startLiveLocation: 'ಲೈವ್ ಸ್ಥಳ ಹಂಚಿಕೆ ಪ್ರಾರಂಭಿಸಿ',
    howTrustedCircleWorks: 'ವಿಶ್ವಾಸಾರ್ಹ ವಲಯ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
  },

  bn: {
    appName: 'শীগার্ডিয়ান', appTagline: 'আপনার ব্যক্তিগত নিরাপত্তা ঢাল', version: 'v2.0 প্রো',
    loading: 'শীগার্ডিয়ান লোড হচ্ছে...', signOut: 'সাইন আউট', signIn: 'সাইন ইন', signUp: 'সাইন আপ',
    home: 'হোম', aiChat: 'AI চ্যাট', safety: 'নিরাপত্তা', tools: 'সরঞ্জাম', chat: 'চ্যাট', settings: 'সেটিংস',
    chooseLanguage: 'ভাষা বেছে নিন', nightSafetyMode: 'রাত্রি নিরাপত্তা মোড',
    nightSafetyModeActive: 'রাত্রি নিরাপত্তা মোড সক্রিয় - সতর্ক থাকুন, সাহায্য এক ট্যাপ দূরে',
    on: 'চালু', off: 'বন্ধ', emergencyAlertSent: 'জরুরি সতর্কতা পাঠানো হয়েছে!',
    emergencyAlertDesc: 'আপনার বিশ্বস্ত যোগাযোগগুলিকে আপনার অবস্থান সহ জানানো হয়েছে।',
    emergencySOS: 'জরুরি SOS', emergencySOSDesc: 'আপনার বিশ্বস্ত যোগাযোগগুলিকে তাৎক্ষণিকভাবে সতর্ক করতে ট্যাপ করুন',
    aiThreatMonitor: 'AI হুমকি মনিটর', alertHistory: 'সতর্কতার ইতিহাস',
    safetyNetwork: 'নিরাপত্তা নেটওয়ার্ক', safetyNetworkDesc: 'আপনার বিশ্বস্ত বৃত্ত এবং নিরাপদ অঞ্চলগুলি পরিচালনা করুন',
    liveSafetyHeatmap: 'লাইভ সেফটি হিটম্যাপ', heatmapDesc: 'আপনার এলাকায় রিয়েল-টাইম ঘটনা তথ্য',
    safetyTools: 'নিরাপত্তা সরঞ্জাম', safetyToolsDesc: 'আপনাকে সুরক্ষিত রাখতে উন্নত সরঞ্জাম',
    trustedChat: 'বিশ্বস্ত চ্যাট', trustedChatDesc: 'আপনার বিশ্বস্ত বৃত্তের সাথে এনক্রিপ্টেড বার্তা',
    settingsTitle: 'সেটিংস', settingsDesc: 'আপনার শীগার্ডিয়ান অভিজ্ঞতা কাস্টমাইজ করুন',
    aiAssistantTitle: 'AI নিরাপত্তা সহকারী', aiAssistantSubtitle: 'তাৎক্ষণিক নিরাপত্তা পরামর্শ পান, ভুয়া কল করুন',
    aiAssistantStatus: 'সবসময় অনলাইন • সাহায্যের জন্য এখানে', aiAssistantPlaceholder: 'নিরাপত্তা সম্পর্কে যেকোনো কিছু জিজ্ঞেস করুন...',
    fakeCall: 'ভুয়া কল',
    quickPrompt1: 'আমি এখন অনিরাপদ বোধ করছি', quickPrompt2: 'কেউ আমাকে অনুসরণ করছে',
    quickPrompt3: 'রাতে একা হাঁটছি', quickPrompt4: 'ভুয়া কল করুন',
    quickPrompt5: 'বিপদ থেকে কীভাবে পালাবেন?', quickPrompt6: 'আমার অবস্থান শেয়ার করুন',
    emergencyContacts: 'জরুরি যোগাযোগ', addContact: 'যোগাযোগ যোগ করুন',
    noContacts: 'এখনও কোনো জরুরি যোগাযোগ যোগ করা হয়নি', noContactsDesc: 'এমন যোগাযোগ যোগ করুন যারা জরুরি অবস্থায় সতর্ক হবেন',
    nameLabel: 'নাম', phoneLabel: 'ফোন নম্বর', emailLabel: 'ইমেইল', emailOptional: 'ইমেইল (ঐচ্ছিক)',
    saveContact: 'যোগাযোগ সংরক্ষণ করুন', cancel: 'বাতিল করুন',
    nearbySafeZones: 'কাছের নিরাপদ অঞ্চল', allFilter: 'সব', policeStation: 'পুলিশ স্টেশন',
    hospital: 'হাসপাতাল', fireStation: 'দমকল কেন্দ্র', shelter: 'আশ্রয়',
    noSafeZones: 'কাছের কোনো নিরাপদ অঞ্চল পাওয়া যায়নি', getDirections: 'দিকনির্দেশনা পান',
    safeWalkingRoute: 'সবচেয়ে নিরাপদ হাঁটার পথ', openInMaps: 'ম্যাপস অ্যাপে খুলুন',
    navigateSafely: 'এই স্থানে নিরাপদে নেভিগেট করুন',
    walkingRouteNote: 'হাঁটার পথ হাইওয়ে এড়িয়ে চলে · ফুটপাথে থাকে', away: 'দূরে',
    deadMansSwitch: 'ডেড ম্যানস সুইচ', deadMansSwitchDesc: 'চেক ইন না করলে স্বয়ংক্রিয় SOS',
    inactive: 'নিষ্ক্রিয়', active: 'সক্রিয়', warning: 'সতর্কতা', sosSent: 'SOS পাঠানো হয়েছে',
    chooseTimer: 'টাইমার বেছে নিন', customMinutes: 'কাস্টম মিনিট...', activateSwitch: 'সুইচ সক্রিয় করুন',
    warningNote: 'SOS ট্রিগার হওয়ার ৬০ সেকেন্ড আগে সতর্কতা',
    imSafe: 'আমি নিরাপদ', sendSOSNow: 'এখনই SOS পাঠান', stop: 'থামুন', resetSwitch: 'সুইচ রিসেট করুন',
    emergencyAlertSentDMS: 'জরুরি সতর্কতা পাঠানো হয়েছে!', contactsNotified: 'আপনার বিশ্বস্ত যোগাযোগগুলিকে জানানো হয়েছে',
    locationShared: 'অবস্থান শেয়ার করা হয়েছে', checkedInSafe: 'নিরাপদে চেক ইন করা হয়েছে',
    missedSOSTriggered: 'মিস হয়েছে — SOS ট্রিগার হয়েছে', checkInHistory: 'চেক-ইন ইতিহাস',
    timerTooShort: 'সর্বনিম্ন টাইমার ১ মিনিট', remaining: 'বাকি',
    dmsSwitchInfo: 'টাইমার সেট করুন। শেষ হওয়ার আগে "আমি নিরাপদ" ট্যাপ না করলে যোগাযোগগুলিকে স্বয়ংক্রিয়ভাবে জানানো হবে।',
    offlineEmergencyMode: 'অফলাইন জরুরি মোড', offlineEmergencyDesc: 'SMS ইন্টারনেট ছাড়া কাজ করে। ডেটা ফিরলে স্বয়ংক্রিয়ভাবে পাঠায়।',
    online: 'অনলাইন', offline: 'অফলাইন', connectedInstant: 'সংযুক্ত - সতর্কতা তাৎক্ষণিক পাঠানো হয়',
    pendingLabel: 'অপেক্ষমাণ', sendingLabel: 'পাঠাচ্ছে', sentLabel: 'পাঠানো হয়েছে',
    quickAlerts: 'দ্রুত জরুরি সতর্কতা', needHelp: 'আমার সাহায্য দরকার!', beingFollowed: 'অনুসরণ করা হচ্ছে',
    medicalEmergency: 'চিকিৎসা জরুরি', inDanger: 'আমি বিপদে আছি',
    customMessage: 'কাস্টম বার্তা', typeEmergencyMsg: 'জরুরি বার্তা টাইপ করুন...',
    accessibilityTitle: 'অ্যাক্সেসিবিলিটি সহায়তা', accessibilityDesc: 'আপনার প্রয়োজন অনুযায়ী অ্যাপ কাস্টমাইজ করুন',
    largeText: 'বড় লেখা', largeTextDesc: 'ফন্ট আকার ২০% বাড়ায়',
    highContrast: 'উচ্চ বৈসাদৃশ্য', highContrastDesc: 'দৃশ্যমানতার জন্য রঙের বৈসাদৃশ্য বাড়ায়',
    largeButtons: 'বড় বোতাম', largeButtonsDesc: 'সব বোতাম বড় ও ট্যাপ করা সহজ করে',
    darkMode: 'ডার্ক মোড', darkModeDesc: 'কম আলোতে চোখের চাপ কমায়',
    reduceMotion: 'গতি কমান', reduceMotionDesc: 'অ্যানিমেশন ও ট্রানজিশন বন্ধ করে',
    textSpacing: 'লেখার ব্যবধান', textSpacingDesc: 'অক্ষর ও লাইনের ব্যবধান বাড়ায়',
    focusIndicators: 'ফোকাস নির্দেশক', focusIndicatorsDesc: 'ফোকাস করা উপাদানে কমলা রেখা দেখায়',
    voiceAnnouncements: 'ভয়েস ঘোষণা', voiceAnnouncementsDesc: 'সেটিংস পরিবর্তনে জোরে পড়ে',
    resetAccessibility: 'সব অ্যাক্সেসিবিলিটি সেটিংস রিসেট করুন',
    accessibilityPreview: 'প্রিভিউ', accessibilityPreviewText: 'AI Guardian আপনাকে নিরাপদ রাখে',
    accessibilityPreviewSub: 'আপনার স্মার্ট নিরাপত্তা সঙ্গী',
    noSettingsActive: 'কোনো সেটিং সক্রিয় নেই। উপরে যেকোনো বিকল্প চালু করুন।',
    activeCount: 'সক্রিয়',
    trustedCircleTitle: 'বিশ্বস্ত বৃত্ত', trustedCircleDesc: 'আপনার বিশ্বস্ত যোগাযোগগুলির সাথে লাইভ অবস্থান শেয়ারিং',
    trustedChatTitle: 'বিশ্বস্ত চ্যাট', allContacts: 'সব',
    selectContacts: 'অবস্থান শেয়ার করতে যোগাযোগ নির্বাচন করুন',
    startLiveLocation: 'লাইভ অবস্থান শেয়ারিং শুরু করুন',
    howTrustedCircleWorks: 'বিশ্বস্ত বৃত্ত কীভাবে কাজ করে',
  },
};

export default translations;
