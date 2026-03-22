// src/components/TrustedChat.tsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  MessageCircle, Send, User, Users,
  Loader2, AlertCircle, CheckCheck, Clock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  guardian_user_id: string;
  sender_name: string;
  message: string;
  message_type: 'text' | 'media_alert';
  media_url?: string | null;
  created_at: string;
  read_at: string | null;
}

interface TrustedContact {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
}

interface TrustedChatProps {
  currentUserId: string;
  currentUserName: string;
  guardianUserId: string; // always the guardian's user.id
  trustedContacts?: TrustedContact[];
  isContactView?: boolean; // true when a trusted contact is viewing
}

export function TrustedChat({
  currentUserId,
  currentUserName,
  guardianUserId,
  trustedContacts = [],
  isContactView = false,
}: TrustedChatProps) {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<TrustedContact | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Shared room ID — always same for both users
  const roomId = selectedContact
    ? [currentUserId, selectedContact.id].sort().join('_')
    : isContactView
      ? [currentUserId, guardianUserId].sort().join('_')
      : guardianUserId;

  const loadMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .eq('guardian_user_id', roomId)
        .order('created_at', { ascending: true })
        .limit(200);

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Show all messages in the room — no filtering needed since roomId is unique per pair
  const filteredMessages = messages;

  useEffect(() => { loadMessages(); }, [roomId]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Mark unread messages as read when viewing
  useEffect(() => {
    if (!messages.length || !currentUserId) return;
    const unread = messages
      .filter((m) => m.sender_id !== currentUserId && !m.read_at)
      .map((m) => m.id);
    if (!unread.length) return;
    (supabase as any)
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unread)
      .then(() => {});
  }, [messages, currentUserId]);

  useEffect(() => {
    const channel = (supabase as any)
      .channel(`chat_room_${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `guardian_user_id=eq.${roomId}`,
      }, (payload: any) => {
        const msg = payload.new as ChatMessage;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const text = newMessage.trim();
    setNewMessage('');
    try {
      const { error } = await (supabase as any).from('chat_messages').insert({
        sender_id: currentUserId,
        recipient_id: isContactView ? guardianUserId : (selectedContact?.id || null),
        guardian_user_id: roomId,
        sender_name: currentUserName,
        message: text,
        message_type: 'text',
        created_at: new Date().toISOString(),
        read_at: null,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to send');
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const getTimeLabel = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString();
  };

  const isMe = (msg: ChatMessage) => msg.sender_id === currentUserId;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-purple-100/60" style={{ height: '640px' }}>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-violet-600 px-6 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">Trusted Chat</h2>
            <p className="text-purple-200 text-sm mt-0.5">
              {isContactView
                ? 'Chat with your guardian'
                : selectedContact
                  ? `Chatting with ${selectedContact.name}`
                  : 'All trusted contacts'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact selector — only shown to guardian, not contacts */}
      {!isContactView && trustedContacts.length > 0 && (
        <div className="flex gap-2 px-4 py-3 border-b border-purple-50 overflow-x-auto flex-shrink-0 bg-purple-50/40">
          <button
            onClick={() => setSelectedContact(null)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedContact === null ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Users size={12} /> All
          </button>
          {trustedContacts.map((c) => {
            const unreadCount = messages.filter(
              (m) => m.sender_name === c.name && m.sender_id !== currentUserId && !m.read_at
            ).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors relative ${
                  selectedContact?.id === c.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <User size={12} /> {c.name}
                {unreadCount > 0 && (
                  <span className="ml-1 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading messages...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {!loading && filteredMessages.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-base font-semibold text-gray-500">No messages yet</p>
            <p className="text-sm mt-2 text-gray-400">
              {isContactView
                ? 'Your guardian will message you here in an emergency'
                : 'Start chatting with your trusted contacts'}
            </p>
          </div>
        )}
        {filteredMessages.map((msg) => (
          <div key={msg.id} className={`flex ${isMe(msg) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-sm flex flex-col gap-1 ${isMe(msg) ? 'items-end' : 'items-start'}`}>
              {!isMe(msg) && (
                <span className="text-xs font-semibold text-purple-500 px-1 uppercase tracking-wide">{msg.sender_name}</span>
              )}
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMe(msg)
                  ? 'bg-purple-600 text-white rounded-br-sm shadow-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              } ${msg.message_type === 'media_alert' ? 'border-2 border-rose-400 bg-rose-50 text-gray-800' : ''}`}>
                {msg.message_type === 'media_alert' && (
                  <div className={`text-xs font-medium mb-1 ${isMe(msg) ? 'text-purple-200' : 'text-rose-500'}`}>
                    🚨 Auto-sent recording
                  </div>
                )}
                {msg.media_url && (
                  <a href={msg.media_url} target="_blank" rel="noreferrer"
                    className={`block text-xs underline mb-1 ${isMe(msg) ? 'text-purple-200' : 'text-blue-600'}`}>
                    View recording →
                  </a>
                )}
                {msg.message}
              </div>
              <div className={`flex items-center gap-1 text-xs text-gray-400 px-1 mt-0.5 ${isMe(msg) ? 'flex-row-reverse' : ''}`}>
                <Clock size={10} />
                {getTimeLabel(msg.created_at)}
                {isMe(msg) && msg.read_at && <CheckCheck size={12} className="text-purple-400" />}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-purple-50 flex-shrink-0 bg-white">
        {/* Quick emergency templates */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {["I'm in danger ", "Call me now ", "Come to me ", "I'm safe "].map((t) => (
            <button
              key={t}
              onClick={() => setNewMessage(t)}
              className="flex-shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-2 rounded-full border border-purple-200 transition-colors whitespace-nowrap"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isContactView
                ? 'Reply to your guardian...'
                : `Message ${selectedContact ? selectedContact.name : 'trusted contacts'}...`
            }
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 100) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md shadow-purple-300"
          >
            {sending
              ? <Loader2 size={16} className="text-white animate-spin" />
              : <Send size={16} className="text-white" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 px-1 text-center">⏎ Send · ⇧⏎ New line</p>
      </div>
    </div>
  );
}

// ─── Helper for SOSButton ─────────────────────────────────────────────────────
export async function sendMediaAlertToContacts({
  senderId,
  senderName,
  mediaUrl,
  mediaType,
}: {
  senderId: string;
  senderName: string;
  mediaUrl: string;
  mediaType: 'video' | 'audio';
}) {
  const { error } = await (supabase as any).from('chat_messages').insert({
    sender_id: senderId,
    recipient_id: null,
    guardian_user_id: senderId,
    sender_name: senderName,
    message: `A ${mediaType} recording was automatically captured and sent to you as a safety alert.`,
    message_type: 'media_alert',
    media_url: mediaUrl,
    created_at: new Date().toISOString(),
    read_at: null,
  });
  if (error) throw error;
}