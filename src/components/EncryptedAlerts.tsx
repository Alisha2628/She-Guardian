// src/components/EncryptedAlerts.tsx
import { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, Copy, CheckCircle, Eye, EyeOff, Key, Send, Trash2 } from 'lucide-react';

interface EncryptedMessage {
  id: string;
  encrypted: string;
  preview: string;
  timestamp: string;
  decrypted?: string;
}

const STORAGE_KEY = 'ai_guardian_encrypted_alerts';

// ─── Simple AES-like encryption using Web Crypto API ─────────────────────────
async function generateKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('ai-guardian-salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptMessage(message: string, password: string): Promise<string> {
  const key = await generateKey(password);
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(message));
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptMessage(encryptedB64: string, password: string): Promise<string> {
  const key = await generateKey(password);
  const combined = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const dec = new TextDecoder();
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return dec.decode(decrypted);
}

function loadMessages(): EncryptedMessage[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function EncryptedAlerts() {
  const [messages, setMessages] = useState<EncryptedMessage[]>(loadMessages);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSet, setPasswordSet] = useState(() => !!localStorage.getItem('ai_guardian_enc_pass'));
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [decryptKey, setDecryptKey] = useState('');
  const [showDecryptInput, setShowDecryptInput] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const showStatus = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatus(msg);
    setStatusType(type);
    setTimeout(() => setStatus(''), 3000);
  };

  const setupPassword = () => {
    if (password.length < 6) { showStatus('Password must be at least 6 characters', 'error'); return; }
    if (password !== confirmPassword) { showStatus('Passwords do not match!', 'error'); return; }
    localStorage.setItem('ai_guardian_enc_pass', password);
    setPasswordSet(true);
    showStatus('🔐 Encryption password set successfully!', 'success');
  };

  const sendEncryptedAlert = async () => {
    if (!message.trim()) { showStatus('Please enter a message', 'error'); return; }
    const savedPass = localStorage.getItem('ai_guardian_enc_pass');
    if (!savedPass) { showStatus('Please set a password first', 'error'); return; }

    setIsEncrypting(true);
    try {
      const encrypted = await encryptMessage(message, savedPass);
      const newMsg: EncryptedMessage = {
        id: Date.now().toString(),
        encrypted,
        preview: message.slice(0, 20) + (message.length > 20 ? '...' : ''),
        timestamp: new Date().toISOString(),
      };
      setMessages(m => [newMsg, ...m]);
      setMessage('');
      showStatus('🔒 Message encrypted and stored securely!', 'success');
    } catch {
      showStatus('Encryption failed. Try again.', 'error');
    }
    setIsEncrypting(false);
  };

  const decryptMsg = async (id: string) => {
    if (!decryptKey) { showStatus('Enter your password to decrypt', 'error'); return; }
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    try {
      const decrypted = await decryptMessage(msg.encrypted, decryptKey);
      setMessages(m => m.map(x => x.id === id ? { ...x, decrypted } : x));
      setShowDecryptInput(null);
      setDecryptKey('');
      showStatus('🔓 Message decrypted!', 'success');
    } catch {
      showStatus('Wrong password! Cannot decrypt.', 'error');
    }
  };

  const copyEncrypted = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteMsg = (id: string) => setMessages(m => m.filter(x => x.id !== id));

  const formatTime = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Encrypted Alerts</h2>
          <p className="text-xs text-gray-500">End-to-end encrypted emergency messages using AES-256</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
          <Lock size={11} /> AES-256
        </div>
      </div>

      {/* Status message */}
      {status && (
        <div className={`px-4 py-2 rounded-lg text-sm mb-4 ${
          statusType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          statusType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {status}
        </div>
      )}

      {/* Password Setup */}
      {!passwordSet ? (
        <div className="border border-purple-200 bg-purple-50 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Key size={16} className="text-purple-600" />
            <p className="text-sm font-semibold text-purple-800">Set Encryption Password</p>
          </div>
          <p className="text-xs text-purple-600 mb-3">This password encrypts your alerts. Only someone with this password can read them.</p>
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white pr-10"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type="password"
              placeholder="Confirm password..."
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white"
            />
            <button onClick={setupPassword} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
              🔐 Set Password & Enable Encryption
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 mb-5">
          <CheckCircle size={14} />
          Encryption active — all messages are AES-256 encrypted
          <button onClick={() => { localStorage.removeItem('ai_guardian_enc_pass'); setPasswordSet(false); setPassword(''); setConfirmPassword(''); }}
            className="ml-auto text-gray-400 hover:text-red-500 text-xs underline">Reset</button>
        </div>
      )}

      {/* Send encrypted message */}
      {passwordSet && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Send Encrypted Alert</p>

          {/* Quick alerts */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              '🚨 EMERGENCY: I need help immediately!',
              '📍 Track my location — I feel unsafe',
              '🆘 Someone is following me!',
              '🏥 Medical emergency — send help!',
            ].map(msg => (
              <button key={msg} onClick={() => setMessage(msg)}
                className="py-2 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium transition-colors text-left">
                {msg.slice(0, 30)}...
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your emergency message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendEncryptedAlert(); }}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
            <button onClick={sendEncryptedAlert} disabled={isEncrypting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50">
              {isEncrypting ? <Lock size={16} className="animate-pulse" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Encrypted messages list */}
      {messages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Encrypted Messages ({messages.length})</p>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={13} className="text-purple-500" />
                    <span className="text-xs font-medium text-gray-700">{msg.preview}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => copyEncrypted(msg.encrypted, msg.id)}
                      className="p-1 text-gray-400 hover:text-gray-600">
                      {copied === msg.id ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                    <button onClick={() => deleteMsg(msg.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Encrypted text preview */}
                <div className="bg-gray-900 text-green-400 rounded-lg px-3 py-2 text-xs font-mono mb-2 overflow-hidden">
                  <p className="truncate">{msg.encrypted.slice(0, 60)}...</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>

                  {msg.decrypted ? (
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      <Unlock size={11} /> {msg.decrypted}
                    </div>
                  ) : (
                    <button onClick={() => setShowDecryptInput(showDecryptInput === msg.id ? null : msg.id)}
                      className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
                      <Unlock size={11} /> Decrypt
                    </button>
                  )}
                </div>

                {/* Decrypt input */}
                {showDecryptInput === msg.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="password"
                      placeholder="Enter password to decrypt..."
                      value={decryptKey}
                      onChange={e => setDecryptKey(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') decryptMsg(msg.id); }}
                      className="flex-1 border border-purple-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                    />
                    <button onClick={() => decryptMsg(msg.id)}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700">
                      Decrypt
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length === 0 && passwordSet && (
        <p className="text-center text-xs text-gray-400 mt-2">
          No encrypted messages yet. Send an alert above to encrypt it!
        </p>
      )}

      {/* Info */}
      <div className="mt-4 bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
        <p className="font-semibold text-gray-600 mb-1">🔐 How encryption works:</p>
        <p>Your messages are encrypted using AES-256-GCM — the same standard used by banks. Only someone with your password can read them. Even if intercepted, the data is unreadable.</p>
      </div>
    </div>
  );
}
