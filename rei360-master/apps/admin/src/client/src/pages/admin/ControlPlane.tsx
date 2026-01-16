import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, Server, Database, Cloud, Cpu, HardDrive, Network,
  Shield, Zap, RefreshCw, Settings, AlertTriangle, CheckCircle,
  XCircle, Clock, TrendingUp, Users, Globe, Lock, Unlock,
  Play, Pause, RotateCcw, Wrench, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

interface ServiceStatus {
  id: string;
  name: string;
  status: "running" | "stopped" | "error" | "starting";
  uptime: string;
  cpu: number;
  memory: number;
  lastCheck: string;
}

interface AutoHealEvent {
  id: string;
  timestamp: string;
  type: "analyze" | "diagnose" | "fix" | "heal" | "validate" | "optimize" | "enhance" | "evolve";
  target: string;
  status: "success" | "failed" | "in_progress";
  message: string;
}

export default function ControlPlane() {
  const [autoHealEnabled, setAutoHealEnabled] = useState(true);
  const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(true);
  const [autoEvolveEnabled, setAutoEvolveEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [metrics] = useState<SystemMetric[]>([
    { name: "CPU Usage", value: 42, unit: "%", status: "healthy", trend: "stable" },
    { name: "Memory", value: 68, unit: "%", status: "healthy", trend: "up" },
    { name: "Disk I/O", value: 23, unit: "MB/s", status: "healthy", trend: "down" },
    { name: "Network", value: 156, unit: "Mbps", status: "healthy", trend: "up" },
    { name: "API Latency", value: 45, unit: "ms", status: "healthy", trend: "stable" },
    { name: "Error Rate", value: 0.02, unit: "%", status: "healthy", trend: "down" },
  ]);

  const [services] = useState<ServiceStatus[]>([
    { id: "api", name: "API Gateway", status: "running", uptime: "99.99%", cpu: 12, memory: 45, lastCheck: "2s ago" },
    { id: "db", name: "Database", status: "running", uptime: "99.97%", cpu: 8, memory: 62, lastCheck: "5s ago" },
    { id: "cache", name: "Redis Cache", status: "running", uptime: "100%", cpu: 3, memory: 28, lastCheck: "1s ago" },
    { id: "queue", name: "Message Queue", status: "running", uptime: "99.95%", cpu: 5, memory: 34, lastCheck: "3s ago" },
    { id: "ai", name: "AI Engine", status: "running", uptime: "99.92%", cpu: 45, memory: 78, lastCheck: "2s ago" },
    { id: "scraper", name: "Scraper Fleet", status: "running", uptime: "99.88%", cpu: 22, memory: 56, lastCheck: "4s ago" },
    { id: "voice", name: "Voice Pipeline", status: "running", uptime: "99.90%", cpu: 15, memory: 42, lastCheck: "6s ago" },
    { id: "email", name: "Email Service", status: "running", uptime: "99.94%", cpu: 6, memory: 31, lastCheck: "2s ago" },
  ]);

  const [autoHealEvents] = useState<AutoHealEvent[]>([
    { id: "1", timestamp: "2 min ago", type: "analyze", target: "API Gateway", status: "success", message: "Analyzed request patterns" },
    { id: "2", timestamp: "5 min ago", type: "optimize", target: "Database", status: "success", message: "Optimized query cache" },
    { id: "3", timestamp: "12 min ago", type: "heal", target: "Memory", status: "success", message: "Cleared stale connections" },
    { id: "4", timestamp: "18 min ago", type: "validate", target: "AI Engine", status: "success", message: "Validated model integrity" },
    { id: "5", timestamp: "25 min ago", type: "enhance", target: "Scraper Fleet", status: "success", message: "Enhanced anti-detection" },
  ]);

  const runSystemScan = async () => {
    setIsScanning(true);
    toast.info("Running full system scan...");
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsScanning(false);
    toast.success("System scan complete - All systems healthy");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "stopped": return <XCircle className="w-4 h-4 text-gray-500" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "starting": return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventTypeIcon = (type: AutoHealEvent["type"]) => {
    switch (type) {
      case "analyze": return <Eye className="w-4 h-4 text-blue-500" />;
      case "diagnose": return <Activity className="w-4 h-4 text-purple-500" />;
      case "fix": return <Wrench className="w-4 h-4 text-orange-500" />;
      case "heal": return <Shield className="w-4 h-4 text-green-500" />;
      case "validate": return <CheckCircle className="w-4 h-4 text-cyan-500" />;
      case "optimize": return <Zap className="w-4 h-4 text-yellow-500" />;
      case "enhance": return <TrendingUp className="w-4 h-4 text-pink-500" />;
      case "evolve": return <RefreshCw className="w-4 h-4 text-indigo-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Control Plane</h1>
          <p className="text-muted-foreground">System monitoring, auto-heal, and optimization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runSystemScan} disabled={isScanning}>
            {isScanning ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
            ) : (
              <><Activity className="w-4 h-4 mr-2" /> Run System Scan</>
            )}
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" /> Configure
          </Button>
        </div>
      </div>

      {/* Auto-Heal Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> Auto-Heal System
          </CardTitle>
          <CardDescription>Automatic analyze, diagnose, fix, heal, validate, optimize, enhance, evolve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Auto-Heal</span>
              </div>
              <Switch checked={autoHealEnabled} onCheckedChange={setAutoHealEnabled} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Auto-Optimize</span>
              </div>
              <Switch checked={autoOptimizeEnabled} onCheckedChange={setAutoOptimizeEnabled} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium">Auto-Evolve</span>
              </div>
              <Switch checked={autoEvolveEnabled} onCheckedChange={setAutoEvolveEnabled} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-green-500/10">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">System Status</span>
              </div>
              <Badge variant="default" className="bg-green-500">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" /> System Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metrics.map((metric) => (
                  <div key={metric.name} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{metric.name}</span>
                      <Badge variant={metric.status === "healthy" ? "default" : metric.status === "warning" ? "secondary" : "destructive"}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-sm text-muted-foreground mb-1">{metric.unit}</span>
                      {metric.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500 mb-1" />}
                      {metric.trend === "down" && <TrendingUp className="w-4 h-4 text-red-500 mb-1 rotate-180" />}
                    </div>
                    <Progress value={typeof metric.value === "number" ? Math.min(metric.value, 100) : 0} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" /> Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">Uptime: {service.uptime} • Last check: {service.lastCheck}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">CPU: {service.cpu}%</p>
                        <p className="text-xs text-muted-foreground">MEM: {service.memory}%</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {service.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Auto-Heal Events */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Auto-Heal Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {autoHealEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-2 p-2 rounded border">
                  {getEventTypeIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize">{event.type}</p>
                      <Badge variant={event.status === "success" ? "default" : event.status === "failed" ? "destructive" : "secondary"} className="text-xs">
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{event.message}</p>
                    <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Analyzing system...")}>
                <Eye className="w-4 h-4 mr-2" /> Analyze
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Diagnosing issues...")}>
                <Activity className="w-4 h-4 mr-2" /> Diagnose
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Applying fixes...")}>
                <Wrench className="w-4 h-4 mr-2" /> Fix Issues
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Healing system...")}>
                <Shield className="w-4 h-4 mr-2" /> Heal
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Validating...")}>
                <CheckCircle className="w-4 h-4 mr-2" /> Validate
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Optimizing...")}>
                <Zap className="w-4 h-4 mr-2" /> Optimize
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
