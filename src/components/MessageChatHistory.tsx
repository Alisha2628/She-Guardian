// src/components/MessageChatHistory.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Clock,
  Phone,
  Video,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Loader2,
  AlertCircle as AlertIcon,
} from 'lucide-react';

type Notification = {
  id: string;
  alert_id: string | null;
  user_id: string | null;
  contact_name: string | null;
  phone: string | null;
  message_text: string | null;
  video_url: string | null;
  sent_at: string | null;
  status: 'sent' | 'failed' | 'pending' | null;
};

console.log('Env vars in runtime:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  keyStart: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
});

export function MessageChatHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError('Please log in to view message history');
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('alert_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('sent_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        setNotifications(data || []);
      } catch (err: any) {
        console.error('Failed to load message history:', err);
        setError(err.message || 'Could not load sent messages');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel('alert_notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alert_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alert_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id ? { ...n, ...(payload.new as Notification) } : n
            )
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime notifications subscribed');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel closed/error:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const copyMessage = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Message copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-6 w-full max-w-3xl mx-auto mt-8">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-rose-600" size={40} />
          <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">
            Loading message history...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-6 w-full max-w-3xl mx-auto mt-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-5 py-6 rounded-xl text-center">
          <AlertIcon className="mx-auto mb-3" size={32} />
          <p className="font-medium text-lg">Error loading messages</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-6 w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
        <Phone className="text-rose-600" size={28} />
        Messages Sent to Emergency Contacts
      </h2>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <AlertTriangle className="mx-auto mb-4 opacity-70" size={48} />
          <p className="text-lg font-medium">No messages sent yet</p>
          <p className="text-sm mt-2">
            Trigger an SOS alert — messages sent to your contacts will appear here in real-time
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                notif.status === 'sent'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
                  : notif.status === 'failed'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    {notif.status === 'sent' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : notif.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    )}

                    <span className="font-medium text-gray-900 dark:text-white">
                      {notif.status === 'sent' ? 'Sent to' : 'Failed to send to'} {notif.contact_name || 'Contact'}
                    </span>

                    {notif.phone && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {notif.phone}
                      </span>
                    )}

                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto sm:ml-0">
                      {notif.sent_at
                        ? new Date(notif.sent_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Unknown time'}
                    </span>
                  </div>

                  <div className="text-sm bg-gray-100 dark:bg-gray-900 p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
                    {notif.message_text || '(No message content)'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 self-start sm:self-center">
                  {notif.video_url && (
                    <a
                      href={notif.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                    >
                      <Video size={18} />
                      View Video
                      <ExternalLink size={16} />
                    </a>
                  )}

                  <button
                    onClick={() => notif.message_text && copyMessage(notif.message_text)}
                    disabled={!notif.message_text}
                    className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-40"
                    title="Copy message text"
                  >
                    <Copy size={18} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function copyMessage(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Message copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy message');
  });
}