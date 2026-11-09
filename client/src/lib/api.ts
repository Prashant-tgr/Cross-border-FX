import {
  RateFeedCorridor,
  RoutingQuoteResponse,
  Supplier,
  TransferRecord,
  AnalyticsSummary,
  AdminOverview,
  AdminUser,
  UpdateRailPayload,
} from '@/types/fx';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fallback demo data to ensure uninterrupted instant UI preview
export const MOCK_CORRIDORS: RateFeedCorridor[] = [
  {
    corridor: 'USD-EUR',
    sourceCurrency: 'USD',
    targetCurrency: 'EUR',
    midMarketRate: 0.9242,
    lastUpdated: new Date().toISOString(),
    rails: [
      {
        railId: 'swift',
        name: 'SWIFT Correspondent Network',
        railType: 'SWIFT',
        exchangeRate: 0.902,
        spreadBps: 240,
        fixedFee: 45.0,
        percentageFee: 0.0015,
        estimatedHours: 48,
        reliabilityScore: 99.5,
        supportedCorridors: ['USD-EUR'],
        isActive: true,
      },
      {
        railId: 'local_clearing',
        name: 'Local Domestic Rail (SEPA Instant)',
        railType: 'LOCAL_RAILS',
        exchangeRate: 0.9201,
        spreadBps: 45,
        fixedFee: 4.5,
        percentageFee: 0.0008,
        estimatedHours: 1.5,
        reliabilityScore: 99.1,
        supportedCorridors: ['USD-EUR'],
        isActive: true,
      },
      {
        railId: 'airwallex',
        name: 'Airwallex Treasury Rail',
        railType: 'FINTECH_PARTNER',
        exchangeRate: 0.9216,
        spreadBps: 28,
        fixedFee: 3.0,
        percentageFee: 0.0012,
        estimatedHours: 4,
        reliabilityScore: 99.4,
        supportedCorridors: ['USD-EUR'],
        isActive: true,
      },
      {
        railId: 'wise',
        name: 'Wise Business Engine',
        railType: 'FINTECH_PARTNER',
        exchangeRate: 0.9212,
        spreadBps: 32,
        fixedFee: 2.5,
        percentageFee: 0.0019,
        estimatedHours: 2,
        reliabilityScore: 99.8,
        supportedCorridors: ['USD-EUR'],
        isActive: true,
      },
    ],
  },
  {
    corridor: 'USD-INR',
    sourceCurrency: 'USD',
    targetCurrency: 'INR',
    midMarketRate: 86.48,
    lastUpdated: new Date().toISOString(),
    rails: [
      {
        railId: 'swift',
        name: 'SWIFT Correspondent Network',
        railType: 'SWIFT',
        exchangeRate: 84.4,
        spreadBps: 240,
        fixedFee: 45.0,
        percentageFee: 0.0015,
        estimatedHours: 48,
        reliabilityScore: 99.5,
        supportedCorridors: ['USD-INR'],
        isActive: true,
      },
      {
        railId: 'local_clearing',
        name: 'Local Domestic Rail (NEFT/IMPS)',
        railType: 'LOCAL_RAILS',
        exchangeRate: 86.09,
        spreadBps: 45,
        fixedFee: 4.5,
        percentageFee: 0.0008,
        estimatedHours: 1.5,
        reliabilityScore: 99.1,
        supportedCorridors: ['USD-INR'],
        isActive: true,
      },
      {
        railId: 'airwallex',
        name: 'Airwallex Treasury Rail',
        railType: 'FINTECH_PARTNER',
        exchangeRate: 86.24,
        spreadBps: 28,
        fixedFee: 3.0,
        percentageFee: 0.0012,
        estimatedHours: 4,
        reliabilityScore: 99.4,
        supportedCorridors: ['USD-INR'],
        isActive: true,
      },
    ],
  },
  {
    corridor: 'USD-SGD',
    sourceCurrency: 'USD',
    targetCurrency: 'SGD',
    midMarketRate: 1.3485,
    lastUpdated: new Date().toISOString(),
    rails: [
      {
        railId: 'swift',
        name: 'SWIFT Correspondent Network',
        railType: 'SWIFT',
        exchangeRate: 1.316,
        spreadBps: 240,
        fixedFee: 45.0,
        percentageFee: 0.0015,
        estimatedHours: 48,
        reliabilityScore: 99.5,
        supportedCorridors: ['USD-SGD'],
        isActive: true,
      },
      {
        railId: 'airwallex',
        name: 'Airwallex Treasury Rail',
        railType: 'FINTECH_PARTNER',
        exchangeRate: 1.3447,
        spreadBps: 28,
        fixedFee: 3.0,
        percentageFee: 0.0012,
        estimatedHours: 4,
        reliabilityScore: 99.4,
        supportedCorridors: ['USD-SGD'],
        isActive: true,
      },
    ],
  },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    _id: 'sup_1',
    supplierName: 'Stuttgart Precision Bearings GmbH',
    contactEmail: 'invoicing@stuttgart-bearings.de',
    country: 'DE',
    settlementCurrency: 'EUR',
    bankName: 'Deutsche Bank AG',
    accountNumberOrIban: 'DE89370400440532013000',
    swiftBicOrRouting: 'DEUTDEDDFXX',
    category: 'Manufacturing',
    preferredRoutingStrategy: 'LOWEST_COST',
    totalDisbursedAmount: 138350.25,
  },
  {
    _id: 'sup_2',
    supplierName: 'Bharat Microelectronics Ltd.',
    contactEmail: 'accounts@bharatmicro.in',
    country: 'IN',
    settlementCurrency: 'INR',
    bankName: 'HDFC Bank Ltd.',
    accountNumberOrIban: '50200038192847',
    swiftBicOrRouting: 'HDFCINBBXXX',
    category: 'IT & Software',
    preferredRoutingStrategy: 'FASTEST_DELIVERY',
    totalDisbursedAmount: 7338420.0,
  },
  {
    _id: 'sup_3',
    supplierName: 'Shenzhen Silicon Components Co.',
    contactEmail: 'export@shenzhensilicon.cn',
    country: 'SG',
    settlementCurrency: 'SGD',
    bankName: 'DBS Bank Ltd.',
    accountNumberOrIban: '003928172819',
    swiftBicOrRouting: 'DBSSSGSGXXX',
    category: 'Raw Materials',
    preferredRoutingStrategy: 'LOWEST_COST',
    totalDisbursedAmount: 45000.0,
  },
  {
    _id: 'sup_4',
    supplierName: 'Manchester Logistics Group Ltd.',
    contactEmail: 'freight@manchesterlogistics.co.uk',
    country: 'GB',
    settlementCurrency: 'GBP',
    bankName: 'Barclays Bank UK',
    accountNumberOrIban: 'GB29BARC20000087654321',
    swiftBicOrRouting: 'BARCGB22XXX',
    category: 'Logistics & Freight',
    preferredRoutingStrategy: 'MAX_RELIABILITY',
    totalDisbursedAmount: 39180.0,
  },
];

export const MOCK_TRANSFERS: TransferRecord[] = [
  {
    _id: 'trx_1',
    referenceNumber: 'TRX-948201-1029',
    invoiceNumber: 'INV-2026-081',
    supplierId: MOCK_SUPPLIERS[0],
    sourceCurrency: 'USD',
    sourceAmount: 150000,
    targetCurrency: 'EUR',
    netLandingAmount: 138350.25,
    routingDecision: {
      strategy: 'LOWEST_COST',
      selectedRailId: 'airwallex',
      selectedRailName: 'Airwallex Treasury Rail',
      selectedRailType: 'FINTECH_PARTNER',
    },
    pricingBreakdown: {
      midMarketRate: 0.9242,
      effectiveRate: 0.9223,
      spreadBps: 28,
      totalFeeSourceCurrency: 183.0,
      benchmarkBankCost: 3945.0,
      savedAmountSourceCurrency: 3762.0,
      profitSplitTake: 752.4,
    },
    deliveryEstimateHours: 4,
    status: 'SETTLED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'trx_2',
    referenceNumber: 'TRX-774012-4412',
    invoiceNumber: 'INV-BLR-4019',
    supplierId: MOCK_SUPPLIERS[1],
    sourceCurrency: 'USD',
    sourceAmount: 85000,
    targetCurrency: 'INR',
    netLandingAmount: 7338420.0,
    routingDecision: {
      strategy: 'FASTEST_DELIVERY',
      selectedRailId: 'local_clearing',
      selectedRailName: 'Local Domestic Rail (NEFT/IMPS)',
      selectedRailType: 'LOCAL_RAILS',
    },
    pricingBreakdown: {
      midMarketRate: 86.48,
      effectiveRate: 86.34,
      spreadBps: 45,
      totalFeeSourceCurrency: 72.5,
      benchmarkBankCost: 2255.0,
      savedAmountSourceCurrency: 2182.5,
      profitSplitTake: 436.5,
    },
    deliveryEstimateHours: 1.5,
    status: 'SETTLED',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalTransfers: 18,
  totalVolumeUSD: 285000,
  totalDirectFeesPaid: 353.0,
  totalBenchmarkCost: 7545.0,
  totalClientSavings: 7192.0,
  averageSavingsPercentage: 95.3,
  monetization: {
    currentPlan: 'basis_point_split',
    retainerMonthly: 2000,
    totalProfitSplitEarned: 1438.4,
  },
  railBreakdown: {
    SWIFT: 1,
    LOCAL_RAILS: 8,
    FINTECH_PARTNER: 9,
  },
};

// API Client Functions with smart fallback
export async function fetchCorridors(): Promise<RateFeedCorridor[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/rates/corridors`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API fetch failed');
    const json = await res.json();
    return json.data || MOCK_CORRIDORS;
  } catch {
    return MOCK_CORRIDORS;
  }
}

export async function fetchRoutingQuote(
  sourceCurrency: string,
  targetCurrency: string,
  amount: number,
  strategy = 'LOWEST_COST'
): Promise<RoutingQuoteResponse> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/routing/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sourceCurrency, targetCurrency, amount, strategy }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // proceed to client simulation
  }

  // Client Simulation fallback
  const midRates: Record<string, number> = {
    'USD-EUR': 0.9242,
    'USD-INR': 86.48,
    'USD-GBP': 0.785,
    'USD-SGD': 1.3485,
    'EUR-BRL': 6.085,
    'USD-JPY': 153.2,
  };
  const key = `${sourceCurrency}-${targetCurrency}`;
  const mid = midRates[key] || 1.0;

  const swiftRate = mid * 0.976;
  const localRate = mid * 0.9955;
  const fintechRate = mid * 0.9972;

  const benchmarkBankWireFee = 45.0;
  const benchmarkCost = benchmarkBankWireFee + (mid - swiftRate) * (amount - benchmarkBankWireFee);

  const localFees = 4.5 + amount * 0.0008;
  const fintechFees = 3.0 + amount * 0.0012;
  const swiftFees = 45.0 + amount * 0.0015;

  const localNet = Math.max(0, (amount - localFees) * localRate);
  const fintechNet = Math.max(0, (amount - fintechFees) * fintechRate);
  const swiftNet = Math.max(0, (amount - swiftFees) * swiftRate);

  const routes: RoutingQuoteResponse['routes'] = [
    {
      railId: 'airwallex',
      name: 'Airwallex Treasury Rail',
      railType: 'FINTECH_PARTNER',
      exchangeRate: Number(fintechRate.toFixed(4)),
      spreadBps: 28,
      fixedFee: 3.0,
      percentageFeeAmount: Number((amount * 0.0012).toFixed(2)),
      totalFees: Number(fintechFees.toFixed(2)),
      spreadCost: Number(((mid - fintechRate) * (amount - fintechFees)).toFixed(2)),
      totalEffectiveCost: Number((fintechFees + (mid - fintechRate) * (amount - fintechFees)).toFixed(2)),
      netLandingAmount: Number(fintechNet.toFixed(2)),
      estimatedHours: 4,
      reliabilityScore: 99.4,
      benchmarkBankCost: Number(benchmarkCost.toFixed(2)),
      savingsAmount: Number(Math.max(0, benchmarkCost - (fintechFees + (mid - fintechRate) * amount)).toFixed(2)),
      savingsPercentage: 94.2,
      platformProfitSplit: Number(
        (Math.max(0, benchmarkCost - (fintechFees + (mid - fintechRate) * amount)) * 0.2).toFixed(2)
      ),
      corridor: key,
      badges: ['OPTIMAL_ROUTE', 'LOWEST_COST'],
      isRecommended: true,
    },
    {
      railId: 'local_clearing',
      name: `Domestic Direct Clearing (${targetCurrency === 'EUR' ? 'SEPA Instant' : targetCurrency === 'INR' ? 'NEFT' : 'Local Rail'})`,
      railType: 'LOCAL_RAILS',
      exchangeRate: Number(localRate.toFixed(4)),
      spreadBps: 45,
      fixedFee: 4.5,
      percentageFeeAmount: Number((amount * 0.0008).toFixed(2)),
      totalFees: Number(localFees.toFixed(2)),
      spreadCost: Number(((mid - localRate) * (amount - localFees)).toFixed(2)),
      totalEffectiveCost: Number((localFees + (mid - localRate) * (amount - localFees)).toFixed(2)),
      netLandingAmount: Number(localNet.toFixed(2)),
      estimatedHours: 1.5,
      reliabilityScore: 99.1,
      benchmarkBankCost: Number(benchmarkCost.toFixed(2)),
      savingsAmount: Number(Math.max(0, benchmarkCost - (localFees + (mid - localRate) * amount)).toFixed(2)),
      savingsPercentage: 91.5,
      platformProfitSplit: Number(
        (Math.max(0, benchmarkCost - (localFees + (mid - localRate) * amount)) * 0.2).toFixed(2)
      ),
      corridor: key,
      badges: ['FASTEST'],
      isRecommended: false,
    },
    {
      railId: 'swift',
      name: 'SWIFT Correspondent Network',
      railType: 'SWIFT',
      exchangeRate: Number(swiftRate.toFixed(4)),
      spreadBps: 240,
      fixedFee: 45.0,
      percentageFeeAmount: Number((amount * 0.0015).toFixed(2)),
      totalFees: Number(swiftFees.toFixed(2)),
      spreadCost: Number(((mid - swiftRate) * (amount - swiftFees)).toFixed(2)),
      totalEffectiveCost: Number((swiftFees + (mid - swiftRate) * (amount - swiftFees)).toFixed(2)),
      netLandingAmount: Number(swiftNet.toFixed(2)),
      estimatedHours: 48,
      reliabilityScore: 99.5,
      benchmarkBankCost: Number(benchmarkCost.toFixed(2)),
      savingsAmount: 0,
      savingsPercentage: 0,
      platformProfitSplit: 0,
      corridor: key,
      badges: [],
      isRecommended: false,
    },
  ];

  return {
    quoteId: `QTE-${Date.now()}`,
    sourceCurrency,
    targetCurrency,
    sourceAmount: amount,
    midMarketRate: mid,
    benchmarkStandardBank: {
      name: 'Tier-1 High Street Commercial Bank (SWIFT)',
      wireFee: benchmarkBankWireFee,
      spreadBps: 260,
      effectiveRate: Number((mid * 0.974).toFixed(4)),
      totalCost: Number(benchmarkCost.toFixed(2)),
      netLandingAmount: Number(Math.max(0, (amount - 45) * (mid * 0.974)).toFixed(2)),
      slaHours: 72,
    },
    monetizationModel: {
      plan: 'basis_point_split',
      retainerMonthly: 2000,
      basisPointSplitRate: 20,
      appliedFee: routes[0].platformProfitSplit,
    },
    expiresInSeconds: 120,
    routes,
  };
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/suppliers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || MOCK_SUPPLIERS;
    }
  } catch {
    // fallback
  }
  return MOCK_SUPPLIERS;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/transfers/analytics`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || MOCK_ANALYTICS;
    }
  } catch {
    // fallback
  }
  return MOCK_ANALYTICS;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string;
    role: string;
    pricingPlan: string;
    basisPointSplitRate: number;
  };
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Login failed. Please check credentials.');
  }

  if (typeof window !== 'undefined' && json.token) {
    localStorage.setItem('token', json.token);
  }

  return {
    token: json.token,
    user: json.data.user,
  };
}

export async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
  companyName?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Registration failed.');
  }

  if (typeof window !== 'undefined' && json.token) {
    localStorage.setItem('token', json.token);
  }

  return {
    token: json.token,
    user: json.data.user,
  };
}

export async function getMeApi(): Promise<AuthResponse['user'] | null> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const json = await res.json();
      return json.data.user;
    } else {
      localStorage.removeItem('token');
    }
  } catch {
    // offline or error
  }
  return null;
}

export async function executeTransferApi(payload: any): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('Authentication required to execute transfer');
  }

  const res = await fetch(`${API_BASE_URL}/transfers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Transfer execution failed.');
  }
  return json.data;
}

export const MOCK_ADMIN_OVERVIEW: AdminOverview = {
  totalUsers: 14,
  retainerClientsCount: 6,
  bpsClientsCount: 8,
  totalTransfers: 142,
  totalVolumeUSD: 4850000,
  totalClientSavingsUSD: 114200,
  totalPlatformRevenueUSD: 34840,
  monthlyRetainerRunRate: 12000,
  totalProfitSplitEarned: 22840,
  activeCorridorsCount: 8,
  systemHealth: {
    status: 'OPERATIONAL',
    uptimeSeconds: 14290,
    nodeVersion: 'v23.11.0',
    memoryRssMb: 68.4,
  },
};

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    _id: 'usr_admin',
    name: 'Alexander Vance',
    email: 'admin@globaltrade.io',
    companyName: 'Global FX Router Operations',
    role: 'admin',
    pricingPlan: 'fixed_retainer',
    basisPointSplitRate: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_treasury',
    name: 'Elena Rostova',
    email: 'treasury@globaltrade.io',
    companyName: 'Apex Industrial Dynamics Ltd.',
    role: 'treasury_manager',
    pricingPlan: 'basis_point_split',
    basisPointSplitRate: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_logistics',
    name: 'David Sterling',
    email: 'd.sterling@britishtrade.co.uk',
    companyName: 'Sterling Transatlantic Freight Ltd.',
    role: 'treasury_manager',
    pricingPlan: 'fixed_retainer',
    basisPointSplitRate: 25,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_tech',
    name: 'Priya Sharma',
    email: 'finance@bangaloretech.in',
    companyName: 'Bangalore Microcircuits Corp.',
    role: 'operator',
    pricingPlan: 'basis_point_split',
    basisPointSplitRate: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('Authentication required: Admin token missing.');
  }

  const res = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Access Denied: Requires Administrator Privileges.');
  }
  return json.data;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('Authentication required: Admin token missing.');
  }

  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Access Denied: Requires Administrator Privileges.');
  }
  return json.data;
}

export async function updateAdminUserPlan(
  id: string,
  payload: { role?: string; pricingPlan?: string; basisPointSplitRate?: number; isActive?: boolean }
): Promise<AdminUser> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to update user plan');
  }
  return json.data;
}

export async function updateAdminRailConfig(payload: UpdateRailPayload): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE_URL}/admin/corridors/rail`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to update rail configuration');
  }
  return json.data;
}

export async function createAdminCorridor(payload: {
  sourceCurrency: string;
  targetCurrency: string;
  midMarketRate: number;
}): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE_URL}/admin/corridors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to create corridor');
  }
  return json.data;
}
