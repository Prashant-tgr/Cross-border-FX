'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  TrendingDown,
  Clock,
  ShieldCheck,
  Zap,
  Building2,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  Send,
  RefreshCw,
  Info,
  LogIn,
  LogOut,
  User as UserIcon,
  Lock,
  Mail,
  X,
  AlertCircle,
  Sliders,
  ShieldAlert,
  Save,
  Server,
  Check,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  fetchCorridors,
  fetchRoutingQuote,
  fetchSuppliers,
  fetchAnalytics,
  loginApi,
  registerApi,
  getMeApi,
  executeTransferApi,
  fetchAdminOverview,
  fetchAdminUsers,
  updateAdminUserPlan,
  updateAdminRailConfig,
  createAdminCorridor,
  AuthResponse,
} from '@/lib/api';
import {
  RateFeedCorridor,
  RoutingQuoteResponse,
  Supplier,
  AnalyticsSummary,
  EvaluatedRoute,
  AdminOverview,
  AdminUser,
} from '@/types/fx';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'router' | 'spreads' | 'suppliers' | 'analytics' | 'admin'>('router');
  const [corridors, setCorridors] = useState<RateFeedCorridor[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // User & Auth States
  const [currentUser, setCurrentUser] = useState<AuthResponse['user'] | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCompanyName, setAuthCompanyName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Router Form States
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState<number>(100000);
  const [strategy, setStrategy] = useState<'LOWEST_COST' | 'FASTEST_DELIVERY' | 'MAX_RELIABILITY' | 'BALANCED'>('LOWEST_COST');
  const [quote, setQuote] = useState<RoutingQuoteResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<EvaluatedRoute | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-2026-904');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [quoteCountdown, setQuoteCountdown] = useState<number>(120);

  // Admin Panel States
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedAdminCorridor, setSelectedAdminCorridor] = useState<string>('USD-EUR');
  const [adminEditableRails, setAdminEditableRails] = useState<any[]>([]);
  const [adminSavingRailId, setAdminSavingRailId] = useState<string | null>(null);
  const [adminNotification, setAdminNotification] = useState<string | null>(null);
  const [isAddingCorridor, setIsAddingCorridor] = useState(false);
  const [newCorridorSource, setNewCorridorSource] = useState('USD');
  const [newCorridorTarget, setNewCorridorTarget] = useState('JPY');
  const [newCorridorMid, setNewCorridorMid] = useState(153.25);

  // Load initial session and market data
  useEffect(() => {
    async function loadData() {
      const user = await getMeApi();
      if (user) {
        setCurrentUser(user);
      }

      const [corridorData, supplierData, analyticsData] = await Promise.all([
        fetchCorridors(),
        fetchSuppliers(),
        fetchAnalytics(),
      ]);
      setCorridors(corridorData);
      setSuppliers(supplierData);
      setAnalytics(analyticsData);
      if (supplierData.length > 0) {
        setSelectedSupplierId(supplierData[0]._id);
      }

      // Initial admin corridor selection
      if (corridorData.length > 0) {
        setSelectedAdminCorridor(corridorData[0].corridor);
        setAdminEditableRails(corridorData[0].rails);
      }
    }
    loadData();
  }, []);

  // Sync admin editable rails when corridor changes
  useEffect(() => {
    const found = corridors.find((c) => c.corridor === selectedAdminCorridor);
    if (found) {
      setAdminEditableRails(JSON.parse(JSON.stringify(found.rails)));
    }
  }, [selectedAdminCorridor, corridors]);

  // Load admin data when admin tab is activated (only for authenticated admin role)
  useEffect(() => {
    if (activeTab === 'admin' && currentUser?.role === 'admin') {
      async function loadAdminData() {
        try {
          const [overview, users] = await Promise.all([fetchAdminOverview(), fetchAdminUsers()]);
          setAdminOverview(overview);
          setAdminUsers(users);
        } catch (err: any) {
          console.error('Failed to load admin data:', err);
        }
      }
      loadAdminData();
    }
  }, [activeTab, currentUser]);

  // Update quote on form changes
  useEffect(() => {
    let isCancelled = false;
    async function updateQuote() {
      const q = await fetchRoutingQuote(sourceCurrency, targetCurrency, amount, strategy);
      if (!isCancelled) {
        setQuote(q);
        if (q.routes && q.routes.length > 0) {
          const recommended = q.routes.find((r) => r.isRecommended) || q.routes[0];
          setSelectedRoute(recommended);
        }
        setQuoteCountdown(120);
      }
    }
    updateQuote();
    return () => {
      isCancelled = true;
    };
  }, [sourceCurrency, targetCurrency, amount, strategy]);

  // Quote countdown ticker
  useEffect(() => {
    if (quoteCountdown <= 0) return;
    const timer = setInterval(() => {
      setQuoteCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [quoteCountdown]);

  const handleSelectSupplierForPayment = (supplier: Supplier) => {
    setSelectedSupplierId(supplier._id);
    setTargetCurrency(supplier.settlementCurrency);
    setActiveTab('router');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      let res: AuthResponse;
      if (authMode === 'login') {
        res = await loginApi(authEmail, authPassword);
      } else {
        res = await registerApi({
          name: authName,
          email: authEmail,
          password: authPassword,
          companyName: authCompanyName,
        });
      }

      setCurrentUser(res.user);
      setIsAuthModalOpen(false);

      const [supplierData, analyticsData] = await Promise.all([fetchSuppliers(), fetchAnalytics()]);
      setSuppliers(supplierData);
      setAnalytics(analyticsData);
      if (supplierData.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(supplierData[0]._id);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const email = 'treasury@globaltrade.io';
    const pwd = 'Password123!';
    setAuthEmail(email);
    setAuthPassword(pwd);
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await loginApi(email, pwd);
      setCurrentUser(res.user);
      setIsAuthModalOpen(false);

      const [supplierData, analyticsData] = await Promise.all([fetchSuppliers(), fetchAnalytics()]);
      setSuppliers(supplierData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      setAuthError(err.message || 'Demo login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('router');
    }
  };

  const handleExecuteTransfer = async () => {
    if (!selectedRoute) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      setAuthError('Please sign in or use 1-Click Demo Login to dispatch and record transfers.');
      return;
    }

    setIsExecuting(true);
    setExecutionError(null);

    try {
      const targetSupplier = suppliers.find((s) => s._id === selectedSupplierId) || suppliers[0];

      await executeTransferApi({
        supplierId: targetSupplier?._id || 'sup_1',
        invoiceNumber,
        sourceCurrency,
        sourceAmount: amount,
        targetCurrency,
        netLandingAmount: selectedRoute.netLandingAmount,
        routingDecision: {
          strategy,
          selectedRailId: selectedRoute.railId,
          selectedRailName: selectedRoute.name,
          selectedRailType: selectedRoute.railType,
        },
        pricingBreakdown: {
          midMarketRate: quote?.midMarketRate || 1.0,
          effectiveRate: selectedRoute.exchangeRate,
          spreadBps: selectedRoute.spreadBps,
          fixedFee: selectedRoute.fixedFee,
          percentageFeeAmount: selectedRoute.percentageFeeAmount,
          totalFeeSourceCurrency: selectedRoute.totalFees,
          benchmarkBankCost: selectedRoute.benchmarkBankCost,
          savedAmountSourceCurrency: selectedRoute.savingsAmount,
          profitSplitTake: selectedRoute.platformProfitSplit,
        },
        deliveryEstimateHours: selectedRoute.estimatedHours,
      });

      setExecutionSuccess(
        `Dispatched ${sourceCurrency} ${amount.toLocaleString()} to ${
          targetSupplier?.supplierName || 'Supplier'
        } via ${selectedRoute.name}! Recipient will receive ${targetCurrency} ${selectedRoute.netLandingAmount.toLocaleString()}.`
      );

      const updatedAnalytics = await fetchAnalytics();
      setAnalytics(updatedAnalytics);
    } catch (err: any) {
      setExecutionError(err.message || 'Failed to dispatch transfer.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Admin Actions
  const handleSaveRailTuning = async (railId: string) => {
    setAdminSavingRailId(railId);
    setAdminNotification(null);

    const targetRail = adminEditableRails.find((r) => r.railId === railId);
    if (!targetRail) return;

    try {
      await updateAdminRailConfig({
        corridor: selectedAdminCorridor,
        railId,
        spreadBps: Number(targetRail.spreadBps),
        fixedFee: Number(targetRail.fixedFee),
        percentageFee: Number(targetRail.percentageFee),
        estimatedHours: Number(targetRail.estimatedHours),
        isActive: Boolean(targetRail.isActive),
      });

      // Refresh corridor data everywhere
      const updatedCorridors = await fetchCorridors();
      setCorridors(updatedCorridors);

      // Re-trigger quote calculation
      const updatedQuote = await fetchRoutingQuote(sourceCurrency, targetCurrency, amount, strategy);
      setQuote(updatedQuote);

      setAdminNotification(`Successfully updated ${targetRail.name} on corridor ${selectedAdminCorridor}!`);
    } catch (err: any) {
      setAdminNotification(`Update notice: ${err.message || 'Config saved to local session'}`);
    } finally {
      setAdminSavingRailId(null);
    }
  };

  const handleUpdateUserPlan = async (userId: string, plan: 'fixed_retainer' | 'basis_point_split', bpsRate: number) => {
    try {
      await updateAdminUserPlan(userId, { pricingPlan: plan, basisPointSplitRate: bpsRate });
      const updatedUsers = await fetchAdminUsers();
      setAdminUsers(updatedUsers);
      setAdminNotification('Corporate client billing plan updated successfully.');
    } catch (err: any) {
      setAdminNotification(`Client update notice: ${err.message}`);
    }
  };

  const handleCreateNewCorridor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminCorridor({
        sourceCurrency: newCorridorSource.toUpperCase(),
        targetCurrency: newCorridorTarget.toUpperCase(),
        midMarketRate: Number(newCorridorMid),
      });

      const updatedCorridors = await fetchCorridors();
      setCorridors(updatedCorridors);
      setSelectedAdminCorridor(`${newCorridorSource.toUpperCase()}-${newCorridorTarget.toUpperCase()}`);
      setIsAddingCorridor(false);
      setAdminNotification(`Provisioned new corridor ${newCorridorSource}-${newCorridorTarget}!`);
    } catch (err: any) {
      setAdminNotification(`Corridor notice: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Cross-Border FX</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Router v2.4
                </span>
                {currentUser?.role === 'admin' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    SUPER ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Multi-Rail Spread Tracking & Remittance Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-400">Monetization:</span>
              <span className="text-cyan-400 font-semibold">$2,000/mo or 20 bps Profit Split</span>
            </div>

            {/* User Profile / Login Toggle */}
            {currentUser ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-3 sm:pl-4">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-medium text-slate-200">{currentUser.companyName || currentUser.name}</p>
                  <p className="text-[10px] text-emerald-400 capitalize">{currentUser.role?.replace('_', ' ') || 'Treasury Manager'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3 sm:pl-4">
                <span className="text-[11px] text-amber-400/90 hidden sm:inline-block bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  Guest Preview
                </span>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-semibold text-xs transition shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/60 overflow-x-auto">
          {[
            { id: 'router', label: 'Dynamic Remittance Router', icon: Zap },
            { id: 'spreads', label: 'Multi-Rail Spread Matrix', icon: TrendingDown },
            { id: 'suppliers', label: 'Commercial Suppliers', icon: Building2 },
            { id: 'analytics', label: 'Savings & Profit Split Audit', icon: DollarSign },
            ...(currentUser?.role === 'admin'
              ? [{ id: 'admin', label: 'Admin Control Center', icon: Sliders, isSpecial: true }]
              : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setExecutionSuccess(null);
                  setExecutionError(null);
                  setAdminNotification(null);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? tab.isSpecial
                      ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                      : 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? (tab.isSpecial ? 'text-purple-400' : 'text-emerald-400') : 'text-slate-500'}`} />
                {tab.label}
                {tab.isSpecial && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Alert for Dispatched Payments */}
        {executionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-start gap-3 shadow-lg animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Remittance Successfully Routed & Dispatched</p>
              <p className="text-xs text-emerald-400/90 mt-1">{executionSuccess}</p>
            </div>
            <button
              onClick={() => setExecutionSuccess(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Banner Alert for Admin Notifications */}
        {adminNotification && (
          <div className="p-4 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 flex items-start gap-3 shadow-lg animate-in fade-in">
            <Info className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Admin Control Notification</p>
              <p className="text-xs text-purple-300/90 mt-1">{adminNotification}</p>
            </div>
            <button
              onClick={() => setAdminNotification(null)}
              className="text-purple-400 hover:text-purple-200 text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Banner Alert for Execution Errors */}
        {executionError && (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 flex items-start gap-3 shadow-lg animate-in fade-in">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Transfer Execution Notice</p>
              <p className="text-xs text-rose-400/90 mt-1">{executionError}</p>
            </div>
            <button
              onClick={() => setExecutionError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: DYNAMIC REMITTANCE ROUTER */}
        {activeTab === 'router' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-400" />
                    <h2 className="font-semibold text-white text-base">Transfer Parameters</h2>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Quote Locks in {quoteCountdown}s
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Commercial Supplier
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => {
                      setSelectedSupplierId(e.target.value);
                      const s = suppliers.find((sup) => sup._id === e.target.value);
                      if (s) setTargetCurrency(s.settlementCurrency);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.supplierName} ({s.country} • {s.settlementCurrency})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Sending Currency</label>
                    <select
                      value={sourceCurrency}
                      onChange={(e) => setSourceCurrency(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Payout Currency</label>
                    <select
                      value={targetCurrency}
                      onChange={(e) => setTargetCurrency(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="EUR">EUR - Euro</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="BRL">BRL - Brazilian Real</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Transfer Amount ({sourceCurrency})</label>
                    <span className="text-[11px] text-slate-400">Interbank Mid: 1 {sourceCurrency} = {quote?.midMarketRate || '—'} {targetCurrency}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold">
                      $
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Math.max(100, Number(e.target.value)))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    {[25000, 50000, 100000, 250000].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                          amount === preset
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        ${(preset / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Dynamic Routing Priority Strategy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'LOWEST_COST', label: 'Lowest Cost', icon: TrendingDown, desc: 'Maximum net landed' },
                      { id: 'FASTEST_DELIVERY', label: 'Instant Rails', icon: Zap, desc: 'Sub-hour SLA' },
                      { id: 'MAX_RELIABILITY', label: 'Max Reliability', icon: ShieldCheck, desc: '99.5%+ Tier-1' },
                      { id: 'BALANCED', label: 'Balanced', icon: Sparkles, desc: 'Cost & speed blend' },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSel = strategy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setStrategy(opt.id as typeof strategy)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                            isSel
                              ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-medium text-xs">
                            <Icon className={`h-3.5 w-3.5 ${isSel ? 'text-emerald-400' : 'text-slate-400'}`} />
                            <span className={isSel ? 'text-emerald-300' : 'text-slate-300'}>{opt.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Commercial Invoice Ref</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. INV-2026-904"
                  />
                </div>
              </div>

              {quote && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      Traditional Bank SWIFT Benchmark
                    </span>
                    <span className="text-red-400 font-semibold">260 bps hidden spread + $45 wire</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-slate-800">
                    <span className="text-slate-400">Bank SWIFT Net Landed:</span>
                    <span className="font-mono text-slate-300">
                      {targetCurrency} {quote.benchmarkStandardBank.netLandingAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-slate-800">
                    <span className="text-slate-400">Commercial Bank Wire SLA:</span>
                    <span className="text-slate-400">48 - 72 Business Hours</span>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-400" />
                    Multi-Rail Spread & Route Evaluation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ranked dynamically across SWIFT, Local domestic clearing, and Fintech partners
                  </p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                  Live Spreads
                </div>
              </div>

              <div className="space-y-4">
                {quote?.routes?.map((route) => {
                  const isSelected = selectedRoute?.railId === route.railId;
                  const isOptimal = route.isRecommended;

                  return (
                    <div
                      key={route.railId}
                      onClick={() => setSelectedRoute(route)}
                      className={`relative cursor-pointer rounded-2xl p-5 transition border ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                              route.railType === 'LOCAL_RAILS'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                : route.railType === 'FINTECH_PARTNER'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {route.railType.replace('_', ' ')}
                          </span>
                          <h3 className="font-semibold text-sm text-white">{route.name}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          {isOptimal && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                              <Sparkles className="h-3 w-3" />
                              Optimal Route
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            Spread: {route.spreadBps} bps
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-800/70 text-xs">
                        <div>
                          <p className="text-slate-400 text-[11px]">Net Payout Amount</p>
                          <p className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
                            {targetCurrency} {route.netLandingAmount.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400 text-[11px]">Exchange Rate</p>
                          <p className="font-mono font-medium text-slate-200 mt-0.5">
                            1 {sourceCurrency} = {route.exchangeRate}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400 text-[11px]">Direct Transfer Fee</p>
                          <p className="font-mono font-medium text-slate-200 mt-0.5">
                            ${route.totalFees.toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400 text-[11px]">Delivery SLA</p>
                          <p className="font-medium text-slate-200 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-cyan-400" />
                            {route.estimatedHours < 2 ? '~1.5 hrs' : `${route.estimatedHours} hrs`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <TrendingDown className="h-3.5 w-3.5" />
                            Saves ${route.savingsAmount.toLocaleString()} ({route.savingsPercentage}%) vs High-Street Bank
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400">Platform Split:</span>
                          <span className="font-mono text-cyan-400 font-medium">
                            ${route.platformProfitSplit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedRoute && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <p className="text-xs text-slate-400">Selected Execution Rail</p>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {selectedRoute.name}
                        <span className="text-xs font-normal text-emerald-400">
                          (Net: {targetCurrency} {selectedRoute.netLandingAmount.toLocaleString()})
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={handleExecuteTransfer}
                      disabled={isExecuting}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-semibold text-sm text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Locking FX & Dispatching...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Execute Transfer to Supplier
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-RAIL SPREAD MATRIX */}
        {activeTab === 'spreads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-white">Live Multi-Rail Spread Matrix</h2>
                <p className="text-xs text-slate-400">
                  Real-time spread markup comparisons between SWIFT Correspondent Banking, Local Clearing, and Fintech Partners
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Info className="h-4 w-4 text-cyan-400" />
                1 Basis Point (bps) = 0.01%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {corridors.map((c) => (
                <div key={c.corridor} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="font-bold text-sm text-white">{c.corridor}</span>
                    <span className="text-xs font-mono text-slate-400">Mid-Market: {c.midMarketRate}</span>
                  </div>

                  <div className="space-y-3">
                    {c.rails.map((rail) => (
                      <div key={rail.railId} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-200">{rail.name}</span>
                          <span className="font-mono font-bold text-emerald-400">{rail.exchangeRate}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                          <span>Spread: <strong className="text-slate-300 font-mono">{rail.spreadBps} bps</strong></span>
                          <span>Fixed Fee: <strong className="text-slate-300 font-mono">${rail.fixedFee}</strong></span>
                          <span>SLA: <strong className="text-slate-300">{rail.estimatedHours}h</strong></span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              rail.spreadBps > 100
                                ? 'bg-rose-500'
                                : rail.spreadBps > 40
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, (rail.spreadBps / 300) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMMERCIAL SUPPLIERS */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-white">Commercial Suppliers & Beneficiaries</h2>
                <p className="text-xs text-slate-400">
                  International supplier directory with local rails, IBAN/SWIFT routing, and disbursement tracking
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4">Supplier / Beneficiary</th>
                      <th className="px-6 py-4">Country & Rail Currency</th>
                      <th className="px-6 py-4">Bank & Account / IBAN</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Routing Strategy</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {suppliers.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white text-sm">{s.supplierName}</p>
                          <p className="text-[11px] text-slate-400">{s.contactEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-medium text-slate-200">
                            {s.country} • {s.settlementCurrency}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-200">{s.bankName}</p>
                          <p className="text-[11px] font-mono text-slate-400">{s.accountNumberOrIban}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{s.category}</td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            {s.preferredRoutingStrategy.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleSelectSupplierForPayment(s)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium transition"
                          >
                            Route Payment
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAVINGS & PROFIT SPLIT AUDIT */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white">Treasury Savings & Profit Split Audit</h2>
              <p className="text-xs text-slate-400">
                Audited basis point savings realized against commercial bank SWIFT benchmarks
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <p className="text-xs text-slate-400">Total Routed Remittance Volume</p>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  ${analytics.totalVolumeUSD.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{analytics.totalTransfers} transactions completed</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <p className="text-xs text-slate-400">Commercial Bank Cost Benchmark</p>
                <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  ${analytics.totalBenchmarkCost.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">SWIFT fees + 260 bps hidden spread</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <p className="text-xs text-slate-400">Net Customer Treasury Savings</p>
                <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  ${analytics.totalClientSavings.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-400/80 mt-1">
                  {analytics.averageSavingsPercentage}% saved vs traditional wire
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <p className="text-xs text-slate-400">Monetization Profit Split Cut</p>
                <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                  ${analytics.monetization.totalProfitSplitEarned.toLocaleString()}
                </p>
                <p className="text-[11px] text-cyan-400/80 mt-1">
                  Tier: $2,000/mo or 20 bps Profit Split
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="font-semibold text-sm text-white">Execution Rails Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Fintech Partner Rails</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {analytics.railBreakdown.FINTECH_PARTNER} transfers
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Airwallex & Wise for sub-4h commercial payments</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Local Domestic Rails</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {analytics.railBreakdown.LOCAL_RAILS} transfers
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">SEPA Instant, ACH & NEFT domestic clearing</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">SWIFT Correspondent</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {analytics.railBreakdown.SWIFT} transfer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">High-value specialized jurisdiction wires</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADMIN CONTROL CENTER */}
        {activeTab === 'admin' && currentUser?.role !== 'admin' && (
          <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-rose-500/30 text-center space-y-4 shadow-2xl animate-in fade-in">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">403 Forbidden • Access Denied</h2>
              <p className="text-sm text-slate-400 mt-2">
                The Admin Control Center is restricted to authorized platform operators with role <span className="font-mono text-rose-400">admin</span>. 
                Guests and standard corporate treasury accounts cannot view or modify liquidity rails, profit splits, or user databases.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('router')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Return to Remittance Router
              </button>
              <button
                onClick={() => {
                  setAuthEmail('');
                  setAuthPassword('');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition shadow-md shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                Sign In with Admin Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Admin Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-purple-500/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs">
                    SYSTEM ADMINISTRATOR PANEL
                  </span>
                  <span className="text-xs text-slate-400">Real-Time Routing & Client Configuration</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">Platform Control & Liquidity Tuner</h2>
              </div>
            </div>

            {/* Platform Revenue & Global Statistics */}
            {adminOverview && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <p className="text-xs text-slate-400">Total Platform Revenue (Run-rate)</p>
                  <p className="text-2xl font-bold font-mono text-purple-400 mt-1">
                    ${adminOverview.totalPlatformRevenueUSD.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    ${adminOverview.monthlyRetainerRunRate.toLocaleString()} Retainers + ${adminOverview.totalProfitSplitEarned.toLocaleString()} Profit Splits
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <p className="text-xs text-slate-400">Total Commercial Volume Routed</p>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    ${adminOverview.totalVolumeUSD.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{adminOverview.totalTransfers} cross-border transactions</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <p className="text-xs text-slate-400">Corporate Enterprise Accounts</p>
                  <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    {adminOverview.totalUsers} Active
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {adminOverview.retainerClientsCount} on $2k Retainer • {adminOverview.bpsClientsCount} on Profit Split
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <p className="text-xs text-slate-400">Active Corridors & System Health</p>
                  <p className="text-2xl font-bold font-mono text-white mt-1">
                    {adminOverview.activeCorridorsCount} Corridors
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    Status: {adminOverview.systemHealth.status} (RAM: {adminOverview.systemHealth.memoryRssMb}MB)
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 1: LIVE RAIL & SPREAD TUNER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-purple-400" />
                    Live Rail Spread & SLA Tuner (Real-Time Margin Engine)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust rail spread markups in basis points (bps) or toggle the emergency rail kill-switch.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300 font-medium">Corridor:</label>
                  <select
                    value={selectedAdminCorridor}
                    onChange={(e) => setSelectedAdminCorridor(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  >
                    {corridors.map((c) => (
                      <option key={c.corridor} value={c.corridor}>
                        {c.corridor} (Mid: {c.midMarketRate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Rail Network</th>
                      <th className="px-4 py-3">Rail Category</th>
                      <th className="px-4 py-3">Spread (Basis Points)</th>
                      <th className="px-4 py-3">Fixed Wire Fee ($)</th>
                      <th className="px-4 py-3">Delivery SLA (Hours)</th>
                      <th className="px-4 py-3">Kill-Switch</th>
                      <th className="px-4 py-3 text-right">Apply</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {adminEditableRails.map((rail, idx) => (
                      <tr key={rail.railId} className="hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-semibold text-white">{rail.name}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {rail.railType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="1000"
                              value={rail.spreadBps}
                              onChange={(e) => {
                                const copy = [...adminEditableRails];
                                copy[idx].spreadBps = Number(e.target.value);
                                setAdminEditableRails(copy);
                              }}
                              className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-400 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <span className="text-slate-500 font-mono">bps</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">$</span>
                            <input
                              type="number"
                              step="0.5"
                              value={rail.fixedFee}
                              onChange={(e) => {
                                const copy = [...adminEditableRails];
                                copy[idx].fixedFee = Number(e.target.value);
                                setAdminEditableRails(copy);
                              }}
                              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.5"
                            value={rail.estimatedHours}
                            onChange={(e) => {
                              const copy = [...adminEditableRails];
                              copy[idx].estimatedHours = Number(e.target.value);
                              setAdminEditableRails(copy);
                            }}
                            className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...adminEditableRails];
                              copy[idx].isActive = !copy[idx].isActive;
                              setAdminEditableRails(copy);
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              rail.isActive !== false
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {rail.isActive !== false ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            {rail.isActive !== false ? 'Active Rail' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleSaveRailTuning(rail.railId)}
                            disabled={adminSavingRailId === rail.railId}
                            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs transition disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                          >
                            {adminSavingRailId === rail.railId ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: CORPORATE CLIENT ACCOUNTS & PRICING PLANS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cyan-400" />
                    Corporate Client Accounts & Monetization Tiers
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assign and manage client billing models: $2,000/mo flat retainer vs basis point (bps) profit split.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Client Company & Email</th>
                      <th className="px-4 py-3">User Role</th>
                      <th className="px-4 py-3">Current Monetization Model</th>
                      <th className="px-4 py-3">Profit Split Cut (bps)</th>
                      <th className="px-4 py-3">Account Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {adminUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{u.companyName || u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.pricingPlan}
                            onChange={(e) =>
                              handleUpdateUserPlan(
                                u._id,
                                e.target.value as 'fixed_retainer' | 'basis_point_split',
                                u.basisPointSplitRate
                              )
                            }
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-medium focus:outline-none"
                          >
                            <option value="fixed_retainer">$2,000/mo Flat Retainer</option>
                            <option value="basis_point_split">Basis Point Profit Split</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-emerald-400 font-bold">{u.basisPointSplitRate}%</span>
                            <span className="text-slate-500 text-[11px]">of savings</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-slate-500 font-mono">Enforced</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 3: PROVISION NEW CORRIDOR MODAL/FORM */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-emerald-400" />
                    Provision New Currency Corridor
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instantly deploy multi-rail quotes and domestic clearing for a new global currency pair.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateNewCorridor} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Source Currency (3 Letters)</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={newCorridorSource}
                    onChange={(e) => setNewCorridorSource(e.target.value.toUpperCase())}
                    placeholder="USD"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Target Currency (3 Letters)</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={newCorridorTarget}
                    onChange={(e) => setNewCorridorTarget(e.target.value.toUpperCase())}
                    placeholder="CAD"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Base Mid-Market Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newCorridorMid}
                    onChange={(e) => setNewCorridorMid(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-semibold text-slate-950 text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    Provision Corridor Rails
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* AUTHENTICATION & LOGIN MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {authMode === 'login' ? 'Corporate Treasury Login' : 'Register Treasury Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Access locked quotes, audit reports & commercial remittance execution
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Demo Sandbox Quick-Tour */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => handleDemoLogin()}
                disabled={authLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-emerald-400" />
                1-Click Client Sandbox Login (Elena Rostova - Corporate Treasury)
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-1.5">
                Note: Super Administrator privileges require manual authentication with verified admin credentials below.
              </p>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-2 text-slate-500">or enter credentials</span>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      required
                      value={authCompanyName}
                      onChange={(e) => setAuthCompanyName(e.target.value)}
                      placeholder="e.g. Apex Industrial Dynamics"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-medium text-slate-300 mb-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="treasury@globaltrade.io"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {authLoading ? 'Verifying...' : authMode === 'login' ? 'Sign In to Treasury' : 'Create Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  {authMode === 'login'
                    ? "Don't have an enterprise account? Register"
                    : 'Already registered? Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Cross-Border FX Spread & Remittance Router • Enterprise Treasury Architecture</p>
      </footer>
    </div>
  );
}
