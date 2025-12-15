import { supabase } from './supabaseClient';
import { generateSimpleContent } from './geminiService';

export const adminService = {
  // Admin Login
  async login(username: string, pass: string) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('pass', pass)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST205') {
            console.error("CRITICAL ERROR: Table 'admins' not found. Please run SQL.");
        }
        throw error;
      }
      return { success: !!data, admin: data };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error };
    }
  },

  // Get Dashboard Statistics
  async getStats() {
    try {
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { data: sessions } = await supabase.from('chat_sessions').select('messages, last_modified');

      let totalMessages = 0;
      let messagesToday = 0;
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      sessions?.forEach((session: any) => {
        const msgs = session.messages || [];
        totalMessages += msgs.length;
        msgs.forEach((m: any) => {
            if (m.timestamp && m.timestamp >= startOfDay) messagesToday++;
        });
      });

      return {
        usersCount: usersCount || 0,
        sessionsCount: sessions?.length || 0,
        totalMessages,
        messagesToday
      };
    } catch (error) {
      console.error('Stats error:', error);
      return { usersCount: 0, sessionsCount: 0, totalMessages: 0, messagesToday: 0 };
    }
  },

  // Get Users (Robust handling)
  async getUsers() {
    // Select all columns
    const { data, error } = await supabase.from('users').select('*');
    
    if (error) {
        console.error("Error fetching users:", error);
        return [];
    }

    // Sort manually in JS to avoid column name issues in SQL sorting if schemas differ
    return (data || []).sort((a, b) => {
        const dateA = new Date(a.signup_date || a.signup_Date || 0).getTime();
        const dateB = new Date(b.signup_date || b.signup_Date || 0).getTime();
        return dateB - dateA;
    });
  },

  // Delete User
  async deleteUser(userId: string) {
    try {
        const { error } = await supabase.from('users').delete().eq('user_id', userId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Delete user error:", error);
        return { success: false, error };
    }
  },

  // Get Sessions
  async getSessions() {
    const { data } = await supabase.from('chat_sessions').select('*').order('last_modified', { ascending: false });
    return data || [];
  },

  // AI Business Report
  async generateBusinessReport() {
    try {
        // Fetch last 50 user messages across all sessions
        const { data: sessions } = await supabase
            .from('chat_sessions')
            .select('messages')
            .order('last_modified', { ascending: false })
            .limit(20);

        let allUserTexts = "";
        sessions?.forEach((s: any) => {
            const userMsgs = (s.messages || [])
                .filter((m: any) => m.role === 'user')
                .map((m: any) => m.text)
                .join(" | ");
            allUserTexts += userMsgs + "\n";
        });

        if (!allUserTexts) return "داده‌ای برای تحلیل وجود ندارد.";

        const prompt = `
        تو یک تحلیلگر ارشد کسب و کار برای فروشگاه لوازم موتور "استار سیکلت" هستی.
        در زیر لیستی از پیام های اخیر کاربران آمده است.
        لطفا یک گزارش مدیریتی کوتاه و جذاب (به فارسی) تولید کن که شامل موارد زیر باشد:
        1. 📈 **ترندهای بازار:** کاربران بیشتر دنبال چه قطعاتی هستند؟ (کلاه، اگزوز، روغن...)
        2. 💰 **حساسیت قیمتی:** آیا دنبال جنس ارزان هستند یا لوکس؟
        3. 💡 **پیشنهاد برای تامین کالا:** چه چیزی در انبار شارژ کنیم بهتر فروش میرود؟
        
        لیست پیام ها:
        ${allUserTexts}
        `;

        return await generateSimpleContent(prompt);
    } catch (error) {
        return "خطا در تولید گزارش هوشمند.";
    }
  }
};