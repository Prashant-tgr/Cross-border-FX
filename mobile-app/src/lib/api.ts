// ─────────────────────────────────────────────────────────────────
// API Layer — React Native / Expo adaptation
// Changes from web version:
//   - localStorage  →  expo-secure-store (via storage.ts)
//   - typeof window guards removed (always native context)
//   - NEXT_PUBLIC_ env var  →  process.env.EXPO_PUBLIC_API_URL
// All fetch logic and mock data is preserved exactly.
// ─────────────────────────────────────────────────────────────────

import { storage } from './storage';
import type {
  RateFeedCorridor,
  RoutingQuoteResponse,
  EvaluatedRoute,
  Supplier,
  AnalyticsSummary,
  AdminOverview,
  AdminUser,
  UpdateRailPayload,
  AuthResponse,
} from '../types/fx';

// ── Config ────────────────────────────────────────────────────────
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://cross-border-fx.onrender.com/api';

// ── Helpers ───────────────────────────────────────────────────────
async function authHeader(): Promise<Record<string, string>> {
  const token = await storage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authJson(): Promise<Record<string, string>> {
  const token = await storage.getToken();
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) base.Authorization = `Bearer ${token}`;
  return base;
}

// ── Mock Data ─────────────────────────────────────────────────────
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
        exchangeRate: 86.1,
        spreadBps: 44,
        fixedFee: 3.0,
        percentageFee: 0.0008,
        estimatedHours: 2,
        reliabilityScore: 98.8,
        supportedCorridors: ['USD-INR'],
        isActive: true,
      },
      {
        railId: 'wise',
        name: 'Wise Business Engine',
        railType: 'FINTECH_PARTNER',
        exchangeRate: 86.0,
        spreadBps: 32,
        fixedFee: 2.5,
        percentageFee: 0.0019,
        estimatedHours: 2,
        reliabilityScore: 99.8,
        supportedCorridors: ['USD-INR'],
        isActive: true,
      },
    ],
  },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    _id: 'sup_1',
    supplierName: 'Apex Industrial Dynamics Ltd.',
    contactEmail: 'finance@apexind.com',
    country: 'Germany',
    settlementCurrency: 'EUR',
    bankName: 'Deutsche Bank AG',
    accountNumberOrIban: 'DE89370400440532013000',
    swiftBicOrRouting: 'DEUTDEDB',
    category: 'Manufacturing Components',
    preferredRoutingStrategy: 'LOWEST_COST',
    totalDisbursedAmount: 1_250_000,
  },
  {
    _id: 'sup_2',
    supplierName: 'Bangalore Microcircuits Corp.',
    contactEmail: 'treasury@bangaloretech.in',
    country: 'India',
    settlementCurrency: 'INR',
    bankName: 'HDFC Bank Ltd.',
    accountNumberOrIban: '50100123456789',
    swiftBicOrRouting: 'HDFCINBB',
    category: 'Electronics & Semiconductors',
    preferredRoutingStrategy: 'FASTEST_DELIVERY',
    totalDisbursedAmount: 870_000,
  },
];

export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalTransfers: 142,
  totalVolumeUSD: 4_850_000,
  totalDirectFeesPaid: 24_250,
  totalBenchmarkCost: 136_200,
  totalClientSavings: 114_200,
  averageSavingsPercentage: 83.8,
  monetization: {
    currentPlan: 'basis_point_split',
    retainerMonthly: 2000,
    totalProfitSplitEarned: 22_840,
  },
  railBreakdown: { SWIFT: 18, LOCAL_RAILS: 89, FINTECH_PARTNER: 35 },
};

// ── Auth ──────────────────────────────────────────────────────────
export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed. Please check credentials.');

  if (json.token) await storage.setToken(json.token);

  return { token: json.token, user: json.data.user };
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
  if (!res.ok) throw new Error(json.message || 'Registration failed.');

  if (json.token) await storage.setToken(json.token);

  return { token: json.token, user: json.data.user };
}

export async function getMeApi(): Promise<AuthResponse['user'] | null> {
  try {
    const token = await storage.getToken();
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const json = await res.json();
      return json.data.user;
    } else {
      await storage.deleteToken();
    }
  } catch {
    // Offline or server unavailable
  }
  return null;
}

export async function logoutApi(): Promise<void> {
  await storage.deleteToken();
}

// ── Rates ─────────────────────────────────────────────────────────
export async function fetchCorridors(): Promise<RateFeedCorridor[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/rates/corridors`, {
      headers: await authHeader(),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || MOCK_CORRIDORS;
    }
  } catch {
    // fallback
  }
  return MOCK_CORRIDORS;
}

// ── Routing Quote ─────────────────────────────────────────────────
export async function fetchRoutingQuote(
  sourceCurrency: string,
  targetCurrency: string,
  amount: number,
  strategy: string = 'LOWEST_COST'
): Promise<RoutingQuoteResponse> {
  try {
    const headers = await authJson();
    const res = await fetch(`${API_BASE_URL}/routing/optimize`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sourceCurrency: sourceCurrency.toUpperCase(),
        targetCurrency: targetCurrency.toUpperCase(),
        amount,
        strategy,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    // fallback to dynamic simulation
  }
  return buildMockQuote(sourceCurrency, targetCurrency, amount);
}

const FALLBACK_MID_RATES: Record<string, number> = {
  'USD-EUR': 0.9242,
  'EUR-USD': 1.082,
  'USD-INR': 86.48,
  'INR-USD': 0.0116,
  'USD-GBP': 0.785,
  'GBP-USD': 1.274,
  'USD-JPY': 153.25,
  'JPY-USD': 0.00653,
  'USD-SGD': 1.3485,
  'USD-CAD': 1.382,
  'USD-AUD': 1.512,
  'EUR-GBP': 0.851,
  'EUR-INR': 93.6,
  'GBP-INR': 110.2,
};

function buildMockQuote(
  sourceCurrency: string,
  targetCurrency: string,
  amount: number
): RoutingQuoteResponse {
  const key = `${sourceCurrency}-${targetCurrency}`.toUpperCase();
  const corridor = MOCK_CORRIDORS.find((c) => c.corridor === key);
  const mid = corridor?.midMarketRate ?? FALLBACK_MID_RATES[key] ?? 1.15;

  const benchmarkBankWireFee = 45;
  const benchmarkCost = benchmarkBankWireFee + (amount - benchmarkBankWireFee) * (mid * 0.026);

  const fintechRate = mid * 0.9968;
  const fintechFees = 3.0 + amount * 0.0012;
  const fintechNet = (amount - fintechFees) * fintechRate;
  const fintechSavings = benchmarkCost - (fintechFees + (mid - fintechRate) * (amount - fintechFees));

  const localRate = mid * 0.9955;
  const localFees = 4.5 + amount * 0.0008;
  const localNet = (amount - localFees) * localRate;

  const swiftRate = mid * 0.976;
  const swiftFees = 45.0 + amount * 0.0015;
  const swiftNet = (amount - swiftFees) * swiftRate;

  const routes: EvaluatedRoute[] = [
    {
      railId: 'fintech',
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
      savingsAmount: Number(fintechSavings.toFixed(2)),
      savingsPercentage: Number(((fintechSavings / benchmarkCost) * 100).toFixed(1)),
      platformProfitSplit: Number((Math.max(0, fintechSavings) * 0.2).toFixed(2)),
      corridor: key,
      badges: ['RECOMMENDED', 'BEST_RATE'],
      isRecommended: true,
    },
    {
      railId: 'local',
      name: 'Local Domestic Rail',
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
      savingsAmount: Number((benchmarkCost - localFees).toFixed(2)),
      savingsPercentage: 91.5,
      platformProfitSplit: Number((Math.max(0, benchmarkCost - (localFees + (mid - localRate) * amount)) * 0.2).toFixed(2)),
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

// ── Suppliers ─────────────────────────────────────────────────────
export async function fetchSuppliers(): Promise<Supplier[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/suppliers`, {
      headers: await authHeader(),
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

// ── Analytics ─────────────────────────────────────────────────────
export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/transfers/analytics`, {
      headers: await authHeader(),
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

// ── Transfers ─────────────────────────────────────────────────────
export async function executeTransferApi(payload: unknown): Promise<unknown> {
  const token = await storage.getToken();
  if (!token) throw new Error('Authentication required to execute transfer');

  const res = await fetch(`${API_BASE_URL}/transfers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Transfer execution failed.');
  return json.data;
}

// ── Admin ─────────────────────────────────────────────────────────
export async function fetchAdminOverview(): Promise<AdminOverview> {
  const token = await storage.getToken();
  if (!token) throw new Error('Authentication required: Admin token missing.');

  const res = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Access Denied: Requires Administrator Privileges.');
  return json.data;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const token = await storage.getToken();
  if (!token) throw new Error('Authentication required: Admin token missing.');

  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Access Denied: Requires Administrator Privileges.');
  return json.data;
}

export async function updateAdminUserPlan(
  id: string,
  payload: { role?: string; pricingPlan?: string; basisPointSplitRate?: number; isActive?: boolean }
): Promise<AdminUser> {
  const headers = await authJson();
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update user plan');
  return json.data;
}

export async function updateAdminRailConfig(payload: UpdateRailPayload): Promise<unknown> {
  const headers = await authJson();
  const res = await fetch(`${API_BASE_URL}/admin/corridors/rail`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update rail configuration');
  return json.data;
}

export async function createAdminCorridor(payload: {
  sourceCurrency: string;
  targetCurrency: string;
  midMarketRate: number;
}): Promise<unknown> {
  const headers = await authJson();
  const res = await fetch(`${API_BASE_URL}/admin/corridors`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create corridor');
  return json.data;
}
