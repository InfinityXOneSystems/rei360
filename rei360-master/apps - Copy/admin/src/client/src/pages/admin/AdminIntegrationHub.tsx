/**
 * INFINITY X AI - ADMIN INTEGRATION HUB (Connectors)
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState } from 'react';
import { 
  Zap, Check, X, RefreshCw, Settings, 
  ExternalLink, Shield, Activity, Plus,
  Cloud, Database, CreditCard, Mail,
  MessageSquare, Phone, Calendar, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'error';
  category: string;
  lastSync?: Date;
}

const INTEGRATIONS: Integration[] = [
  { id: 'google', name: 'Google Cloud', description: 'GCP services, Vertex AI, Firestore', icon: Cloud, status: 'connected', category: 'Cloud', lastSync: new Date() },
  { id: 'stripe', name: 'Stripe', description: 'Payment processing, subscriptions', icon: CreditCard, status: 'connected', category: 'Payments', lastSync: new Date() },
  { id: 'twilio', name: 'Twilio', description: 'Voice, SMS, WhatsApp messaging', icon: Phone, status: 'connected', category: 'Communications', lastSync: new Date() },
  { id: 'sendgrid', name: 'SendGrid', description: 'Email delivery, templates', icon: Mail, status: 'connected', category: 'Communications', lastSync: new Date() },
  { id: 'firebase', name: 'Firebase', description: 'Auth, Realtime DB, Analytics', icon: Database, status: 'connected', category: 'Backend', lastSync: new Date() },
  { id: 'slack', name: 'Slack', description: 'Team notifications, alerts', icon: MessageSquare, status: 'disconnected', category: 'Communications' },
  { id: 'calendar', name: 'Google Calendar', description: 'Scheduling, appointments', icon: Calendar, status: 'connected', category: 'Productivity', lastSync: new Date() },
  { id: 'drive', name: 'Google Drive', description: 'Document storage, sync', icon: FileText, status: 'connected', category: 'Storage', lastSync: new Date() },
];

const IntegrationCard: React.FC<{
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}> = ({ integration, onConnect, onDisconnect, onSync }) => {
  const [syncing, setSyncing] = useState(false);
  const Icon = integration.icon;

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    onSync();
    setSyncing(false);
  };

  return (
    <div className={cn(
      "p-5 rounded-xl border transition-all",
      integration.status === 'connected' 
        ? "border-[#39FF14]/30 bg-[#39FF14]/5" 
        : integration.status === 'error'
        ? "border-red-500/30 bg-red-500/5"
        : "border-white/10 bg-black/40"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border",
            integration.status === 'connected' 
              ? "bg-[#39FF14]/10 border-[#39FF14]/30" 
              : "bg-white/5 border-white/10"
          )}>
            <Icon size={24} className={integration.status === 'connected' ? "text-[#39FF14]" : "text-white/60"} />
          </div>
          <div>
            <h4 className="font-bold text-white">{integration.name}</h4>
            <p className="text-xs text-white/40">{integration.description}</p>
          </div>
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1",
          integration.status === 'connected' 
            ? "bg-[#39FF14]/20 text-[#39FF14]" 
            : integration.status === 'error'
            ? "bg-red-500/20 text-red-400"
            : "bg-white/10 text-white/40"
        )}>
          {integration.status === 'connected' ? <Check size={10} /> : <X size={10} />}
          {integration.status}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        {integration.lastSync && (
          <span className="text-[10px] text-white/30">
            Last sync: {integration.lastSync.toLocaleTimeString()}
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          {integration.status === 'connected' ? (
            <>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleSync}
                disabled={syncing}
                className="h-7 text-[10px] hover:bg-white/10"
              >
                {syncing ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span className="ml-1">Sync</span>
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onDisconnect}
                className="h-7 text-[10px] text-red-400 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              onClick={onConnect}
              className="h-7 text-[10px] bg-[#39FF14] text-black hover:bg-[#32e612]"
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminIntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category)))];

  const filteredIntegrations = filter === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === filter);

  const handleConnect = (id: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, status: 'connected' as const, lastSync: new Date() } : i
    ));
    toast.success('Integration connected successfully');
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, status: 'disconnected' as const, lastSync: undefined } : i
    ));
    toast.success('Integration disconnected');
  };

  const handleSync = (id: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, lastSync: new Date() } : i
    ));
    toast.success('Sync completed');
  };

  return (
    <div className="h-full flex flex-col bg-transparent text-white overflow-hidden rounded-tl-2xl border-l-2 border-t-2 border-white/20">
      
      {/* Header */}
      <div className="h-20 border-b-2 border-white/20 flex items-center px-8 justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border-2 border-yellow-500">
            <Zap className="text-yellow-400" size={28} />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-wide text-white">
              Integration<span className="text-yellow-400">Hub</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-white/40">
              <Activity size={12} />
              {integrations.filter(i => i.status === 'connected').length} / {integrations.length} Connected
            </div>
          </div>
        </div>
        
        <Button className="bg-[#39FF14] text-black hover:bg-[#32e612]">
          <Plus size={16} className="mr-2" /> Add Integration
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filter === cat 
                  ? "bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30" 
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={() => handleConnect(integration.id)}
              onDisconnect={() => handleDisconnect(integration.id)}
              onSync={() => handleSync(integration.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminIntegrationHub;
