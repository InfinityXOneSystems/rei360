import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Database,
  GitBranch,
  HardDrive,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Server,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";

type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";

interface Service {
  name: string;
  component: string;
  status: ServiceStatus;
  responseTime: number;
  uptime: string;
  lastCheck: string;
  errorCount: number;
}

export default function SystemStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const services: Service[] = [
    {
      name: "Cloud Run",
      component: "API Gateway",
      status: "healthy",
      responseTime: 45,
      uptime: "99.99%",
      lastCheck: "Just now",
      errorCount: 0,
    },
    {
      name: "Cloud Run",
      component: "Worker Service",
      status: "healthy",
      responseTime: 120,
      uptime: "99.98%",
      lastCheck: "Just now",
      errorCount: 0,
    },
    {
      name: "Firestore",
      component: "Primary Database",
      status: "healthy",
      responseTime: 12,
      uptime: "99.99%",
      lastCheck: "Just now",
      errorCount: 0,
    },
    {
      name: "Pub/Sub",
      component: "Message Queue",
      status: "healthy",
      responseTime: 8,
      uptime: "100%",
      lastCheck: "Just now",
      errorCount: 0,
    },
    {
      name: "Vertex AI",
      component: "LLM Endpoint",
      status: "healthy",
      responseTime: 850,
      uptime: "99.95%",
      lastCheck: "Just now",
      errorCount: 0,
    },
    {
      name: "Voice Pipeline",
      component: "Dialogflow CX",
      status: "healthy",
      responseTime: 230,
      uptime: "99.97%",
      lastCheck: "Just now",
      errorCount: 0,
    },
    {
      name: "Email Pipeline",
      component: "Gmail + Vertex AI",
      status: "healthy",
      responseTime: 180,
      uptime: "99.96%",
      lastCheck: "Just now",
      errorCount: 0,
    },
    {
      name: "DocSync",
      component: "Sync Engine",
      status: "healthy",
      responseTime: 95,
      uptime: "99.94%",
      lastCheck: "Just now",
      errorCount: 0,
    },
    {
      name: "GitHub Actions",
      component: "CI/CD Pipeline",
      status: "healthy",
      responseTime: 0,
      uptime: "99.90%",
      lastCheck: "2 min ago",
      errorCount: 0,
    },
    {
      name: "Storage",
      component: "Cloud Storage",
      status: "healthy",
      responseTime: 25,
      uptime: "99.99%",
      lastCheck: "Just now",
      errorCount: 0,
    },
  ];

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "down":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getServiceIcon = (name: string) => {
    switch (name) {
      case "Cloud Run":
        return <Cloud className="h-4 w-4" />;
      case "Firestore":
        return <Database className="h-4 w-4" />;
      case "Pub/Sub":
        return <MessageSquare className="h-4 w-4" />;
      case "Vertex AI":
        return <Zap className="h-4 w-4" />;
      case "Voice Pipeline":
        return <Phone className="h-4 w-4" />;
      case "Email Pipeline":
        return <Mail className="h-4 w-4" />;
      case "DocSync":
        return <RefreshCw className="h-4 w-4" />;
      case "GitHub Actions":
        return <GitBranch className="h-4 w-4" />;
      case "Storage":
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const downCount = services.filter((s) => s.status === "down").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of all Google Cloud services
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh Status
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">Monitored endpoints</p>
          </CardContent>
        </Card>
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{healthyCount}</div>
            <Progress
              value={(healthyCount / services.length) * 100}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Degraded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{degradedCount}</div>
            <Progress
              value={(degradedCount / services.length) * 100}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Down
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{downCount}</div>
            <Progress
              value={(downCount / services.length) * 100}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Service Health
          </CardTitle>
          <CardDescription>
            Detailed status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(service.status)}
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getServiceIcon(service.name)}
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.component}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">
                      {service.responseTime > 0
                        ? `${service.responseTime}ms`
                        : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">Response</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">{service.uptime}</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium">{service.lastCheck}</p>
                    <p className="text-xs text-muted-foreground">Last check</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      service.status === "healthy"
                        ? "border-success/50 text-success"
                        : service.status === "degraded"
                          ? "border-warning/50 text-warning"
                          : "border-destructive/50 text-destructive"
                    }
                  >
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operator Console */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Operator Console
          </CardTitle>
          <CardDescription>
            Administrative actions for system management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <RefreshCw className="h-5 w-5" />
              <span className="text-xs">Restart Services</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <GitBranch className="h-5 w-5" />
              <span className="text-xs">Rollback Deploy</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Database className="h-5 w-5" />
              <span className="text-xs">Rebuild Index</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Replay Events</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Activity className="h-5 w-5" />
              <span className="text-xs">Drain Queues</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <HardDrive className="h-5 w-5" />
              <span className="text-xs">Rotate Secrets</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
