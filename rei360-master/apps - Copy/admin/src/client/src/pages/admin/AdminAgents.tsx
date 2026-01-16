/**
 * INFINITY X AI - ADMIN AGENTS
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState } from 'react';
import { 
  Bot, Play, Settings, Plus, Save, Trash2, 
  Brain, Mic, Activity, Volume2, Sparkles, 
  User, Layers, Cpu, ArrowLeft, RefreshCw,
  Rocket, History, Shield, LineChart, Network,
  ToggleLeft, ToggleRight, Share2, Grid, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Agent Template Interface
interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  industry: string;
  gender: string;
  premium: boolean;
  legendary?: boolean;
  status: 'active' | 'training' | 'draft';
  avatar: string;
  description: string;
  personality: {
    empathy: number;
    enthusiasm: number;
    caution: number;
    confidence: number;
    style: string;
  };
  voice: {
    id: string;
    speed: number;
    pitch: number;
    tone: string;
  };
  memory: {
    depth: string;
    learning: string;
    reflection: string;
    dreamCycles: boolean;
  };
  strategy: {
    proactive: boolean;
    analysis: string;
    risk: string;
  };
  skills: string[];
  metrics: {
    uptime: string;
    requests: string;
    avgResponse: string;
  };
}

// Initial Templates
const INITIAL_TEMPLATES: AgentTemplate[] = [
  {
    id: 't_exec_1',
    name: 'Athena',
    role: 'Executive Assistant',
    industry: 'Business',
    gender: 'female',
    premium: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    description: "High-level executive support. Manages schedules, communications, and strategic planning.",
    personality: { empathy: 90, enthusiasm: 70, caution: 80, confidence: 85, style: 'Professional' },
    voice: { id: 'juniper', speed: 1.0, pitch: 1.0, tone: 'Warm' },
    memory: { depth: 'Long-term', learning: 'Continuous', reflection: 'Daily', dreamCycles: true },
    strategy: { proactive: true, analysis: 'Holistic', risk: 'Balanced' },
    skills: ['Scheduling', 'Email Management', 'Travel Logistics'],
    metrics: { uptime: '99.9%', requests: '14.2k', avgResponse: '0.4s' }
  },
  {
    id: 't_fin_1',
    name: 'Wolfgang',
    role: 'Investment Strategist',
    industry: 'Finance',
    gender: 'male',
    premium: false,
    status: 'training',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
    description: "Aggressive market analysis and portfolio optimization.",
    personality: { empathy: 20, enthusiasm: 90, caution: 40, confidence: 100, style: 'Direct' },
    voice: { id: 'cove', speed: 1.2, pitch: 0.9, tone: 'Assertive' },
    memory: { depth: 'Session', learning: 'Market-based', reflection: 'Real-time', dreamCycles: false },
    strategy: { proactive: true, analysis: 'Quantitative', risk: 'Aggressive' },
    skills: ['Technical Analysis', 'Portfolio Rebalancing'],
    metrics: { uptime: '98.5%', requests: '42.1k', avgResponse: '0.1s' }
  },
  {
    id: 't_leg_elon',
    name: 'Musk-OS',
    role: 'Visionary Innovator',
    industry: 'Tech/Space',
    gender: 'male',
    premium: true,
    legendary: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&q=80&w=200&h=200',
    description: "First principles thinker. Obsessed with optimization and scale.",
    personality: { empathy: 30, enthusiasm: 95, caution: 10, confidence: 100, style: 'First Principles' },
    voice: { id: 'cove', speed: 1.1, pitch: 0.95, tone: 'Visionary' },
    memory: { depth: 'Infinite', learning: 'Physics-based', reflection: 'Continuous', dreamCycles: true },
    strategy: { proactive: true, analysis: 'First-principles', risk: 'Experimental' },
    skills: ['Rapid Prototyping', 'Cost Optimization'],
    metrics: { uptime: '99.99%', requests: '8.5M', avgResponse: '0.05s' }
  }
];

// Agent Card Component
const AgentCard: React.FC<{ 
  agent: AgentTemplate; 
  onClick: () => void; 
  active: boolean;
}> = ({ agent, onClick, active }) => (
  <div
    onClick={onClick}
    className={cn(
      "relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden group min-h-[220px] flex flex-col",
      active 
        ? "bg-black/60 border-[#39FF14]" 
        : "bg-black/40 border-white/10 hover:border-[#39FF14]/50 hover:bg-black/50"
    )}
  >
    {/* Status Indicator */}
    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white/70">
      <div className={cn("w-1.5 h-1.5 rounded-full", agent.status === 'active' ? "bg-[#39FF14]" : "bg-yellow-500")} />
      {agent.status}
    </div>

    {/* Premium/Legendary Badge */}
    {agent.legendary ? (
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-500/20 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-500/30">
        <Rocket size={10} /> LEGENDARY
      </div>
    ) : agent.premium ? (
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold px-2 py-0.5 rounded border border-yellow-500/30">
        <Sparkles size={10} /> PREMIUM
      </div>
    ) : null}

    <div className="flex items-center gap-4 mb-4 mt-6">
      <div className="relative">
        <div className={cn(
          "w-14 h-14 rounded-full overflow-hidden border-2 transition-colors",
          agent.legendary ? "border-purple-500" : "border-white/20 group-hover:border-[#39FF14]"
        )}>
          <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
        </div>
      </div>
      <div>
        <h3 className={cn(
          "font-bold transition-colors",
          agent.legendary ? "text-purple-400" : "text-white group-hover:text-[#39FF14]"
        )}>
          {agent.name}
        </h3>
        <p className="text-white/40 text-xs">{agent.role}</p>
      </div>
    </div>

    <p className="text-white/60 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
      {agent.description}
    </p>

    <div className="flex flex-wrap gap-1.5 mt-auto">
      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/60 border border-white/5 uppercase tracking-wider">
        {agent.industry}
      </span>
      <span className="ml-auto flex items-center gap-1 text-[10px] text-[#39FF14]">
        <Activity size={10} /> {agent.metrics?.uptime || '100%'}
      </span>
    </div>
  </div>
);

// Swarm AI Chat Component
const SwarmAIChat: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'system', content: 'Swarm Neural Link Established. All agents online.', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const SWARM_AGENTS = [
    { id: 'alpha', name: 'Alpha Strategist', role: 'Executive Planning', color: '#66FF33', avatar: 'AS' },
    { id: 'beta', name: 'Beta Analyst', role: 'Data Analysis', color: '#3399FF', avatar: 'BA' },
    { id: 'gamma', name: 'Gamma Coder', role: 'Technical Execution', color: '#FF3366', avatar: 'GC' },
    { id: 'delta', name: 'Delta Scout', role: 'Market Intelligence', color: '#FFCC33', avatar: 'DS' },
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { 
      id: Date.now(), 
      type: 'user' as const, 
      sender: 'Architect', 
      content: inputValue, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate Swarm Processing
    await new Promise(r => setTimeout(r, 1000));

    const agentResponses = [
      { agent: SWARM_AGENTS[0], content: `Analyzing strategic implications of "${inputValue}". Recommending immediate resource allocation.` },
      { agent: SWARM_AGENTS[1], content: `Data correlation found. Probability of success estimated at 89.4%.` },
      { agent: SWARM_AGENTS[2], content: `Drafting execution parameters. Code blocks prepared for deployment.` }
    ];

    for (const response of agentResponses) {
      await new Promise(r => setTimeout(r, 500));
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        type: 'agent' as const,
        sender: response.agent.name,
        content: response.content,
        timestamp: new Date(),
      }]);
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system' as const,
      content: 'Swarm consensus reached. Task queued for execution.',
      timestamp: new Date(),
    }]);

    setIsProcessing(false);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-black/40">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#66FF33]/20 border border-[#66FF33] flex items-center justify-center">
              <Users size={20} className="text-[#66FF33]" />
            </div>
            <div>
              <h2 className="text-white font-bold flex items-center gap-2">
                Swarm Nexus <span className="text-[10px] bg-[#66FF33]/20 text-[#66FF33] px-1.5 py-0.5 rounded border border-[#66FF33]/30">V 2.4</span>
              </h2>
              <p className="text-white/40 text-xs">
                {isProcessing ? 'Processing...' : 'Active'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "p-3 rounded-lg",
              msg.type === 'system' ? "bg-white/5 text-white/50 text-xs text-center" :
              msg.type === 'user' ? "bg-[#0066FF]/20 border border-[#0066FF]/30 ml-8" :
              "bg-[#39FF14]/10 border border-[#39FF14]/30 mr-8"
            )}>
              {'sender' in msg && <div className="text-xs font-bold text-[#39FF14] mb-1">{(msg as { sender: string }).sender}</div>}
              <p className="text-sm text-white/80">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter command for swarm..."
              className="flex-1 bg-black/40 border-white/20"
              disabled={isProcessing}
            />
            <Button type="submit" disabled={isProcessing} className="bg-[#39FF14] text-black hover:bg-[#32e612]">
              Send
            </Button>
          </div>
        </form>
      </div>

      {/* Agent Panel */}
      <div className="w-64 rounded-2xl border border-white/10 bg-black/40 p-4">
        <h3 className="font-bold text-white mb-4">Active Agents</h3>
        <div className="space-y-3">
          {SWARM_AGENTS.map(agent => (
            <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                style={{ backgroundColor: agent.color }}
              >
                {agent.avatar}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{agent.name}</div>
                <div className="text-[10px] text-white/40">{agent.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Admin Agents Component
const AdminAgents: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'builder' | 'swarm'>('list');
  const [templates, setTemplates] = useState<AgentTemplate[]>(INITIAL_TEMPLATES);
  const [editingAgent, setEditingAgent] = useState<AgentTemplate | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleEdit = (agent: AgentTemplate) => {
    setEditingAgent({ ...agent });
    setViewMode('builder');
  };

  const handleCreateNew = () => {
    setEditingAgent({
      id: `new_${Date.now()}`,
      name: 'New Agent',
      role: 'Role',
      industry: 'General',
      gender: 'non-binary',
      premium: false,
      status: 'draft',
      avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200&h=200',
      description: "Describe the agent's purpose...",
      personality: { empathy: 50, enthusiasm: 50, caution: 50, confidence: 50, style: 'Neutral' },
      voice: { id: 'sky', speed: 1.0, pitch: 1.0, tone: 'Neutral' },
      memory: { depth: 'Session', learning: 'None', reflection: 'None', dreamCycles: false },
      strategy: { proactive: false, analysis: 'Standard', risk: 'Balanced' },
      skills: [],
      metrics: { uptime: '0%', requests: '0', avgResponse: '0s' }
    });
    setViewMode('builder');
  };

  const handleSave = () => {
    if (editingAgent) {
      setTemplates(prev => {
        const exists = prev.find(p => p.id === editingAgent.id);
        if (exists) return prev.map(p => p.id === editingAgent.id ? editingAgent : p);
        return [...prev, editingAgent];
      });
      toast.success(`${editingAgent.name} settings have been updated in the neural registry.`);
      setViewMode('list');
    }
  };

  if (viewMode === 'swarm') {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setViewMode('list')} className="text-white/60 hover:text-white pl-0 hover:bg-transparent">
              <ArrowLeft size={20} className="mr-2" /> Back to Fleet
            </Button>
            <h2 className="text-2xl font-light text-white flex items-center gap-2">
              <Brain className="text-[#39FF14]" /> Swarm Intelligence
            </h2>
          </div>
        </div>
        <SwarmAIChat />
      </div>
    );
  }

  if (viewMode === 'builder' && editingAgent) {
    return (
      <div className="h-full flex flex-col p-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setViewMode('list')} className="text-white/60 hover:text-white">
              <ArrowLeft size={20} className="mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-white">{editingAgent.name}</h2>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-[#39FF14] text-black hover:bg-[#32e612]">
              <Save size={16} className="mr-2" /> Save Agent
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="p-6 rounded-xl border border-white/10 bg-black/40">
            <h3 className="font-bold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">Name</label>
                <Input 
                  value={editingAgent.name}
                  onChange={(e) => setEditingAgent({...editingAgent, name: e.target.value})}
                  className="bg-black/40 border-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Role</label>
                <Input 
                  value={editingAgent.role}
                  onChange={(e) => setEditingAgent({...editingAgent, role: e.target.value})}
                  className="bg-black/40 border-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Industry</label>
                <Input 
                  value={editingAgent.industry}
                  onChange={(e) => setEditingAgent({...editingAgent, industry: e.target.value})}
                  className="bg-black/40 border-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Description</label>
                <textarea 
                  value={editingAgent.description}
                  onChange={(e) => setEditingAgent({...editingAgent, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white text-sm min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Personality */}
          <div className="p-6 rounded-xl border border-white/10 bg-black/40">
            <h3 className="font-bold text-white mb-4">Personality Matrix</h3>
            <div className="space-y-4">
              {['empathy', 'enthusiasm', 'caution', 'confidence'].map((trait) => (
                <div key={trait}>
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span className="capitalize">{trait}</span>
                    <span className="text-[#39FF14]">{editingAgent.personality[trait as keyof typeof editingAgent.personality]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editingAgent.personality[trait as keyof typeof editingAgent.personality] as number}
                    onChange={(e) => setEditingAgent({
                      ...editingAgent,
                      personality: {
                        ...editingAgent.personality,
                        [trait]: Number(e.target.value)
                      }
                    })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2 max-w-[1920px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 shrink-0 gap-4">
        <div>
          <h2 className="text-3xl font-light text-white flex items-center gap-3">
            <Bot className="text-[#39FF14]" size={32} /> Agent Fleet Command
          </h2>
          <p className="text-white/40 mt-2 text-sm">
            Deploy, configure, and monitor your AI agent workforce.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setViewMode('swarm')}
            variant="outline"
            className="border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/10"
          >
            <Brain size={16} className="mr-2" /> Swarm Mode
          </Button>
          <Button onClick={handleCreateNew} className="bg-[#39FF14] text-black hover:bg-[#32e612]">
            <Plus size={16} className="mr-2" /> New Agent
          </Button>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((agent) => (
          <AgentCard 
            key={agent.id}
            agent={agent}
            onClick={() => handleEdit(agent)}
            active={selectedAgent === agent.id}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminAgents;
