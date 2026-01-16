import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Building2,
  CreditCard,
  FileText,
  Mail,
  Phone,
  ShoppingBag,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const systemMetrics = [
    {
      title: "Active Leads",
      value: "247",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      path: "/admin/leads",
    },
    {
      title: "Voice Calls Today",
      value: "38",
      change: "+8%",
      changeType: "positive" as const,
      icon: Phone,
      path: "/admin/voice",
    },
    {
      title: "Emails Processed",
      value: "156",
      change: "+23%",
      changeType: "positive" as const,
      icon: Mail,
      path: "/admin/email",
    },
    {
      title: "Active Listings",
      value: "89",
      change: "+5%",
      changeType: "positive" as const,
      icon: ShoppingBag,
      path: "/admin/garage-sale",
    },
  ];

  const systemStatus = [
    { name: "Cloud Run Services", status: "healthy", uptime: "99.99%" },
    { name: "Firestore Database", status: "healthy", uptime: "99.98%" },
    { name: "Pub/Sub Messaging", status: "healthy", uptime: "100%" },
    { name: "Voice Pipeline", status: "healthy", uptime: "99.95%" },
    { name: "Email Pipeline", status: "healthy", uptime: "99.97%" },
    { name: "DocSync Engine", status: "healthy", uptime: "99.96%" },
  ];

  const recentActivities = [
    {
      type: "lead",
      message: "New lead captured from website form",
      time: "2 min ago",
      icon: Users,
    },
    {
      type: "voice",
      message: "AI completed outbound call to John Smith",
      time: "5 min ago",
      icon: Phone,
    },
    {
      type: "email",
      message: "Follow-up sequence triggered for 12 leads",
      time: "8 min ago",
      icon: Mail,
    },
    {
      type: "doc",
      message: "Contract auto-generated for Deal #4521",
      time: "15 min ago",
      icon: FileText,
    },
    {
      type: "listing",
      message: "3 items posted to Facebook Marketplace",
      time: "22 min ago",
      icon: ShoppingBag,
    },
  ];

  const intelligenceModules = [
    {
      title: "Real Estate Intelligence",
      description: "Property analysis & market trends",
      active: true,
      leads: 45,
      icon: Building2,
      path: "/admin/real-estate",
    },
    {
      title: "Loan Intelligence",
      description: "Qualification & rate comparison",
      active: true,
      leads: 28,
      icon: CreditCard,
      path: "/admin/loans",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient-electric">
            Command Center
          </h1>
          <p className="text-muted-foreground">
            Universal Autonomous System Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="control-auto">
            <Zap className="mr-1 h-3 w-3" />
            Full Auto Mode
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setLocation("/admin/status")}>
            <Activity className="mr-2 h-4 w-4" />
            System Health
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric) => (
          <Card
            key={metric.title}
            className="card-electric cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setLocation(metric.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p
                className={`text-xs ${metric.changeType === "positive" ? "text-success" : "text-destructive"}`}
              >
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {metric.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription>
              Real-time health monitoring of all services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        service.status === "healthy"
                          ? "status-healthy"
                          : service.status === "degraded"
                            ? "status-degraded"
                            : "status-down"
                      }`}
                    />
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {service.uptime} uptime
                    </span>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent" />
              AI Activity Feed
            </CardTitle>
            <CardDescription>Latest autonomous actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Modules */}
      <div className="grid gap-4 md:grid-cols-2">
        {intelligenceModules.map((module) => (
          <Card
            key={module.title}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setLocation(module.path)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <module.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{module.leads}</p>
                  <p className="text-xs text-muted-foreground">Active leads</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    module.active
                      ? "border-success/50 text-success"
                      : "border-muted"
                  }
                >
                  {module.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Progress value={75} className="mt-4 h-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Automation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Autonomous Workflow Pipeline
          </CardTitle>
          <CardDescription>
            End-to-end business automation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-7">
            {[
              { name: "Lead Capture", status: "active", count: 12 },
              { name: "Qualification", status: "active", count: 8 },
              { name: "Outreach", status: "active", count: 15 },
              { name: "Scheduling", status: "active", count: 5 },
              { name: "Delivery", status: "active", count: 3 },
              { name: "Billing", status: "active", count: 2 },
              { name: "Retention", status: "active", count: 45 },
            ].map((stage, index) => (
              <div key={stage.name} className="text-center">
                <div
                  className={`h-12 w-12 mx-auto rounded-full flex items-center justify-center ${
                    stage.status === "active"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="text-sm font-bold">{stage.count}</span>
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  {stage.name}
                </p>
                {index < 6 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-full h-0.5 bg-border -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
