export type RailType = 'SWIFT' | 'LOCAL_RAILS' | 'FINTECH_PARTNER';

export interface RailOption {
  railId: string;
  name: string;
  railType: RailType;
  exchangeRate: number;
  spreadBps: number;
  fixedFee: number;
  percentageFee: number;
  estimatedHours: number;
  reliabilityScore: number;
  supportedCorridors: string[];
  isActive: boolean;
}

export interface RateFeedCorridor {
  corridor: string;
  sourceCurrency: string;
  targetCurrency: string;
  midMarketRate: number;
  rails: RailOption[];
  lastUpdated: string;
}

export interface EvaluatedRoute {
  railId: string;
  name: string;
  railType: RailType;
  exchangeRate: number;
  spreadBps: number;
  fixedFee: number;
  percentageFeeAmount: number;
  totalFees: number;
  spreadCost: number;
  totalEffectiveCost: number;
  netLandingAmount: number;
  estimatedHours: number;
  reliabilityScore: number;
  benchmarkBankCost: number;
  savingsAmount: number;
  savingsPercentage: number;
  platformProfitSplit: number;
  corridor: string;
  badges: string[];
  isRecommended: boolean;
}

export interface RoutingQuoteResponse {
  quoteId: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  midMarketRate: number;
  benchmarkStandardBank: {
    name: string;
    wireFee: number;
    spreadBps: number;
    effectiveRate: number;
    totalCost: number;
    netLandingAmount: number;
    slaHours: number;
  };
  monetizationModel: {
    plan: 'fixed_retainer' | 'basis_point_split';
    retainerMonthly: number;
    basisPointSplitRate: number;
    appliedFee: number;
  };
  expiresInSeconds: number;
  routes: EvaluatedRoute[];
}

export interface Supplier {
  _id: string;
  supplierName: string;
  contactEmail?: string;
  country: string;
  settlementCurrency: string;
  bankName: string;
  accountNumberOrIban: string;
  swiftBicOrRouting: string;
  category: string;
  preferredRoutingStrategy: 'LOWEST_COST' | 'FASTEST_DELIVERY' | 'MAX_RELIABILITY';
  totalDisbursedAmount: number;
}

export interface TransferRecord {
  _id: string;
  referenceNumber: string;
  invoiceNumber?: string;
  supplierId: Supplier | { _id: string; supplierName: string; country: string; settlementCurrency: string; bankName: string };
  sourceCurrency: string;
  sourceAmount: number;
  targetCurrency: string;
  netLandingAmount: number;
  routingDecision: {
    strategy: string;
    selectedRailId: string;
    selectedRailName: string;
    selectedRailType: RailType;
  };
  pricingBreakdown: {
    midMarketRate: number;
    effectiveRate: number;
    spreadBps: number;
    totalFeeSourceCurrency: number;
    benchmarkBankCost: number;
    savedAmountSourceCurrency: number;
    profitSplitTake: number;
  };
  deliveryEstimateHours: number;
  status: 'QUOTE_LOCKED' | 'INITIATED' | 'IN_CLEARING' | 'SETTLED' | 'FAILED';
  createdAt: string;
}

export interface AnalyticsSummary {
  totalTransfers: number;
  totalVolumeUSD: number;
  totalDirectFeesPaid: number;
  totalBenchmarkCost: number;
  totalClientSavings: number;
  averageSavingsPercentage: number;
  monetization: {
    currentPlan: string;
    retainerMonthly: number;
    totalProfitSplitEarned: number;
  };
  railBreakdown: {
    SWIFT: number;
    LOCAL_RAILS: number;
    FINTECH_PARTNER: number;
  };
}
