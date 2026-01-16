/**
 * INFINITY X AI - VISION CORTEX
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Cpu, Activity, Shield, Zap, 
  Terminal, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  type: 'system' | 'user' | 'bot';
  content: string;
}

const AdminVisionCortex: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: 'system', content: 'Vision Cortex Neural Interface v4.2 initialized.' },
    { id: 2, type: 'system', content: 'Secure connection established with 842 active nodes.' },
    { id: 3, type: 'bot', content: 'I am ready. Awaiting administrative command.' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: Message = { id: Date.now(), type: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        content: `Processing command: "${input}". Analyzing system parameters...` 
      }]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="h-full flex flex-col bg-transparent text-white overflow-hidden rounded-tl-2xl border-l-2 border-t-2 border-white/20">
      {/* Header */}
      <div className="h-20 border-b-2 border-white/20 flex items-center px-8 justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0066FF]/20 rounded-xl flex items-center justify-center border-2 border-[#0066FF]">
            <Cpu className="text-white" size={28} />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-wide text-white">
              Vision<span className="text-[#39FF14]">Cortex</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14]">
              <Activity size={12} />
              NEURAL LINK ACTIVE
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-lg border border-white/10">
            <Shield size={14} className="text-green-400" />
            <span className="text-xs font-bold text-white/60">
              clearance: <span className="text-white">ADMIN_L5</span>
            </span>
          </div>
          <div className="text-xs text-white/40 font-mono hidden md:block">Latency: 12ms</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col p-6">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pr-4 pb-4"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex w-full",
                msg.type === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] md:max-w-[70%] p-6 rounded-2xl border-2 relative transition-all duration-300",
                msg.type === 'user' 
                  ? "bg-[#0066FF]/10 border-[#0066FF]/50 text-white rounded-tr-sm" 
                  : msg.type === 'system'
                  ? "bg-transparent border-none text-white/40 font-mono text-xs w-full max-w-full text-center py-2"
                  : "bg-black/60 border-[#39FF14]/30 text-white rounded-tl-sm"
              )}>
                {msg.type !== 'system' && (
                  <div className={cn(
                    "absolute -top-3 left-4 text-[10px] font-bold uppercase tracking-wider bg-black px-2 border rounded-full",
                    msg.type === 'user' ? "text-blue-400 border-blue-500/30" : "text-[#39FF14] border-[#39FF14]/30"
                  )}>
                    {msg.type === 'user' ? 'Admin' : 'Cortex AI'}
                  </div>
                )}
                {msg.type === 'bot' && <Zap size={16} className="text-[#39FF14] mb-2" />}
                
                <p className={cn(
                  "leading-relaxed text-sm md:text-base",
                  msg.type === 'system' && "flex items-center justify-center gap-2"
                )}>
                  {msg.type === 'system' && <Terminal size={12} />}
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="mt-6 relative shrink-0">
          <div className="p-2 rounded-2xl flex items-center gap-4 bg-black/60 border-2 border-white/20 focus-within:border-[#39FF14]/70 transition-all">
            <div className="pl-4">
              <Terminal size={20} className="text-white/40" />
            </div>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter directive or query..."
              className="flex-1 bg-transparent border-none outline-none text-white h-12 placeholder:text-white/30 font-mono"
              autoFocus
            />
            <Button 
              onClick={handleSend}
              className="h-12 px-8 rounded-xl bg-[#39FF14] hover:bg-[#32e612] text-black font-bold text-lg transition-all"
            >
              <Send size={20} />
            </Button>
          </div>
          <div className="flex justify-between mt-2 px-2">
            <div className="text-[10px] text-white/30 font-mono">SHIFT + ENTER for new line</div>
            <div className="text-[10px] text-[#39FF14]/60 font-mono flex items-center gap-1">
              <CheckCircle size={10} /> System Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVisionCortex;
