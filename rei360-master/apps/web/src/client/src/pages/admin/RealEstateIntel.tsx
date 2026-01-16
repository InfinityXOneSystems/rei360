import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  DollarSign,
  FileText,
  Home,
  MapPin,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function RealEstateIntel() {
  const stats = {
    activeLeads: 45,
    propertiesAnalyzed: 234,
    investmentScore: 78,
    marketTrend: "up",
    avgDaysOnMarket: 32,
    avgPriceChange: 4.2,
  };

  const properties = [
    {
      id: 1,
      address: "123 Oak Street, Austin, TX",
      price: 425000,
      type: "Single Family",
      beds: 3,
      baths: 2,
      sqft: 1850,
      investmentScore: 85,
      trend: "up",
      daysOnMarket: 12,
    },
    {
      id: 2,
      address: "456 Maple Ave, Dallas, TX",
      price: 315000,
      type: "Condo",
      beds: 2,
      baths: 2,
      sqft: 1200,
      investmentScore: 72,
      trend: "stable",
      daysOnMarket: 28,
    },
    {
      id: 3,
      address: "789 Pine Blvd, Houston, TX",
      price: 550000,
      type: "Single Family",
      beds: 4,
      baths: 3,
      sqft: 2400,
      investmentScore: 91,
      trend: "up",
      daysOnMarket: 5,
    },
    {
      id: 4,
      address: "321 Cedar Lane, San Antonio, TX",
      price: 275000,
      type: "Townhouse",
      beds: 2,
      baths: 2,
      sqft: 1400,
      investmentScore: 68,
      trend: "down",
      daysOnMarket: 45,
    },
  ];

  const marketTrends = [
    { region: "Austin Metro", change: 8.5, trend: "up", volume: 1234 },
    { region: "Dallas-Fort Worth", change: 5.2, trend: "up", volume: 2156 },
    { region: "Houston Metro", change: 3.8, trend: "up", volume: 1876 },
    { region: "San Antonio", change: -1.2, trend: "down", volume: 892 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Real Estate Intelligence</h1>
          <p className="text-muted-foreground">
            AI-powered property analysis and market insights
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search properties..." className="pl-9 w-64" />
          </div>
          <Button className="glow-blue">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLeads}</div>
          </CardContent>
        </Card>
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.propertiesAnalyzed}</div>
          </CardContent>
        </Card>
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.investmentScore}</div>
          </CardContent>
        </Card>
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-success">+{stats.avgPriceChange}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg DOM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDaysOnMarket}</div>
          </CardContent>
        </Card>
        <Card className="card-electric">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="market">Market Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Property Analysis
              </CardTitle>
              <CardDescription>AI-scored investment opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Home className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{property.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {property.type} • {property.beds} bed • {property.baths} bath •{" "}
                            {property.sqft.toLocaleString()} sqft
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-lg font-bold text-primary">
                              ${property.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {property.daysOnMarket} days on market
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-2xl font-bold ${
                                property.investmentScore >= 80
                                  ? "text-success"
                                  : property.investmentScore >= 60
                                    ? "text-warning"
                                    : "text-destructive"
                              }`}
                            >
                              {property.investmentScore}
                            </span>
                            {property.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : property.trend === "down" ? (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">Investment Score</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-1 h-4 w-4" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Regional Market Trends
              </CardTitle>
              <CardDescription>Price changes and volume analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends.map((market) => (
                  <div
                    key={market.region}
                    className="p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-medium">{market.region}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {market.volume.toLocaleString()} listings
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            market.trend === "up"
                              ? "border-success/50 text-success"
                              : "border-destructive/50 text-destructive"
                          }
                        >
                          {market.trend === "up" ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {market.change > 0 ? "+" : ""}
                          {market.change}%
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={Math.abs(market.change) * 10}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Reports</CardTitle>
              <CardDescription>AI-generated market analysis and property reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: "Market Analysis", type: "Weekly", generated: "2 hours ago" },
                  { name: "Investment Opportunities", type: "Daily", generated: "Today" },
                  { name: "Price Trend Report", type: "Monthly", generated: "Jan 1" },
                ].map((report) => (
                  <div
                    key={report.name}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">{report.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Generated: {report.generated}
                      </span>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
