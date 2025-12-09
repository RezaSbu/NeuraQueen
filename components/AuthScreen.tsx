import React, { useState } from 'react';
import { User as UserIcon, Lock, Phone, UserPlus, LogIn, ChevronRight } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface Props {
  onAuthSuccess: (user: User) => void;
}

const AuthScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Signup State
  const [signupData, setSignupData] = useState({
    name: '',
    last_name: '',
    username: '',
    number: '',
    pass: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await authService.login(loginId, loginPass);
    if (result.success && result.user) {
      onAuthSuccess(result.user);
    } else {
      setError(result.error || 'خطا در ورود');
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!signupData.number || !signupData.username || !signupData.pass) {
        setError("لطفا فیلدهای اجباری را پر کنید");
        return;
    }

    setIsLoading(true);
    const result = await authService.signup(signupData);
    if (result.success && result.user) {
      onAuthSuccess(result.user);
    } else {
      setError(result.error || 'خطا در ثبت نام');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Header Toggle */}
        <div className="flex p-2 bg-[#1E1E1E]">
           <button 
             onClick={() => { setIsLogin(true); setError(''); }}
             className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${isLogin ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-300'}`}
           >
             ورود به حساب
           </button>
           <button 
             onClick={() => { setIsLogin(false); setError(''); }}
             className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${!isLogin ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
           >
             ثبت نام رایگان
           </button>
        </div>

        <div className="p-8">
           <div className="text-center mb-8">
             <h2 className="text-2xl font-black text-white mb-2">
               {isLogin ? 'خوش آمدید! 👋' : 'ساخت حساب کاربری 🚀'}
             </h2>
             <p className="text-gray-400 text-sm">
               {isLogin ? 'برای استفاده از دستیار هوشمند وارد شوید' : 'به خانواده استار سیکلت بپیوندید'}
             </p>
           </div>

           {error && (
             <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center animate-fadeIn">
               {error}
             </div>
           )}

           {isLogin ? (
             // Login Form
             <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400 mr-1">نام کاربری یا شماره موبایل</label>
                    <div className="relative">
                        <UserIcon size={18} className="absolute right-3 top-3.5 text-gray-500" />
                        <input 
                          type="text" 
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          className="w-full bg-[#1E1E1E] border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 pr-10 pl-4 outline-none transition-all placeholder-gray-600"
                          placeholder="مثلا: 0912..."
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400 mr-1">رمز عبور</label>
                    <div className="relative">
                        <Lock size={18} className="absolute right-3 top-3.5 text-gray-500" />
                        <input 
                          type="password" 
                          value={loginPass}
                          onChange={(e) => setLoginPass(e.target.value)}
                          className="w-full bg-[#1E1E1E] border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 pr-10 pl-4 outline-none transition-all placeholder-gray-600"
                          placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-green-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? 'در حال بررسی...' : (
                    <>
                      <span>ورود به سیستم</span>
                      <LogIn size={18} />
                    </>
                  )}
                </button>
             </form>
           ) : (
             // Signup Form
             <form onSubmit={handleSignup} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                   <input 
                     type="text" 
                     value={signupData.name}
                     onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                     className="bg-[#1E1E1E] border border-white/10 focus:border-white/30 text-white rounded-xl py-3 px-4 outline-none transition-all placeholder-gray-600 text-sm"
                     placeholder="نام"
                   />
                   <input 
                     type="text" 
                     value={signupData.last_name}
                     onChange={(e) => setSignupData({...signupData, last_name: e.target.value})}
                     className="bg-[#1E1E1E] border border-white/10 focus:border-white/30 text-white rounded-xl py-3 px-4 outline-none transition-all placeholder-gray-600 text-sm"
                     placeholder="نام خانوادگی"
                   />
                </div>

                <div className="relative">
                    <UserIcon size={18} className="absolute right-3 top-3.5 text-gray-500" />
                    <input 
                      type="text"
                      value={signupData.username}
                      onChange={(e) => setSignupData({...signupData, username: e.target.value})} 
                      className="w-full bg-[#1E1E1E] border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 pr-10 pl-4 outline-none transition-all placeholder-gray-600 text-sm"
                      placeholder="نام کاربری (انگلیسی)"
                      dir="ltr"
                    />
                </div>

                <div className="relative">
                    <Phone size={18} className="absolute right-3 top-3.5 text-gray-500" />
                    <input 
                      type="tel"
                      value={signupData.number}
                      onChange={(e) => setSignupData({...signupData, number: e.target.value})} 
                      className="w-full bg-[#1E1E1E] border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 pr-10 pl-4 outline-none transition-all placeholder-gray-600 text-sm"
                      placeholder="شماره موبایل"
                      dir="ltr"
                    />
                </div>

                <div className="relative">
                    <Lock size={18} className="absolute right-3 top-3.5 text-gray-500" />
                    <input 
                      type="password"
                      value={signupData.pass}
                      onChange={(e) => setSignupData({...signupData, pass: e.target.value})} 
                      className="w-full bg-[#1E1E1E] border border-white/10 focus:border-primary/50 text-white rounded-xl py-3 pr-10 pl-4 outline-none transition-all placeholder-gray-600 text-sm"
                      placeholder="رمز عبور"
                      dir="ltr"
                    />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading} 
                  className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'در حال ثبت...' : (
                    <>
                      <span>ثبت نام و ورود</span>
                      <UserPlus size={18} />
                    </>
                  )}
                </button>
             </form>
           )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;