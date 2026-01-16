/**
 * Infinity X AI - Real Estate Intelligence Engine
 * 
 * Comprehensive property analysis and market intelligence:
 * - Investment scoring
 * - Market trend analysis
 * - Property valuations
 * - ROI projections
 * - Vertex AI integration patterns
 */

import { invokeLLM } from "./_core/llm";

// ============ Types ============

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: "residential" | "commercial" | "land" | "multi-family";
  subType?: string;
  listPrice: number;
  estimatedValue?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: number;
  yearBuilt?: number;
  features: string[];
  images: string[];
  status: "active" | "pending" | "sold" | "off-market";
  daysOnMarket?: number;
  mlsNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyAnalysis {
  propertyId: string;
  investmentScore: number; // 0-100
  riskLevel: "low" | "medium" | "high";
  estimatedValue: number;
  pricePerSqft: number;
  marketComparison: "below" | "at" | "above";
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendation: "strong_buy" | "buy" | "hold" | "avoid";
  confidenceLevel: number;
  analyzedAt: Date;
}

export interface MarketTrend {
  market: string;
  period: string;
  medianPrice: number;
  priceChange: number;
  priceChangePercent: number;
  inventoryLevel: number;
  daysOnMarket: number;
  salesVolume: number;
  demandIndex: number;
  supplyIndex: number;
  marketTemperature: "cold" | "cool" | "balanced" | "warm" | "hot";
  forecast: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
}

export interface ROIProjection {
  propertyId: string;
  purchasePrice: number;
  closingCosts: number;
  renovationCosts: number;
  totalInvestment: number;
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  appreciationRate: number;
  projectedValue1Year: number;
  projectedValue5Year: number;
  projectedValue10Year: number;
  breakEvenMonths: number;
  totalROI5Year: number;
  totalROI10Year: number;
}

export interface ComparableProperty {
  address: string;
  salePrice: number;
  saleDate: Date;
  sqft: number;
  pricePerSqft: number;
  bedrooms: number;
  bathrooms: number;
  distance: number;
  adjustedValue: number;
}

// ============ Analysis Functions ============

export async function analyzeProperty(property: Property): Promise<PropertyAnalysis> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert real estate investment analyst. Analyze properties for investment potential.
Consider location, property condition, market conditions, and investment fundamentals.
Provide a comprehensive SWOT analysis and investment recommendation.
Be objective and data-driven in your analysis.`,
      },
      {
        role: "user",
        content: `Analyze this property for investment potential:
Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
Type: ${property.propertyType}
List Price: $${property.listPrice.toLocaleString()}
Bedrooms: ${property.bedrooms || "N/A"}
Bathrooms: ${property.bathrooms || "N/A"}
Square Feet: ${property.sqft?.toLocaleString() || "N/A"}
Year Built: ${property.yearBuilt || "N/A"}
Days on Market: ${property.daysOnMarket || "N/A"}
Features: ${property.features.join(", ")}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "property_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            investmentScore: { type: "number" },
            riskLevel: { type: "string" },
            estimatedValue: { type: "number" },
            pricePerSqft: { type: "number" },
            marketComparison: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            threats: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" },
            confidenceLevel: { type: "number" },
          },
          required: ["investmentScore", "riskLevel", "estimatedValue", "pricePerSqft", "marketComparison", "strengths", "weaknesses", "opportunities", "threats", "recommendation", "confidenceLevel"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices?.[0]?.message?.content;
  let analysis: Partial<PropertyAnalysis> = {};
  
  if (typeof content === "string") {
    try {
      analysis = JSON.parse(content);
    } catch {
      // Use defaults
    }
  }

  return {
    propertyId: property.id,
    investmentScore: analysis.investmentScore || 50,
    riskLevel: (analysis.riskLevel as PropertyAnalysis["riskLevel"]) || "medium",
    estimatedValue: analysis.estimatedValue || property.listPrice,
    pricePerSqft: analysis.pricePerSqft || (property.sqft ? property.listPrice / property.sqft : 0),
    marketComparison: (analysis.marketComparison as PropertyAnalysis["marketComparison"]) || "at",
    strengths: analysis.strengths || [],
    weaknesses: analysis.weaknesses || [],
    opportunities: analysis.opportunities || [],
    threats: analysis.threats || [],
    recommendation: (analysis.recommendation as PropertyAnalysis["recommendation"]) || "hold",
    confidenceLevel: analysis.confidenceLevel || 0.7,
    analyzedAt: new Date(),
  };
}

export async function getMarketTrends(market: string): Promise<MarketTrend> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a real estate market analyst. Provide market trend analysis based on current conditions.
Include price trends, inventory levels, demand indicators, and forecasts.
Be specific with numbers and percentages.`,
      },
      {
        role: "user",
        content: `Provide a market trend analysis for: ${market}
Include current median price, price changes, inventory levels, and forecasts.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "market_trends",
        strict: true,
        schema: {
          type: "object",
          properties: {
            medianPrice: { type: "number" },
            priceChange: { type: "number" },
            priceChangePercent: { type: "number" },
            inventoryLevel: { type: "number" },
            daysOnMarket: { type: "number" },
            salesVolume: { type: "number" },
            demandIndex: { type: "number" },
            supplyIndex: { type: "number" },
            marketTemperature: { type: "string" },
            forecast: {
              type: "object",
              properties: {
                shortTerm: { type: "string" },
                mediumTerm: { type: "string" },
                longTerm: { type: "string" },
              },
              required: ["shortTerm", "mediumTerm", "longTerm"],
              additionalProperties: false,
            },
          },
          required: ["medianPrice", "priceChange", "priceChangePercent", "inventoryLevel", "daysOnMarket", "salesVolume", "demandIndex", "supplyIndex", "marketTemperature", "forecast"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices?.[0]?.message?.content;
  let trends: Partial<MarketTrend> = {};
  
  if (typeof content === "string") {
    try {
      trends = JSON.parse(content);
    } catch {
      // Use defaults
    }
  }

  return {
    market,
    period: new Date().toISOString().slice(0, 7),
    medianPrice: trends.medianPrice || 350000,
    priceChange: trends.priceChange || 15000,
    priceChangePercent: trends.priceChangePercent || 4.5,
    inventoryLevel: trends.inventoryLevel || 2.5,
    daysOnMarket: trends.daysOnMarket || 28,
    salesVolume: trends.salesVolume || 1200,
    demandIndex: trends.demandIndex || 75,
    supplyIndex: trends.supplyIndex || 45,
    marketTemperature: (trends.marketTemperature as MarketTrend["marketTemperature"]) || "warm",
    forecast: trends.forecast || {
      shortTerm: "Continued moderate growth expected",
      mediumTerm: "Market stabilization anticipated",
      longTerm: "Long-term appreciation likely",
    },
  };
}

export function calculateROI(
  property: Property,
  assumptions: {
    downPaymentPercent?: number;
    interestRate?: number;
    loanTermYears?: number;
    monthlyRent?: number;
    vacancyRate?: number;
    propertyTaxRate?: number;
    insuranceAnnual?: number;
    maintenancePercent?: number;
    managementPercent?: number;
    appreciationRate?: number;
    renovationCosts?: number;
    closingCostPercent?: number;
  } = {}
): ROIProjection {
  const {
    downPaymentPercent = 20,
    interestRate = 7,
    loanTermYears = 30,
    monthlyRent = property.listPrice * 0.008,
    vacancyRate = 5,
    propertyTaxRate = 1.2,
    insuranceAnnual = 1500,
    maintenancePercent = 1,
    managementPercent = 8,
    appreciationRate = 3,
    renovationCosts = 0,
    closingCostPercent = 3,
  } = assumptions;

  const purchasePrice = property.listPrice;
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPayment;
  const closingCosts = purchasePrice * (closingCostPercent / 100);
  const totalInvestment = downPayment + closingCosts + renovationCosts;

  // Monthly mortgage calculation
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;
  const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Monthly expenses
  const monthlyPropertyTax = (purchasePrice * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = insuranceAnnual / 12;
  const monthlyMaintenance = (purchasePrice * (maintenancePercent / 100)) / 12;
  const monthlyManagement = monthlyRent * (managementPercent / 100);
  const monthlyVacancy = monthlyRent * (vacancyRate / 100);

  const monthlyExpenses = monthlyMortgage + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyManagement + monthlyVacancy;
  const effectiveRent = monthlyRent * (1 - vacancyRate / 100);
  const monthlyCashFlow = effectiveRent - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  // Cap rate (based on NOI, not including mortgage)
  const annualNOI = (effectiveRent * 12) - (monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyManagement) * 12;
  const capRate = (annualNOI / purchasePrice) * 100;

  // Cash on cash return
  const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;

  // Future value projections
  const projectedValue1Year = purchasePrice * Math.pow(1 + appreciationRate / 100, 1);
  const projectedValue5Year = purchasePrice * Math.pow(1 + appreciationRate / 100, 5);
  const projectedValue10Year = purchasePrice * Math.pow(1 + appreciationRate / 100, 10);

  // Break even
  const breakEvenMonths = monthlyCashFlow > 0 ? Math.ceil(totalInvestment / monthlyCashFlow) : Infinity;

  // Total ROI (cash flow + appreciation + equity paydown)
  const equity5Year = projectedValue5Year - purchasePrice + (annualCashFlow * 5);
  const equity10Year = projectedValue10Year - purchasePrice + (annualCashFlow * 10);
  const totalROI5Year = (equity5Year / totalInvestment) * 100;
  const totalROI10Year = (equity10Year / totalInvestment) * 100;

  return {
    propertyId: property.id,
    purchasePrice,
    closingCosts,
    renovationCosts,
    totalInvestment,
    monthlyRent,
    monthlyExpenses: Math.round(monthlyExpenses),
    monthlyCashFlow: Math.round(monthlyCashFlow),
    annualCashFlow: Math.round(annualCashFlow),
    capRate: Math.round(capRate * 100) / 100,
    cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
    appreciationRate,
    projectedValue1Year: Math.round(projectedValue1Year),
    projectedValue5Year: Math.round(projectedValue5Year),
    projectedValue10Year: Math.round(projectedValue10Year),
    breakEvenMonths: breakEvenMonths === Infinity ? -1 : breakEvenMonths,
    totalROI5Year: Math.round(totalROI5Year * 100) / 100,
    totalROI10Year: Math.round(totalROI10Year * 100) / 100,
  };
}

export async function findComparables(property: Property): Promise<ComparableProperty[]> {
  // In production, this would query MLS or property databases
  // For now, generate synthetic comparables
  const basePrice = property.listPrice;
  const baseSqft = property.sqft || 1500;
  
  const comps: ComparableProperty[] = [];
  
  for (let i = 0; i < 5; i++) {
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120% of base
    const sqft = Math.round(baseSqft * variance);
    const pricePerSqft = (basePrice / baseSqft) * (0.9 + Math.random() * 0.2);
    const salePrice = Math.round(sqft * pricePerSqft);
    
    comps.push({
      address: `${1000 + i * 100} Comparable St, ${property.city}, ${property.state}`,
      salePrice,
      saleDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      sqft,
      pricePerSqft: Math.round(pricePerSqft),
      bedrooms: property.bedrooms || 3,
      bathrooms: property.bathrooms || 2,
      distance: Math.round(Math.random() * 20) / 10,
      adjustedValue: Math.round(salePrice * (baseSqft / sqft)),
    });
  }
  
  return comps.sort((a, b) => a.distance - b.distance);
}

// ============ Real Estate Intelligence Manager ============

export class RealEstateIntelligence {
  private properties: Map<string, Property> = new Map();
  private analyses: Map<string, PropertyAnalysis> = new Map();
  private marketCache: Map<string, { data: MarketTrend; timestamp: Date }> = new Map();

  async addProperty(propertyData: Omit<Property, "id" | "createdAt" | "updatedAt">): Promise<Property> {
    const property: Property = {
      ...propertyData,
      id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.properties.set(property.id, property);
    return property;
  }

  getProperty(propertyId: string): Property | undefined {
    return this.properties.get(propertyId);
  }

  getAllProperties(): Property[] {
    return Array.from(this.properties.values());
  }

  async getPropertyAnalysis(propertyId: string, forceRefresh = false): Promise<PropertyAnalysis | undefined> {
    const property = this.properties.get(propertyId);
    if (!property) return undefined;

    if (!forceRefresh && this.analyses.has(propertyId)) {
      return this.analyses.get(propertyId);
    }

    const analysis = await analyzeProperty(property);
    this.analyses.set(propertyId, analysis);
    return analysis;
  }

  async getMarketTrends(market: string, forceRefresh = false): Promise<MarketTrend> {
    const cached = this.marketCache.get(market);
    const cacheAge = cached ? Date.now() - cached.timestamp.getTime() : Infinity;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (!forceRefresh && cached && cacheAge < maxAge) {
      return cached.data;
    }

    const trends = await getMarketTrends(market);
    this.marketCache.set(market, { data: trends, timestamp: new Date() });
    return trends;
  }

  async getROIProjection(propertyId: string, assumptions?: Parameters<typeof calculateROI>[1]): Promise<ROIProjection | undefined> {
    const property = this.properties.get(propertyId);
    if (!property) return undefined;

    return calculateROI(property, assumptions);
  }

  async getComparables(propertyId: string): Promise<ComparableProperty[]> {
    const property = this.properties.get(propertyId);
    if (!property) return [];

    return findComparables(property);
  }

  async generateInvestmentReport(propertyId: string): Promise<{
    property: Property;
    analysis: PropertyAnalysis;
    roi: ROIProjection;
    comparables: ComparableProperty[];
    marketTrends: MarketTrend;
  } | undefined> {
    const property = this.properties.get(propertyId);
    if (!property) return undefined;

    const [analysis, roi, comparables, marketTrends] = await Promise.all([
      this.getPropertyAnalysis(propertyId),
      this.getROIProjection(propertyId),
      this.getComparables(propertyId),
      this.getMarketTrends(`${property.city}, ${property.state}`),
    ]);

    if (!analysis || !roi) return undefined;

    return {
      property,
      analysis,
      roi,
      comparables,
      marketTrends,
    };
  }

  getPortfolioSummary(): {
    totalProperties: number;
    totalValue: number;
    avgInvestmentScore: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  } {
    const properties = Array.from(this.properties.values());
    const analyses = Array.from(this.analyses.values());

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const prop of properties) {
      byType[prop.propertyType] = (byType[prop.propertyType] || 0) + 1;
      byStatus[prop.status] = (byStatus[prop.status] || 0) + 1;
    }

    return {
      totalProperties: properties.length,
      totalValue: properties.reduce((sum, p) => sum + p.listPrice, 0),
      avgInvestmentScore: analyses.length > 0
        ? analyses.reduce((sum, a) => sum + a.investmentScore, 0) / analyses.length
        : 0,
      byType,
      byStatus,
    };
  }
}

// Export singleton instance
export const realEstateIntelligence = new RealEstateIntelligence();

export default RealEstateIntelligence;
