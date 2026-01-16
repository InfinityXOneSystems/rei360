/**
 * INFINITY X AI - ADMIN SEO DASHBOARD
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState } from 'react';
import { 
  Search, TrendingUp, Globe, Link, FileText,
  AlertTriangle, CheckCircle, RefreshCw, ExternalLink,
  BarChart2, Eye, MousePointer, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SEOMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

interface PageAnalysis {
  url: string;
  title: string;
  score: number;
  issues: string[];
  lastCrawled: Date;
}

const METRICS: SEOMetric[] = [
  { label: 'Domain Authority', value: 45, change: '+3', trend: 'up', icon: Globe },
  { label: 'Organic Traffic', value: '12.4K', change: '+18%', trend: 'up', icon: TrendingUp },
  { label: 'Indexed Pages', value: 847, change: '+12', trend: 'up', icon: FileText },
  { label: 'Avg. Position', value: 14.2, change: '-2.1', trend: 'up', icon: BarChart2 },
];

const PAGES: PageAnalysis[] = [
  { url: '/', title: 'Home', score: 92, issues: [], lastCrawled: new Date() },
  { url: '/services', title: 'Services', score: 87, issues: ['Missing meta description'], lastCrawled: new Date() },
  { url: '/about', title: 'About Us', score: 78, issues: ['Images missing alt text', 'H1 tag missing'], lastCrawled: new Date() },
  { url: '/contact', title: 'Contact', score: 95, issues: [], lastCrawled: new Date() },
  { url: '/blog', title: 'Blog', score: 65, issues: ['Slow page load', 'Missing structured data', 'Thin content'], lastCrawled: new Date() },
];

const MetricCard: React.FC<{ metric: SEOMetric }> = ({ metric }) => {
  const Icon = metric.icon;
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-black/40">
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} className="text-white/40" />
        <span className={cn(
          "text-xs font-bold",
          metric.trend === 'up' ? "text-green-400" : metric.trend === 'down' ? "text-red-400" : "text-white/40"
        )}>
          {metric.change}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">{metric.value}</div>
      <div className="text-xs text-white/40 mt-1">{metric.label}</div>
    </div>
  );
};

const PageRow: React.FC<{ page: PageAnalysis }> = ({ page }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border text-sm font-bold", getScoreColor(page.score))}>
            {page.score}
          </div>
          <div>
            <h4 className="font-bold text-white">{page.title}</h4>
            <code className="text-xs text-white/40">{page.url}</code>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]">
          <ExternalLink size={12} className="mr-1" /> View
        </Button>
      </div>

      {page.issues.length > 0 ? (
        <div className="space-y-1">
          {page.issues.map((issue, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-yellow-400">
              <AlertTriangle size={12} />
              {issue}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle size={12} />
          No issues found
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-white/30">
        Last crawled: {page.lastCrawled.toLocaleString()}
      </div>
    </div>
  );
};

const AdminSEODashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [crawling, setCrawling] = useState(false);

  const handleCrawl = async () => {
    setCrawling(true);
    toast.info('Starting site crawl...');
    await new Promise(r => setTimeout(r, 3000));
    setCrawling(false);
    toast.success('Site crawl completed');
  };

  const filteredPages = PAGES.filter(p => 
    p.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-transparent text-white overflow-hidden rounded-tl-2xl border-l-2 border-t-2 border-white/20">
      
      {/* Header */}
      <div className="h-20 border-b-2 border-white/20 flex items-center px-8 justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border-2 border-green-500">
            <Search className="text-green-400" size={28} />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-wide text-white">
              SEO<span className="text-green-400">Manager</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-white/40">
              <Globe size={12} />
              Domain Health Monitor
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleCrawl}
          disabled={crawling}
          className="bg-[#39FF14] text-black hover:bg-[#32e612]"
        >
          {crawling ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
          {crawling ? 'Crawling...' : 'Run Crawl'}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((metric, i) => (
            <MetricCard key={i} metric={metric} />
          ))}
        </div>

        {/* Page Analysis */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Page Analysis</h2>
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="pl-10 bg-black/40 border-white/20 h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPages.map((page, i) => (
              <PageRow key={i} page={page} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSEODashboard;
