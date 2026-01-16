/**
 * INFINITY X AI - ADMIN CONTROL PLANE
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { 
  Users, Database, Settings, Lock, Terminal, Server, 
  Menu, Bell, Search, Shield, Activity, LogOut,
  ChevronRight, ChevronLeft, GitMerge, FileText,
  LayoutDashboard, Globe, Code2, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Admin Components
import AdminSidebar from './AdminSidebar';
import AdminLiveData from './AdminLiveData';
import AdminIntegrationHub from './AdminIntegrationHub';
import AdminContractViewer from './AdminContractViewer';
import AdminSEODashboard from './AdminSEODashboard';
import AdminIDE from './AdminIDE';
import AdminAgents from './AdminAgents';
import AdminVault from './AdminVault';
import AdminVisionCortex from './AdminVisionCortex';

const AdminPage = () => {
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <AdminLiveData />;
      case 'integrations': 
        return <AdminIntegrationHub />;
      case 'contracts': 
        return <AdminContractViewer />;
      case 'seo': 
        return <AdminSEODashboard />;
      case 'ide': 
        return <AdminIDE />;
      case 'agents':
        return <AdminAgents />;
      case 'vault':
        return <AdminVault />;
      case 'cortex':
        return <AdminVisionCortex />;
      default: 
        return (
          <div className="p-8 text-center text-white/40">
            Module {activeTab} coming soon.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        handleLogout={handleLogout}
      />

      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-80" : "lg:ml-20"
      )}>
        {/* Header */}
        <header className="h-20 border-b-2 border-white/10 bg-black/40 sticky top-0 z-30 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center text-sm text-white/40">
              <span className="uppercase tracking-widest font-bold text-xs">System:</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 text-[10px] font-bold">
                ONLINE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user?.name || 'Admin'}</div>
              <div className="text-[10px] text-white/40 uppercase">Root Access</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0066FF] to-[#39FF14] border border-white/20" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
