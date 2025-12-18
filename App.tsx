import React, { useState, useEffect, useRef } from 'react';
import { Users, Clock, CheckCircle, ChevronRight, MessageCircle, Send, X, ShieldCheck, Star, Sparkles, Loader2, GraduationCap } from 'lucide-react';
import { User, Group, Course, AppView, ChatMessage } from './types';
import { sendMessageToAI } from './services/geminiService';

// --- Mock Data ---
const CURRENT_USER: User = {
  id: 'u1',
  name: '我',
  avatar: 'https://picsum.photos/seed/me/100/100'
};

const MOCK_COURSE: Course = {
  id: 'c1',
  title: '极致Essay 1v1 包过辅导试听课',
  originalPrice: 1099,
  groupPrice: 699,
  description: '极致Essay 专业导师 1v1 深度诊断，定制专属提升方案。涵盖 Essay 润色、挂科申诉、课程辅导。',
  features: [] 
};

const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    creator: { id: 'u2', name: 'Alex', avatar: 'https://picsum.photos/seed/alex/100/100' },
    members: [
      { id: 'u2', name: 'Alex', avatar: 'https://picsum.photos/seed/alex/100/100' }
    ],
    maxMembers: 3,
    expiresAt: Date.now() + 3600000, // 1 hour
    status: 'OPEN'
  },
  {
    id: 'g2',
    creator: { id: 'u3', name: 'Sarah', avatar: 'https://picsum.photos/seed/sarah/100/100' },
    members: [
      { id: 'u3', name: 'Sarah', avatar: 'https://picsum.photos/seed/sarah/100/100' },
      { id: 'u4', name: 'Mike', avatar: 'https://picsum.photos/seed/mike/100/100' }
    ],
    maxMembers: 3,
    expiresAt: Date.now() + 7200000,
    status: 'OPEN'
  }
];

// --- Utility Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'black' | 'green' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const base = "px-4 py-3.5 rounded-2xl font-bold tracking-wide transition-all duration-200 active:scale-95 flex items-center justify-center text-sm shadow-sm";
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-violet-500 hover:to-indigo-500",
    secondary: "bg-white text-slate-800 border border-slate-100 hover:bg-slate-50",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    black: "bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800",
    green: "bg-[#09BB07] text-white hover:bg-[#08a306] shadow-green-500/20"
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Avatar: React.FC<{ src: string, alt: string, size?: string, className?: string }> = ({ src, alt, size = "w-10 h-10", className="" }) => (
  <img src={src} alt={alt} className={`${size} rounded-full ring-2 ring-white shadow-sm object-cover bg-gray-200 ${className}`} />
);

// --- Feature Components ---

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '同学你好！我是极致Essay的智能顾问。关于试听课拼团、导师背景或辅导内容，随时问我哦！✨' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const reply = await sendMessageToAI(userMsg, history);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: '抱歉，网络开小差了，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-5 w-14 h-14 bg-slate-900 rounded-full shadow-2xl shadow-indigo-500/30 flex items-center justify-center text-white z-40 transition-all hover:scale-105 active:scale-95 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <span className="relative flex h-full w-full items-center justify-center">
          <Sparkles size={24} className="text-yellow-400" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
          </span>
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-5 w-full sm:w-[400px] h-full sm:h-[600px] bg-white sm:rounded-3xl shadow-2xl z-50 flex flex-col border border-slate-100/50 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden font-sans">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10">
                <Sparkles size={20} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-base">智能顾问 AI</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> 在线</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 no-scrollbar" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1 shadow-sm flex-shrink-0 text-white">
                    <Sparkles size={14} />
                  </div>
                )}
                <div className={`max-w-[80%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-sm' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 shadow-sm flex-shrink-0 text-white">
                   <Sparkles size={14} />
                 </div>
                 <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 flex gap-1.5 items-center">
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                 </div>
               </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
            <div className="flex-1 relative">
              <input 
                className="w-full bg-slate-50 rounded-full pl-5 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 transition-all"
                placeholder="咨询课程详情..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// --- View Components ---

const HomeView: React.FC<{ 
  groups: Group[], 
  onJoin: (groupId: string) => void, 
  onCreate: () => void 
}> = ({ groups, onJoin, onCreate }) => {
  return (
    <div className="pb-32 bg-slate-50 min-h-screen font-sans">
      {/* Hero Section */}
      <div className="relative bg-[#0F172A] text-white pt-8 pb-12 px-6 rounded-b-[3rem] shadow-xl overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-40 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600 rounded-full blur-[80px] opacity-30 -ml-16 -mb-16"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </span>
              极致Essay
            </h1>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-white/5 text-indigo-100">
              专注留学辅导
            </span>
          </div>
          
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-yellow-400/10 text-yellow-300 rounded-full text-xs font-bold mb-3 border border-yellow-400/20">
              🔥 限时 3 人团
            </div>
            <h2 className="text-4xl font-extrabold mb-3 leading-tight">1v1 包过辅导<br/>试听课 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">¥{MOCK_COURSE.groupPrice}</span></h2>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">拼课不限专业，开启你的试听之旅</p>
          </div>

          {/* Glass Card Price */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div>
              <p className="text-slate-400 text-xs mb-1 line-through">原价 ¥{MOCK_COURSE.originalPrice}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-white">¥</span>
                <span className="text-4xl font-extrabold text-white tracking-tight">{MOCK_COURSE.groupPrice}</span>
                <span className="ml-2 text-[10px] bg-white px-2 py-0.5 rounded text-red-600 font-bold tracking-wider uppercase">立省 ¥400</span>
              </div>
            </div>
            <div className="text-right">
               <div className="text-[10px] text-slate-300 mb-1.5 uppercase tracking-wide">距结束</div>
               <div className="flex gap-1.5 text-sm font-mono font-bold">
                 <span className="bg-white/10 text-white px-1.5 py-1 rounded min-w-[24px] text-center backdrop-blur-sm border border-white/5">04</span>
                 <span className="text-white/30 self-center">:</span>
                 <span className="bg-white/10 text-white px-1.5 py-1 rounded min-w-[24px] text-center backdrop-blur-sm border border-white/5">23</span>
                 <span className="text-white/30 self-center">:</span>
                 <span className="bg-white/10 text-white px-1.5 py-1 rounded min-w-[24px] text-center backdrop-blur-sm border border-white/5">12</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Groups List - Plate portion enlarged */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-extrabold text-2xl text-slate-900 flex items-center gap-3">
            正在拼团
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          </h3>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-medium text-slate-400">128 人已参与</span>
          </div>
        </div>

        <div className="space-y-5">
          {groups.map(group => {
            const missing = group.maxMembers - group.members.length;
            return (
              <div key={group.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between gap-4 group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex -space-x-4 flex-shrink-0">
                    {group.members.map(m => (
                      <Avatar key={m.id} src={m.avatar} alt={m.name} size="w-12 h-12" className="ring-[3px] ring-white" />
                    ))}
                    <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-white border-dashed flex items-center justify-center text-slate-300 text-xs shadow-inner">
                      ?
                    </div>
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="text-base font-extrabold text-slate-900 truncate">{group.creator.name} 的团</div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <span className="whitespace-nowrap font-medium">还差 <span className="text-red-500 font-black text-base">{missing}</span> 人</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="black" 
                  className="!px-6 !py-3 !text-sm !rounded-2xl flex-shrink-0 whitespace-nowrap !font-black shadow-lg shadow-slate-200 hover:shadow-indigo-100" 
                  onClick={() => onJoin(group.id)}
                >
                  去拼单
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200/60 p-4 pb-8 safe-area-pb z-30 flex items-center gap-4 shadow-[0_-5px_30px_rgba(0,0,0,0.03)]">
        <div className="flex-1 pl-2">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">拼团优惠价</p>
          <div className="text-2xl font-extrabold text-slate-900 leading-none">
            ¥{MOCK_COURSE.groupPrice} 
            <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded ml-2 align-middle">-40%</span>
          </div>
        </div>
        <Button onClick={onCreate} className="flex-1 shadow-indigo-200 bg-slate-900 hover:bg-slate-800 text-white !py-3 !text-sm !rounded-xl">
          发起拼团
        </Button>
      </div>
    </div>
  );
};

const GroupDetailView: React.FC<{ 
  group: Group, 
  onBack: () => void,
  onJoinConfirm: (groupId: string) => void
}> = ({ group, onBack, onJoinConfirm }) => {
  const missing = group.maxMembers - group.members.length;
  const isFull = missing === 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center border-b border-slate-100 sticky top-0 z-20">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronRight className="rotate-180 text-slate-600" size={22} /></button>
        <h1 className="font-bold text-base mx-auto pr-10 text-slate-800">拼团详情</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Product Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-8 flex gap-5">
           <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xs p-2 text-center border border-indigo-100 shadow-inner">
             <div className="space-y-1">
               <span className="block text-2xl">⚡️</span>
               <span className="block font-extrabold text-lg">1v1</span>
               <span className="block text-[10px] text-indigo-400">试听</span>
             </div>
           </div>
           <div className="flex-1 py-1">
             <h3 className="font-bold text-slate-900 text-xl leading-snug">{MOCK_COURSE.title}</h3>
             <div className="mt-3 flex items-baseline gap-2.5">
               <span className="text-slate-900 font-extrabold text-2xl">¥{MOCK_COURSE.groupPrice}</span>
               <span className="text-slate-400 text-sm line-through font-medium">¥{MOCK_COURSE.originalPrice}</span>
             </div>
             <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded uppercase tracking-wide">
               <Users size={10} /> 3人团
             </div>
           </div>
        </div>

        {/* Status Area */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="flex items-center justify-center gap-4 mb-8">
             {Array.from({ length: 3 }).map((_, i) => {
               const member = group.members[i];
               return (
                 <div key={i} className="relative group">
                   {member ? (
                     <div className="relative">
                       <Avatar src={member.avatar} alt={member.name} size="w-16 h-16" className="ring-4 ring-slate-50" />
                       {i === 0 && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-[9px] font-black text-slate-900 px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-10">团长</span>}
                     </div>
                   ) : (
                     <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 group-hover:border-indigo-300 group-hover:text-indigo-300 transition-colors">
                       <Users size={24} />
                     </div>
                   )}
                 </div>
               );
             })}
          </div>

          {isFull ? (
             <div className="animate-in zoom-in duration-300">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2"><CheckCircle className="text-green-500" /> 拼团成功</h2>
                <p className="text-slate-500 text-sm font-medium">拼团报名成功，正在跳转...</p>
             </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">还差 <span className="text-red-500 mx-1">{missing}</span> 人，人满开团</h2>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-bold text-slate-900 px-2">
            <span>拼团玩法</span>
            <span className="text-indigo-600 text-xs font-semibold flex items-center">查看规则 <ChevronRight size={14} /></span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center text-xs text-slate-500 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            {[
              { num: 1, text: '开团/参团' },
              { num: 2, text: '邀请好友' },
              { num: 3, text: '人满开团' },
              { num: 4, text: '联系专属顾问' }
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] border border-indigo-100">{step.num}</span>
                  <span className="scale-90 font-medium">{step.text}</span>
                </div>
                {idx < 3 && <div className="w-8 h-[1px] bg-slate-100 -mt-4"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {!isFull && (
        <div className="p-4 pb-8 bg-white border-t border-slate-100 sticky bottom-0 shadow-[0_-5px_30px_rgba(0,0,0,0.03)]">
          <Button onClick={() => onJoinConfirm(group.id)} className="w-full !text-base !py-4 shadow-xl shadow-indigo-200">
            参与拼团 <span className="ml-1 opacity-80 font-normal">|</span> ¥{MOCK_COURSE.groupPrice}
          </Button>
        </div>
      )}
    </div>
  );
};

const SuccessView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [formationTime, setFormationTime] = useState('');
  const orderId = useRef("ORD-" + Math.floor(Math.random() * 1000000)).current;
  const consultantId = "xy5312630";

  useEffect(() => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setFormationTime(formatted);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(consultantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-16 px-6 text-center font-sans">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 rounded-full"></div>
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl relative z-10 animate-in zoom-in duration-500">
          <CheckCircle size={48} className="text-green-500" fill="#ecfdf5" />
        </div>
      </div>
      
      <h1 className="text-2xl font-extrabold text-slate-900 mb-2">拼团成功！</h1>
      <p className="text-slate-500 mb-10 text-sm">您的试听课名额已锁定，请尽快联系顾问。</p>

      <div className="w-full bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
        
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-slate-500 font-medium">拼团编号</span>
          <span className="font-mono font-bold text-slate-900">{orderId}</span>
        </div>
        <div className="flex justify-between items-center mb-4 text-sm">
           <span className="text-slate-500 font-medium">拼团价</span>
           <span className="font-extrabold text-slate-900">¥{MOCK_COURSE.groupPrice}</span>
        </div>
        <div className="flex justify-between items-center mb-6 text-sm border-t border-slate-50 pt-4">
           <span className="text-slate-500 font-medium">拼团时间</span>
           <span className="font-medium text-slate-900">{formationTime}</span>
        </div>
        
        <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2 text-left">您的专属顾问</p>
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
            <span className="font-bold text-slate-800 text-lg select-all">{consultantId}</span>
            <button 
              onClick={handleCopy}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
            >
              {copied ? '已复制' : '复制微信'}
            </button>
          </div>
          <p className="text-[10px] text-indigo-400 mt-2 flex items-center gap-1.5 text-left font-medium">
            <Star size={10} fill="currentColor" /> 添加时请备注“试听课”
          </p>
        </div>
      </div>

      <Button variant="black" className="w-full" onClick={() => window.location.reload()}>
        返回首页
      </Button>
    </div>
  );
};

// --- Main App Logic ---

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const handleCreateGroup = () => {
    const newGroup: Group = {
      id: `g${Date.now()}`,
      creator: CURRENT_USER,
      members: [CURRENT_USER],
      maxMembers: 3,
      expiresAt: Date.now() + 86400000,
      status: 'OPEN'
    };
    setGroups(prev => [newGroup, ...prev]);
    setActiveGroupId(newGroup.id);
    setView(AppView.GROUP_DETAIL);
  };

  const handleJoinClick = (groupId: string) => {
    setActiveGroupId(groupId);
    setView(AppView.GROUP_DETAIL);
  };

  const handleConfirmJoin = (groupId: string) => {
    // Optimistic Update
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        // Prevent duplicate join for demo
        if (g.members.find(m => m.id === CURRENT_USER.id)) return g;
        
        const updatedMembers = [...g.members, CURRENT_USER];
        const isNowFull = updatedMembers.length >= g.maxMembers;
        return {
          ...g,
          members: updatedMembers,
          status: isNowFull ? 'FULL' : 'OPEN'
        };
      }
      return g;
    }));
    
    // Redirect directly to Success instead of Payment
    setTimeout(() => setView(AppView.SUCCESS), 600);
  };

  // Find the active group object safely
  const currentGroup = groups.find(g => g.id === activeGroupId);

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl relative overflow-hidden font-sans border-x border-slate-200">
      {view === AppView.HOME && (
        <HomeView 
          groups={groups.filter(g => g.status === 'OPEN')} 
          onJoin={handleJoinClick} 
          onCreate={handleCreateGroup} 
        />
      )}

      {view === AppView.GROUP_DETAIL && currentGroup && (
        <GroupDetailView 
          group={currentGroup} 
          onBack={() => setView(AppView.HOME)} 
          onJoinConfirm={handleConfirmJoin} 
        />
      )}

      {view === AppView.SUCCESS && (
        <SuccessView />
      )}

      {/* AI Chat Bot Global Widget */}
      <AIChatWidget />
    </div>
  );
};

export default App;