/**
 * INFINITY X AI - ADMIN CONTRACT VIEWER (API Contracts)
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState } from 'react';
import { 
  Database, FileJson, Code2, Copy, Check,
  ChevronRight, ChevronDown, Search, Filter,
  ExternalLink, Play, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  tags: string[];
  requestBody?: object;
  responseBody?: object;
}

const ENDPOINTS: Endpoint[] = [
  { 
    id: '1', 
    method: 'GET', 
    path: '/api/leads', 
    description: 'List all leads with pagination',
    tags: ['Leads', 'CRM'],
    responseBody: { leads: [], total: 0, page: 1, limit: 20 }
  },
  { 
    id: '2', 
    method: 'POST', 
    path: '/api/leads', 
    description: 'Create a new lead',
    tags: ['Leads', 'CRM'],
    requestBody: { name: 'string', email: 'string', phone: 'string' },
    responseBody: { id: 'string', success: true }
  },
  { 
    id: '3', 
    method: 'GET', 
    path: '/api/documents', 
    description: 'List all documents',
    tags: ['DocSync', 'Storage'],
    responseBody: { documents: [], total: 0 }
  },
  { 
    id: '4', 
    method: 'POST', 
    path: '/api/documents/sync', 
    description: 'Trigger document synchronization',
    tags: ['DocSync', 'Sync'],
    requestBody: { source: 'string', destination: 'string' },
    responseBody: { jobId: 'string', status: 'pending' }
  },
  { 
    id: '5', 
    method: 'POST', 
    path: '/api/voice/call', 
    description: 'Initiate outbound voice call',
    tags: ['Voice', 'Twilio'],
    requestBody: { to: 'string', script: 'string' },
    responseBody: { callSid: 'string', status: 'initiated' }
  },
  { 
    id: '6', 
    method: 'POST', 
    path: '/api/email/send', 
    description: 'Send email via SendGrid',
    tags: ['Email', 'SendGrid'],
    requestBody: { to: 'string', subject: 'string', body: 'string' },
    responseBody: { messageId: 'string', status: 'sent' }
  },
];

const MethodBadge: React.FC<{ method: Endpoint['method'] }> = ({ method }) => {
  const colors = {
    GET: 'bg-green-500/20 text-green-400 border-green-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
    PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", colors[method])}>
      {method}
    </span>
  );
};

const EndpointCard: React.FC<{
  endpoint: Endpoint;
  expanded: boolean;
  onToggle: () => void;
}> = ({ endpoint, expanded, onToggle }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Path copied to clipboard');
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
      >
        {expanded ? <ChevronDown size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
        <MethodBadge method={endpoint.method} />
        <code className="text-sm text-white font-mono flex-1 text-left">{endpoint.path}</code>
        <span className="text-xs text-white/40 hidden md:block">{endpoint.description}</span>
      </button>

      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">{endpoint.description}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleCopy} className="h-7">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
              <Button size="sm" className="h-7 bg-[#39FF14] text-black hover:bg-[#32e612]">
                <Play size={12} className="mr-1" /> Try it
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {endpoint.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/60 border border-white/10">
                {tag}
              </span>
            ))}
          </div>

          {endpoint.requestBody && (
            <div>
              <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Request Body</h4>
              <pre className="p-3 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-white/80 overflow-x-auto">
                {JSON.stringify(endpoint.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {endpoint.responseBody && (
            <div>
              <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Response</h4>
              <pre className="p-3 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-white/80 overflow-x-auto">
                {JSON.stringify(endpoint.responseBody, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminContractViewer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = ['all', ...Array.from(new Set(ENDPOINTS.flatMap(e => e.tags)))];

  const filteredEndpoints = ENDPOINTS.filter(e => {
    const matchesSearch = e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || e.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="h-full flex flex-col bg-transparent text-white overflow-hidden rounded-tl-2xl border-l-2 border-t-2 border-white/20">
      
      {/* Header */}
      <div className="h-20 border-b-2 border-white/20 flex items-center px-8 justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border-2 border-blue-500">
            <Database className="text-blue-400" size={28} />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-wide text-white">
              API<span className="text-blue-400">Contracts</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-white/40">
              <FileJson size={12} />
              {ENDPOINTS.length} Endpoints
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search endpoints..."
              className="pl-10 bg-black/40 border-white/20"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  selectedTag === tag 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-3">
          {filteredEndpoints.map((endpoint) => (
            <EndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              expanded={expandedId === endpoint.id}
              onToggle={() => setExpandedId(expandedId === endpoint.id ? null : endpoint.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminContractViewer;
