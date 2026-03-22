// src/utils/chatUtils.ts
// Separated from TrustedChat.tsx to satisfy Vite Fast Refresh
// (component files must not export plain functions alongside components)
import { supabase } from '../lib/supabase';

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
