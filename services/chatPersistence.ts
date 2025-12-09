import { supabase } from './supabaseClient';
import { Session, ChatMessage } from '../types';

export const chatPersistence = {
  // Load all sessions for a user
  async loadUserSessions(userId: string): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_modified', { ascending: false });

      if (error) {
        console.error('Error loading sessions:', error);
        return [];
      }

      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        messages: item.messages,
        lastModified: new Date(item.last_modified).getTime()
      }));

    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Save or Update a session
  async saveSession(userId: string, session: Session) {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .upsert({
          id: session.id,
          user_id: userId,
          title: session.title,
          messages: session.messages,
          last_modified: new Date(session.lastModified).toISOString()
        }, { onConflict: 'id' });

      if (error) console.error('Error saving session:', error);
    } catch (e) {
      console.error(e);
    }
  },

  // Delete a session
  async deleteSession(sessionId: string) {
    try {
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);
    } catch (e) {
      console.error(e);
    }
  }
};