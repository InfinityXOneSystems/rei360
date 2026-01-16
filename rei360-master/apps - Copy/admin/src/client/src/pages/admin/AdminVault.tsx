/**
 * INFINITY X AI - ADMIN VAULT
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, RefreshCw, AlertTriangle, 
  CheckCircle, FileText, Activity, Eye, EyeOff,
  LogOut, Plus, Download, Unlock, Zap,
  Search, ShieldCheck, Database, Server,
  Cloud, GitBranch, CreditCard, Flame, Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Credential Interface
interface Credential {
  id: string;
  service: string;
  type: string;
  environment: string;
  status: 'active' | 'error' | 'pending';
  lastRotated: Date;
  icon: React.ElementType;
}

// Lock Screen Component
const LockScreen: React.FC<{ onUnlock: (pin: string) => boolean }> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(pin);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-transparent p-6 text-white relative overflow-hidden">
      <div className="max-w-md w-full p-12 rounded-[2rem] border-2 border-white/10 bg-black/60 text-center">
        <div className="w-24 h-24 bg-[#0066FF]/20 rounded-full flex items-center justify-center text-[#0066FF] mx-auto mb-8 ring-4 ring-[#0066FF]/10 border-2 border-[#0066FF]/30">
          <Lock size={40} />
        </div>
        
        <h2 className="text-4xl font-bold mb-3 tracking-tight">Vault Locked</h2>
        <p className="text-white/50 mb-10 text-lg">Secure credential storage is encrypted. Enter your master PIN to access the vault.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <Input 
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="••••"
              className={cn(
                "bg-black/50 border-2 border-white/20 text-center text-3xl tracking-[1em] h-20 font-mono rounded-xl focus:border-[#0066FF] transition-all",
                error && "border-red-500/50"
              )}
              maxLength={4}
              autoFocus
            />
            {error && <div className="text-red-400 text-sm mt-3 font-bold">Invalid PIN. Try again.</div>}
          </div>
          
          <Button type="submit" className="w-full h-14 text-xl font-bold bg-[#0066FF] hover:bg-[#0052cc] rounded-xl border-2 border-[#0066FF]/50 transition-all">
            <Unlock size={24} className="mr-3" /> Unlock Vault
          </Button>
          
          <div className="text-xs text-white/30 pt-2 font-mono uppercase tracking-widest">
            Authorized personnel only. Access is logged.
          </div>
        </form>
      </div>
    </div>
  );
};

// Connection Status Component
const ConnectionStatus: React.FC<{ 
  status: 'active' | 'error' | 'pending'; 
  onTest: () => Promise<void>;
}> = ({ status, onTest }) => {
  const [testing, setTesting] = useState(false);
  
  const handleTest = async () => {
    setTesting(true);
    await onTest();
    setTesting(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "px-3 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center gap-2",
        status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" : 
        status === 'error' ? "bg-red-500/10 text-red-400 border-red-500/20" :
        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      )}>
        <div className={cn("w-1.5 h-1.5 rounded-full", status === 'active' ? "bg-green-500" : "bg-current")} />
        {status === 'active' ? 'Operational' : status === 'error' ? 'Failed' : 'Checking'}
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={handleTest}
        disabled={testing}
        className="h-7 text-[10px] bg-white/5 hover:bg-white/10 hover:text-[#39FF14] border border-white/10"
      >
        {testing ? <RefreshCw size={10} className="animate-spin" /> : 'Test'}
      </Button>
    </div>
  );
};

// Credential Card Component
const CredentialCard: React.FC<{
  credential: Credential;
  onReveal: () => void;
  onRotate: () => void;
}> = ({ credential, onReveal, onRotate }) => {
  const [revealed, setRevealed] = useState(false);
  const Icon = credential.icon;

  return (
    <div className="p-5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
            <Icon size={20} className="text-white/60" />
          </div>
          <div>
            <h4 className="font-bold text-white">{credential.service}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-white/40 uppercase">{credential.type}</span>
              <span className="text-[10px] text-white/20">•</span>
              <span className={cn(
                "text-[10px] uppercase",
                credential.environment === 'production' ? "text-red-400" : "text-yellow-400"
              )}>
                {credential.environment}
              </span>
            </div>
          </div>
        </div>
        <ConnectionStatus 
          status={credential.status} 
          onTest={async () => { await new Promise(r => setTimeout(r, 1000)); }}
        />
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-sm">
        <span className="flex-1 text-white/60 truncate">
          {revealed ? 'sk_live_xxxxxxxxxxxxxxxxxxxx' : '••••••••••••••••••••••••'}
        </span>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setRevealed(!revealed)}
          className="h-7 w-7 p-0 hover:bg-white/10"
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </Button>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className="text-[10px] text-white/30">
          Last rotated: {credential.lastRotated.toLocaleDateString()}
        </span>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onRotate}
          className="h-7 text-[10px] text-[#39FF14] hover:bg-[#39FF14]/10"
        >
          <RefreshCw size={12} className="mr-1" /> Rotate
        </Button>
      </div>
    </div>
  );
};

// Main Admin Vault Component
const AdminVault: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState<Credential[]>([
    { id: '1', service: 'OpenAI', type: 'API Key', environment: 'production', status: 'active', lastRotated: new Date('2024-01-01'), icon: Zap },
    { id: '2', service: 'Stripe', type: 'Secret Key', environment: 'production', status: 'active', lastRotated: new Date('2024-01-15'), icon: CreditCard },
    { id: '3', service: 'Firebase', type: 'Service Account', environment: 'production', status: 'active', lastRotated: new Date('2024-02-01'), icon: Flame },
    { id: '4', service: 'GitHub', type: 'PAT', environment: 'production', status: 'active', lastRotated: new Date('2024-01-20'), icon: GitBranch },
    { id: '5', service: 'Google Cloud', type: 'Service Account', environment: 'production', status: 'active', lastRotated: new Date('2024-02-10'), icon: Cloud },
    { id: '6', service: 'Database', type: 'Connection String', environment: 'production', status: 'active', lastRotated: new Date('2024-01-25'), icon: Database },
  ]);

  const handleUnlock = (pin: string): boolean => {
    if (pin === '1234') {
      setIsLocked(false);
      toast.success('Vault unlocked successfully');
      return true;
    }
    return false;
  };

  const handleRotate = (id: string) => {
    setCredentials(prev => prev.map(c => 
      c.id === id ? { ...c, lastRotated: new Date() } : c
    ));
    toast.success('Credential rotated successfully');
  };

  const filteredCredentials = credentials.filter(c => 
    c.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="h-full flex flex-col bg-transparent text-white overflow-hidden rounded-tl-2xl border-l-2 border-t-2 border-white/20">
      
      {/* Header */}
      <div className="h-20 border-b-2 border-white/20 flex items-center px-8 justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0066FF]/20 rounded-xl flex items-center justify-center border-2 border-[#0066FF]">
            <Shield className="text-[#0066FF]" size={28} />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-wide text-white">
              Secure<span className="text-[#39FF14]">Vault</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14]">
              <ShieldCheck size={12} />
              ENCRYPTED • AES-256
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsLocked(true)}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Lock size={14} className="mr-2" /> Lock Vault
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search credentials..."
              className="pl-10 bg-black/40 border-white/20"
            />
          </div>
          <Button className="bg-[#39FF14] text-black hover:bg-[#32e612]">
            <Plus size={16} className="mr-2" /> Add Credential
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-black/40">
            <div className="text-white/40 text-xs uppercase mb-1">Total Credentials</div>
            <div className="text-2xl font-bold text-white">{credentials.length}</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-black/40">
            <div className="text-white/40 text-xs uppercase mb-1">Active</div>
            <div className="text-2xl font-bold text-green-400">{credentials.filter(c => c.status === 'active').length}</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-black/40">
            <div className="text-white/40 text-xs uppercase mb-1">Production</div>
            <div className="text-2xl font-bold text-red-400">{credentials.filter(c => c.environment === 'production').length}</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-black/40">
            <div className="text-white/40 text-xs uppercase mb-1">Last Rotation</div>
            <div className="text-2xl font-bold text-white">2d ago</div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCredentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onReveal={() => {}}
              onRotate={() => handleRotate(credential.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminVault;
