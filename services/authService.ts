import { supabase } from './supabaseClient';
import { User } from '../types';

const SESSION_KEY = 'mobinext_user_session';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

const mapUser = (data: any): User => ({
    user_id: data.user_id,
    number: data.number,
    username: data.username,
    name: data.name,
    last_name: data.last_name,
    signup_Date: data.signup_date || data.signup_Date || new Date().toISOString()
});

export const authService = {
  // Sign Up
  async signup(data: { number: string; username: string; name: string; last_name: string; pass: string }): Promise<AuthResult> {
    try {
      // Check for existing user using maybeSingle to avoid 0-row errors
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('user_id')
        .or(`number.eq.${data.number},username.eq.${data.username}`)
        .maybeSingle();

      if (checkError) {
         // If it's a connection error or something serious, throw it
         throw checkError;
      }

      if (existingUser) {
        return { success: false, error: 'این شماره موبایل یا نام کاربری قبلا ثبت شده است.' };
      }

      const { data: newUserRaw, error } = await supabase
        .from('users')
        .insert([{
            number: data.number,
            username: data.username,
            name: data.name,
            last_name: data.last_name,
            pass: data.pass
        }])
        .select()
        .single();

      if (error) throw error;
      
      const newUser = mapUser(newUserRaw);
      this.saveLocalSession(newUser);
      return { success: true, user: newUser };

    } catch (error: any) {
      console.error('Signup error:', error);
      const msg = error?.message || error?.details || 'خطا در ثبت نام';
      return { success: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg) };
    }
  },

  // Login
  async login(identifier: string, pass: string): Promise<AuthResult> {
    try {
      // Check if identifier is number or username
      const { data: userRaw, error } = await supabase
        .from('users')
        .select('*')
        .or(`number.eq.${identifier},username.eq.${identifier}`)
        .eq('pass', pass)
        .maybeSingle();

      if (error) throw error;

      if (!userRaw) {
        return { success: false, error: 'نام کاربری/شماره یا رمز عبور اشتباه است.' };
      }
      
      const user = mapUser(userRaw);
      this.saveLocalSession(user);
      return { success: true, user };

    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error?.message || 'خطا در برقراری ارتباط با سرور';
      return { success: false, error: msg };
    }
  },

  // Local Storage Management (7 Days Rule)
  saveLocalSession(user: User) {
    const sessionData = {
      user,
      expiry: Date.now() + SEVEN_DAYS_MS
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  },

  checkLocalSession(): User | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      if (Date.now() > session.expiry) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session.user;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }
};