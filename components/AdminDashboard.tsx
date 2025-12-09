import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import ReactMarkdown from 'react-markdown';
import { 
  Users, MessageSquare, Database, Download, LogOut, 
  BarChart3, Activity, Search, Calendar, ShieldCheck, 
  Trash2, Sparkles, TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sessions' | 'ai_insight'>('overview');
  const [stats, setStats] = useState({ usersCount: 0, sessionsCount: 0, totalMessages: 0, messagesToday: 0 });
  const [usersData, setUsersData] = useState<any[]>([]);
  const [sessionsData, setSessionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New States
  const [searchTerm, setSearchTerm] = useState('');
  const [aiReport, setAiReport] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const s = await adminService.getStats();
    setStats(s);
    
    const u = await adminService.getUsers();
    setUsersData(u);
    
    const c = await adminService.getSessions();
    setSessionsData(c);
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
      if(!window.confirm("آیا از حذف این کاربر و تمام چت‌های او اطمینان دارید؟")) return;
      
      const res = await adminService.deleteUser(userId);
      if(res.success) {
          setUsersData(prev => prev.filter(u => u.user_id !== userId));
          // Refresh stats slightly
          setStats(prev => ({...prev, usersCount: prev.usersCount - 1}));
      } else {
          alert("خطا در حذف کاربر");
      }
  };

  const handleGenerateReport = async () => {
      setLoadingReport(true);
      const report = await adminService.generateBusinessReport();
      setAiReport(report);
      setLoadingReport(false);
  };

  const downloadJSON = (data: any[], filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Users
  const filteredUsers = usersData.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.number || '').includes(searchTerm)
  );

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="animate-pulse">در حال بارگذاری داده‌های مدیریتی...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex" dir="rtl">
      
      {/* Sidebar - Glassmorphism */}
      <aside className="w-72 bg-[#121212]/50 backdrop-blur-xl border-l border-white/5 flex flex-col h-screen fixed right-0 top-0 z-50">
        <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <ShieldCheck className="text-white" size={20} />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-wide">پنل مدیریت</h1>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">StarCycle Admin</span>
                </div>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={BarChart3} label="داشبورد و آمار" />
            <NavButton active={activeTab === 'ai_insight'} onClick={() => setActiveTab('ai_insight')} icon={Sparkles} label="هوش مصنوعی (جدید)" isNew />
            <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="مدیریت کاربران" badge={usersData.length} />
            <NavButton active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} icon={MessageSquare} label="تاریخچه چت‌ها" />
        </nav>

        <div className="p-4 border-t border-white/5 bg-gradient-to-t from-red-900/10 to-transparent">
            <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group"
            >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">خروج امن</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-72 p-8 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
                <header className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-white to-gray-500 mb-2">داشبورد وضعیت</h2>
                        <p className="text-gray-400">نمای کلی از عملکرد ربات و تعامل کاربران</p>
                    </div>
                    <button onClick={loadData} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><RefreshCw size={20} /></button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="کل کاربران" value={stats.usersCount} icon={Users} color="blue" />
                    <StatCard title="نشست‌های فعال" value={stats.sessionsCount} icon={MessageSquare} color="green" />
                    <StatCard title="کل پیام‌ها" value={stats.totalMessages} icon={Database} color="yellow" />
                    <StatCard title="پیام‌های امروز" value={stats.messagesToday} icon={Calendar} color="purple" />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Growth Chart (Simulated) */}
                    <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <TrendingUp className="text-primary" size={20} />
                                رشد کاربران
                            </h3>
                            <span className="text-xs bg-white/5 px-2 py-1 rounded-md text-gray-400">هفتگی</span>
                        </div>
                        <div className="h-48 flex items-end gap-4 justify-between px-2">
                            {/* Dummy Chart Bars */}
                            {[30, 45, 35, 60, 55, 75, 90].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end group">
                                    <div 
                                        style={{ height: `${h}%` }} 
                                        className="w-full bg-gradient-to-t from-primary/20 to-primary/80 rounded-t-lg transition-all duration-500 group-hover:from-primary/40 group-hover:to-primary"
                                    ></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500 px-1">
                            <span>شنبه</span><span>جمعه</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col justify-center gap-4">
                        <h3 className="font-bold text-gray-300 mb-2">دسترسی سریع</h3>
                        <button onClick={() => downloadJSON(usersData, 'users_db')} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all border border-white/5 hover:border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg"><Download className="text-blue-500" size={18} /></div>
                                <span className="text-sm">دانلود دیتابیس کاربران</span>
                            </div>
                        </button>
                        <button onClick={() => downloadJSON(sessionsData, 'chat_sessions_db')} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all border border-white/5 hover:border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500/20 p-2 rounded-lg"><Download className="text-green-500" size={18} /></div>
                                <span className="text-sm">دانلود دیتابیس چت‌ها</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* AI INSIGHT TAB */}
        {activeTab === 'ai_insight' && (
             <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden">
                    <Sparkles className="absolute top-4 left-4 text-indigo-400 opacity-50" size={100} />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">هوش مصنوعی تحلیلگر بازار</h2>
                        <p className="text-indigo-200 mb-6 max-w-xl leading-relaxed">
                            این قابلیت با بررسی ۵۰ پیام آخر کاربران، یک گزارش جامع از نیازهای بازار، کالاهای پرتقاضا و رفتار مشتریان تولید می‌کند.
                        </p>
                        <button 
                            onClick={handleGenerateReport}
                            disabled={loadingReport}
                            className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-900/50 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loadingReport ? (
                                <><div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"/> در حال تحلیل...</>
                            ) : (
                                <><Sparkles size={20} /> تولید گزارش هوشمند</>
                            )}
                        </button>
                    </div>
                </div>

                {aiReport && (
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 animate-slideUp">
                        <h3 className="text-xl font-bold mb-6 text-primary border-b border-white/5 pb-4">نتایج تحلیل:</h3>
                        <div className="markdown-content text-gray-300 leading-8">
                             <ReactMarkdown components={{strong: ({node, ...props}) => <span className="text-white font-bold bg-white/10 px-1 rounded" {...props} />}}>{aiReport}</ReactMarkdown>
                        </div>
                    </div>
                )}
             </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold">مدیریت کاربران</h2>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-3 top-3 text-gray-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="جستجو با نام، نام کاربری یا شماره..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#121212] border border-white/10 focus:border-primary/50 rounded-xl py-2.5 pr-10 pl-4 text-white outline-none"
                        />
                    </div>
                </div>
                
                {usersData.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 bg-[#121212] rounded-3xl border border-white/5 border-dashed">
                        <AlertCircle className="text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">هیچ کاربری یافت نشد.</p>
                     </div>
                ) : (
                    <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-5">کاربر</th>
                                        <th className="p-5">اطلاعات تماس</th>
                                        <th className="p-5">تاریخ عضویت</th>
                                        <th className="p-5 text-center">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold">
                                                        {(user.name?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{user.name} {user.last_name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 font-mono text-gray-400">{user.number}</td>
                                            <td className="p-5 text-gray-400 text-sm">
                                                {new Date(user.signup_date || user.signup_Date).toLocaleDateString('fa-IR')}
                                            </td>
                                            <td className="p-5 text-center">
                                                <button 
                                                    onClick={() => handleDeleteUser(user.user_id)}
                                                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" 
                                                    title="حذف کاربر"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'sessions' && (
            <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">تاریخچه چت‌ها</h2>
                </div>

                <div className="grid gap-4">
                    {sessionsData.slice(0, 50).map((session, idx) => (
                        <div key={idx} className="bg-[#121212] p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/5 p-2 rounded-lg text-primary"><MessageSquare size={18} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-200">{session.title || 'بدون عنوان'}</h4>
                                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">ID: {session.id}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 bg-black/40 px-2 py-1 rounded-md">{new Date(session.last_modified).toLocaleString('fa-IR')}</span>
                            </div>
                            
                            <div className="bg-[#09090b] p-4 rounded-xl max-h-40 overflow-y-auto text-sm space-y-3 custom-scrollbar">
                                {session.messages?.map((m: any, i: number) => (
                                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <span className={`text-[10px] font-bold uppercase px-1 py-0.5 rounded h-fit ${m.role === 'user' ? 'bg-gray-800 text-gray-400' : 'bg-primary/20 text-primary'}`}>
                                            {m.role === 'user' ? 'User' : 'Bot'}
                                        </span>
                                        <p className={`text-gray-400 leading-relaxed ${m.role === 'user' ? 'text-right' : 'text-left'} w-full`}>{m.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon: Icon, color }: any) => {
    const colorStyles: any = {
        blue: "from-blue-500/20 to-blue-600/5 text-blue-500",
        green: "from-green-500/20 to-green-600/5 text-green-500",
        yellow: "from-yellow-500/20 to-yellow-600/5 text-yellow-500",
        purple: "from-purple-500/20 to-purple-600/5 text-purple-500",
    };

    return (
        <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorStyles[color]} blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none`}></div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-4xl font-black text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-white/5 ${colorStyles[color].split(' ')[2]}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon: Icon, label, badge, isNew }: any) => (
    <button 
        onClick={onClick}
        className={`
            w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group
            ${active 
                ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border-r-2 border-primary' 
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-r-2 border-transparent'}
        `}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} className={active ? 'animate-pulse' : ''} />
            <span className="font-medium text-sm">{label}</span>
        </div>
        {badge !== undefined && (
            <span className="bg-white/10 text-xs px-2 py-0.5 rounded-md">{badge}</span>
        )}
        {isNew && (
            <span className="bg-indigo-500 text-[10px] font-bold text-white px-1.5 py-0.5 rounded animate-pulse">جدید</span>
        )}
    </button>
);

export default AdminDashboard;