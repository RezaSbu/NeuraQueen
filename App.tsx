import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bike, Sparkles, MessageSquare, Plus, Scale, Trash2, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { initializeChat, sendMessageToGemini } from './services/geminiService';
import { loadProductDatabase } from './services/productService';
import { authService } from './services/authService';
import { chatPersistence } from './services/chatPersistence';
import ChatMessage from './components/ChatMessage';
import ComparisonModal from './components/ComparisonModal';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard'; // Import Dashboard
import { ChatMessage as ChatMessageType, Session, ProductMatch, User } from './types';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // Admin State
  const [authChecked, setAuthChecked] = useState(false);

  // App State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonList, setComparisonList] = useState<ProductMatch[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize App & Check Auth
  useEffect(() => {
    loadProductDatabase();
    initializeChat();
    
    // Check for existing session
    const storedUser = authService.checkLocalSession();
    if (storedUser) {
      setCurrentUser(storedUser);
      loadUserData(storedUser.user_id);
    }
    setAuthChecked(true);
  }, []);

  const loadUserData = async (userId: string) => {
    const userSessions = await chatPersistence.loadUserSessions(userId);
    if (userSessions.length > 0) {
        setSessions(userSessions);
        setCurrentSessionId(userSessions[0].id);
    } else {
        createNewSession(userId, true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, isLoading]);

  // Session Management
  const createNewSession = (userId = currentUser?.user_id, isInitial = false) => {
    if (!userId) return;

    const newSession: Session = {
      id: Date.now().toString(),
      title: 'چت جدید',
      messages: [{
        id: 'welcome',
        role: 'model',
        text: `سلام ${currentUser?.name || 'دوست'} عزیز! 👋\n\nمن **Mobinext** هستم. چطور می‌تونم در خرید لوازم موتور کمکتون کنم؟`,
        timestamp: Date.now()
      }],
      lastModified: Date.now()
    };
    
    // Save to State
    if (isInitial) {
        setSessions([newSession]);
    } else {
        setSessions(prev => [newSession, ...prev]);
    }
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);

    // Persist
    chatPersistence.saveSession(userId, newSession);
  };

  const updateCurrentSession = (newMessages: ChatMessageType[]) => {
    setSessions(prev => {
        const updatedSessions = prev.map(s => {
          if (s.id === currentSessionId) {
            let title = s.title;
            // Update title based on first user message
            if (s.title === 'چت جدید' && newMessages.length > 1) {
                const firstUserMsg = newMessages.find(m => m.role === 'user');
                if (firstUserMsg) title = firstUserMsg.text.slice(0, 30) + '...';
            }
            
            const updatedSession = { ...s, messages: newMessages, title, lastModified: Date.now() };
            
            // Persist to DB asynchronously
            if (currentUser?.user_id) {
                chatPersistence.saveSession(currentUser.user_id, updatedSession);
            }
            
            return updatedSession;
          }
          return s;
        });
        return updatedSessions;
    });
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // DB Remove
    await chatPersistence.deleteSession(id);

    // State Remove
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    
    if (currentSessionId === id && newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
    } else if (newSessions.length === 0 && currentUser) {
        createNewSession(currentUser.user_id);
    }
  };

  const getCurrentMessages = () => {
    return sessions.find(s => s.id === currentSessionId)?.messages || [];
  };

  // Chat Logic
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    const currentMsgs = getCurrentMessages();
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };
    
    // Optimistic Update
    const updatedWithUser = [...currentMsgs, userMsg];
    updateCurrentSession(updatedWithUser);

    try {
      const response = await sendMessageToGemini(userText, currentMsgs);
      
      const botMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        products: response.products,
        timestamp: Date.now()
      };
      
      updateCurrentSession([...updatedWithUser, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.",
        timestamp: Date.now()
      };
      updateCurrentSession([...updatedWithUser, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComparison = useCallback((product: ProductMatch) => {
    setComparisonList(prev => {
        const exists = prev.find(p => p.title === product.title);
        if (exists) {
            return prev.filter(p => p.title !== product.title);
        } else {
            if (prev.length >= 3) {
                alert("حداکثر ۳ محصول برای مقایسه می‌توانید انتخاب کنید.");
                return prev;
            }
            return [...prev, product];
        }
    });
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
      authService.logout();
      setCurrentUser(null);
      setSessions([]);
  };

  const onAuthSuccess = (user: User) => {
      setCurrentUser(user);
      loadUserData(user.user_id);
  };
  
  const handleAdminLogout = () => {
      setIsAdminLoggedIn(false);
  };

  // RENDER LOGIC
  if (!authChecked) return <div className="bg-black h-screen flex items-center justify-center text-primary">Loading...</div>;

  // Render Admin Dashboard
  if (isAdminLoggedIn) {
      return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  if (!currentUser) {
      return <AuthScreen onAuthSuccess={onAuthSuccess} onAdminLogin={() => setIsAdminLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden" dir="rtl">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 right-0 z-40 w-72 bg-[#121212] border-l border-white/5 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="bg-gradient-to-br from-primary to-green-600 p-1.5 rounded-lg">
                <Bike size={20} className="text-black" />
             </div>
             <h1 className="font-bold text-lg">StarCycle</h1>
           </div>
           <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
             <X size={24} />
           </button>
        </div>

        <div className="p-4">
           <button 
             onClick={() => createNewSession()}
             className="w-full flex items-center gap-2 bg-primary hover:bg-green-400 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary/10 hover:shadow-primary/30"
           >
             <Plus size={20} />
             <span>چت جدید</span>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin">
           <h3 className="text-xs font-bold text-gray-500 px-4 py-2">تاریخچه گفتگوها</h3>
           {sessions.map(session => (
             <div 
               key={session.id}
               onClick={() => { setCurrentSessionId(session.id); setSidebarOpen(false); }}
               className={`
                 group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                 ${session.id === currentSessionId ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
               `}
             >
                <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className={session.id === currentSessionId ? 'text-primary' : 'text-gray-600'} />
                    <span className="truncate text-sm">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => deleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                >
                    <Trash2 size={14} />
                </button>
             </div>
           ))}
        </div>
        
        <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <UserIcon size={16} className="text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{currentUser.name} {currentUser.last_name}</span>
                    <span className="text-xs text-gray-500">{currentUser.username}</span>
                </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors text-sm"
            >
                <LogOut size={16} />
                <span>خروج از حساب</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#121212]/80 backdrop-blur-md border-b border-white/5 z-20 absolute top-0 left-0 right-0">
          <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400">
                  <Menu size={24} />
              </button>
              <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">Mobinext AI</span>
                  <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-fast"></span>
                      <span className="text-[10px] text-gray-400">آنلاین و آماده پاسخگویی</span>
                  </div>
              </div>
          </div>
          
          {/* Comparison Button */}
          {comparisonList.length > 0 && (
             <button 
               onClick={() => setShowComparison(true)}
               className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-yellow-500 hover:text-black transition-all animate-fadeIn"
             >
                <Scale size={14} />
                <span>مقایسه ({comparisonList.length})</span>
             </button>
          )}
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto pt-16 pb-4 px-4 md:px-12 space-y-6 scrollbar-thin">
          {getCurrentMessages().map((msg, idx) => (
            <ChatMessage 
                key={msg.id} 
                message={msg} 
                isLastMessage={idx === getCurrentMessages().length - 1}
                onCompare={toggleComparison}
                compareList={comparisonList}
            />
          ))}
          
          {isLoading && (
             <ChatMessage 
               message={{ id: 'thinking', role: 'model', text: '', isThinking: true, timestamp: Date.now() }} 
               isLastMessage={true}
               onCompare={toggleComparison}
               compareList={comparisonList}
             />
          )}
          
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-black via-black to-transparent">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-[#1E1E1E] border border-white/10 rounded-3xl p-2 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(0,208,132,0.1)] transition-all duration-300">
            
            <button 
              onClick={() => setInput('')}
              className="p-3 text-gray-500 hover:text-primary transition-colors hidden md:block" 
              title="پاکسازی ورودی"
            >
              <Sparkles size={20} />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="از من بپرس... (مثلاً: کلاه کاسکت فک متحرک تا ۳ تومن)"
              className="flex-1 bg-transparent text-white placeholder-gray-500 p-3 resize-none focus:outline-none max-h-32 text-sm md:text-base scrollbar-hide leading-relaxed"
              rows={1}
              style={{ minHeight: '48px' }}
            />
            
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${!input.trim() || isLoading 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-primary text-black hover:bg-green-400 hover:scale-110 shadow-lg shadow-primary/20'}
              `}
            >
              <Send size={20} className={isLoading ? 'opacity-0' : 'ml-0.5'} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showComparison && (
          <ComparisonModal 
             products={comparisonList} 
             onClose={() => setShowComparison(false)} 
          />
      )}
    </div>
  );
};

export default App;