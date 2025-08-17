import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
};

export const useContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching contact messages:', err);
      setError(err.message || 'Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  };

  const submitMessage = async (messageData: Omit<ContactMessage, 'id' | 'created_at' | 'read'>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('contact_messages')
        .insert([messageData])
        .select();

      if (error) throw error;

      return { success: true, data: data?.[0] };
    } catch (err: any) {
      console.error('Error submitting contact message:', err);
      setError(err.message || 'Failed to submit contact message');
      return { success: false, error: err.message };
    }
  };

  const markAsRead = async (messageId: string, isRead: boolean = true) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('contact_messages')
        .update({ read: isRead })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: isRead } : msg
        )
      );

      return { success: true };
    } catch (err: any) {
      console.error('Error updating message read status:', err);
      setError(err.message || 'Failed to update message status');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    submitMessage,
    markAsRead,
  };
};