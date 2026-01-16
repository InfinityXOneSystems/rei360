/**
 * INFINITY X AI - ADMIN LIVE DATA
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Zap, AlertTriangle, 
  TrendingUp, TrendingDown, Globe, Shield, 
  Pause, Play, FileJson, FileText,
  Brain, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Sparkline Chart Component
const Sparkline: React.FC<{ data: number[]; color?: string; height?: number }> = ({ 
  data, 
  color = "#39FF14", 
  height = 40 
}) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const gradientId = `grad-${color.replace('#', '')}`;

  return (
    <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path 
        d={`M0,100 L0,${100 - ((data[0] - min) / range) * 100} ${points.split(' ').map((p) => `L${p}`).join(' ')} L100,100 Z`} 
        fill={`url(#${gradientId})`} 
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
  trend: string;
  chartData: number[];
  color?: 'green' | 'blue' | 'red' | 'yellow';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  subtext, 
  trend, 
  chartData, 
  color = "green" 
}) => {
  const colorMap = {
    green: { text: "text-[#39FF14]", border: "border-[#39FF14]", chart: "#39FF14" },
    blue: { text: "text-[#0066FF]", border: "border-[#0066FF]", chart: "#0066FF" },
    red: { text: "text-red-500", border: "border-red-500", chart: "#EF4444" },
    yellow: { text: "text-yellow-500", border: "border-yellow-500", chart: "#EAB308" }
  };
  
  const theme = colorMap[color];

  return (
    <div className="p-4 rounded-xl bg-[#111] border border-white/10 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <div className="text-white/40 text-xs uppercase font-bold tracking-wider">{label}</div>
          <div className="text-2xl font-bold text-white mt-1">{value}</div>
        </div>
        <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold border bg-opacity-10", theme.text, theme.border)}>
          {trend}
        </div>
      </div>
      <div className="text-[10px] text-white/30 font-mono mb-3 relative z-10">{subtext}</div>
      <div className="h-10 w-full opacity-50 group-hover:opacity-100 transition-opacity relative z-10">
        <Sparkline data={chartData} color={theme.chart} />
      </div>
    </div>
  );
};

// System Log Entry
interface LogEntry {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  message: string;
  timestamp: Date;
}

const AdminLiveData: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([
    { id: 1, type: 'system', message: 'Admin Live Data initialized', timestamp: new Date() },
    { id: 2, type: 'success', message: 'All systems operational', timestamp: new Date() },
  ]);
  
  const [metrics, setMetrics] = useState({
    apiRequests: 0,
    errorRate: 0,
    latency: 0,
    activeUsers: 0
  });

  const [charts, setCharts] = useState({
    requests: Array(20).fill(0),
    latency: Array(20).fill(0),
    errors: Array(20).fill(0)
  });

  // Simulation Engine
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newRequests = Math.floor(Math.random() * 500) + 1200;
      const newLatency = Math.floor(Math.random() * 50) + 20;
      const newErrorRate = (Math.random() * 0.5).toFixed(2);
      
      setMetrics({
        apiRequests: newRequests,
        latency: newLatency,
        errorRate: parseFloat(newErrorRate),
        activeUsers: Math.floor(Math.random() * 50) + 850
      });

      setCharts(prev => ({
        requests: [...prev.requests.slice(1), newRequests],
        latency: [...prev.latency.slice(1), newLatency],
        errors: [...prev.errors.slice(1), parseFloat(newErrorRate)]
      }));

      // Add random log entry
      if (Math.random() > 0.7) {
        const logTypes: LogEntry['type'][] = ['info', 'success', 'warning', 'system'];
        const messages = [
          'API request processed',
          'Cache refreshed',
          'New user session started',
          'Database query optimized',
          'Webhook delivered successfully',
          'Rate limit check passed'
        ];
        setSystemLogs(prev => [
          ...prev.slice(-50),
          {
            id: Date.now(),
            type: logTypes[Math.floor(Math.random() * logTypes.length)],
            message: messages[Math.floor(Math.random() * messages.length)],
            timestamp: new Date()
          }
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="h-full flex flex-col bg-transparent text-white overflow-hidden rounded-tl-2xl border-l-2 border-t-2 border-white/20">
      
      {/* Header */}
      <div className="h-20 border-b-2 border-white/20 flex items-center px-8 justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#39FF14]/10 rounded-xl flex items-center justify-center border-2 border-[#39FF14]">
            <Activity className="text-[#39FF14]" size={28} />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-wide text-white">
              Live<span className="text-[#39FF14]">Operations</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14]/80">
              <span className={cn("w-2 h-2 rounded-full", isLive ? "bg-[#39FF14]" : "bg-red-500")} />
              {isLive ? 'SYSTEM ONLINE • OBSERVABILITY ACTIVE' : 'FEED PAUSED'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsLive(!isLive)}
            className={cn("border-white/20 gap-2", isLive ? "text-[#39FF14]" : "text-yellow-500")}
          >
            {isLive ? <Pause size={14} /> : <Play size={14} />}
            {isLive ? 'Pause Feed' : 'Resume Feed'}
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-transparent space-y-6">
        
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="API Requests / sec" 
            value={metrics.apiRequests} 
            subtext="Total inbound traffic" 
            trend="+12%" 
            chartData={charts.requests} 
            color="blue"
          />
          <MetricCard 
            label="Avg Latency (ms)" 
            value={metrics.latency} 
            subtext="Global edge response" 
            trend="-5ms" 
            chartData={charts.latency} 
            color="green"
          />
          <MetricCard 
            label="Error Rate (%)" 
            value={metrics.errorRate} 
            subtext="5xx Server Errors" 
            trend="Stable" 
            chartData={charts.errors} 
            color="red"
          />
          <MetricCard 
            label="Active Users" 
            value={metrics.activeUsers} 
            subtext="Currently Online" 
            trend="+45" 
            chartData={charts.requests} 
            color="yellow"
          />
        </div>

        {/* System Log Stream */}
        <div className="p-6 rounded-xl border border-white/10 bg-black/40 h-[400px] flex flex-col">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="text-[#39FF14]" size={18} /> Admin-Only Event Stream
          </h3>
          <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 p-2 bg-black/50 rounded-lg border border-white/5">
            {systemLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/30 italic">
                Waiting for system events...
              </div>
            ) : (
              systemLogs.map((log) => (
                <div 
                  key={log.id}
                  className="flex gap-3 pb-1 border-b border-white/5 last:border-0"
                >
                  <span className="text-white/30 shrink-0 select-none">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className={cn(
                    "uppercase font-bold shrink-0 w-16",
                    log.type === 'error' ? "text-red-500" :
                    log.type === 'warning' ? "text-yellow-500" :
                    log.type === 'success' ? "text-green-500" :
                    log.type === 'system' ? "text-blue-400" :
                    "text-white/60"
                  )}>
                    {log.type}
                  </span>
                  <span className="text-white/80">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveData;
