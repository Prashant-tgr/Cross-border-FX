import { getOrSeedCorridorRates } from './fxAggregator.service.js';

export const calculateRoutingQuotes = async ({
  sourceCurrency,
  targetCurrency,
  amount,
  strategy = 'LOWEST_COST',
  userPlan = 'basis_point_split',
  basisPointSplitRate = 20, // 20% of client savings
}) => {
  const feed = await getOrSeedCorridorRates(sourceCurrency, targetCurrency);
  const midMarket = feed.midMarketRate;

  // Standard Commercial Bank SWIFT Benchmark (260 bps hidden spread + $45 wire fee)
  const benchmarkSpreadBps = 260;
  const benchmarkRate = midMarket * (1 - benchmarkSpreadBps / 10000);
  const benchmarkWireFee = 45.0;
  const benchmarkNetLand = Math.max(0, (amount - benchmarkWireFee) * benchmarkRate);
  const benchmarkTotalCost = benchmarkWireFee + (midMarket - benchmarkRate) * Math.max(0, amount - benchmarkWireFee);

  const evaluatedRoutes = feed.rails.map((rail) => {
    const fixedFee = rail.fixedFee;
    const percentageFeeAmount = amount * rail.percentageFee;
    const directFees = fixedFee + percentageFeeAmount;

    const sourceAmountAfterDirectFees = Math.max(0, amount - directFees);
    const netLandingAmount = Number((sourceAmountAfterDirectFees * rail.exchangeRate).toFixed(2));

    // Hidden FX Spread cost compared to pure mid-market
    const spreadCost = (midMarket - rail.exchangeRate) * sourceAmountAfterDirectFees;
    const totalEffectiveCost = Number((directFees + spreadCost).toFixed(2));

    // Customer savings compared to the standard commercial bank wire
    const savingsAmount = Number(Math.max(0, benchmarkTotalCost - totalEffectiveCost).toFixed(2));
    const savingsPercentage = Number(((savingsAmount / benchmarkTotalCost) * 100).toFixed(1));

    // Monetization calculation: $2,000/mo flat retainer or Basis Point / Profit Split
    let platformProfitSplit = 0;
    if (userPlan === 'basis_point_split') {
      platformProfitSplit = Number((savingsAmount * (basisPointSplitRate / 100)).toFixed(2));
    }

    return {
      railId: rail.railId,
      name: rail.name,
      railType: rail.railType,
      exchangeRate: rail.exchangeRate,
      spreadBps: rail.spreadBps,
      fixedFee,
      percentageFeeAmount: Number(percentageFeeAmount.toFixed(2)),
      totalFees: Number(directFees.toFixed(2)),
      spreadCost: Number(spreadCost.toFixed(2)),
      totalEffectiveCost,
      netLandingAmount,
      estimatedHours: rail.estimatedHours,
      reliabilityScore: rail.reliabilityScore,
      benchmarkBankCost: Number(benchmarkTotalCost.toFixed(2)),
      savingsAmount,
      savingsPercentage,
      platformProfitSplit,
      corridor: `${sourceCurrency}-${targetCurrency}`,
    };
  });

  // Sorting logic based on strategy
  let sortedRoutes = [...evaluatedRoutes];
  if (strategy === 'LOWEST_COST') {
    sortedRoutes.sort((a, b) => b.netLandingAmount - a.netLandingAmount);
  } else if (strategy === 'FASTEST_DELIVERY') {
    sortedRoutes.sort((a, b) => a.estimatedHours - b.estimatedHours);
  } else if (strategy === 'MAX_RELIABILITY') {
    sortedRoutes.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
  } else {
    // BALANCED: Composite score (Weight: 50% Net landed, 30% Speed, 20% Reliability)
    sortedRoutes.sort((a, b) => {
      const scoreA = (a.netLandingAmount / amount) * 50 - a.estimatedHours * 2 + a.reliabilityScore * 0.2;
      const scoreB = (b.netLandingAmount / amount) * 50 - b.estimatedHours * 2 + b.reliabilityScore * 0.2;
      return scoreB - scoreA;
    });
  }

  // Assign recommendation badges
  const lowestCostRailId = [...evaluatedRoutes].sort((a, b) => b.netLandingAmount - a.netLandingAmount)[0]?.railId;
  const fastestRailId = [...evaluatedRoutes].sort((a, b) => a.estimatedHours - b.estimatedHours)[0]?.railId;

  const routesWithBadges = sortedRoutes.map((r, index) => {
    const badges = [];
    if (index === 0) badges.push('OPTIMAL_ROUTE');
    if (r.railId === lowestCostRailId) badges.push('LOWEST_COST');
    if (r.railId === fastestRailId) badges.push('FASTEST');
    return {
      ...r,
      badges,
      isRecommended: index === 0,
    };
  });

  return {
    quoteId: `QTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sourceCurrency,
    targetCurrency,
    sourceAmount: amount,
    midMarketRate: midMarket,
    benchmarkStandardBank: {
      name: 'Tier-1 High Street Commercial Bank (SWIFT)',
      wireFee: benchmarkWireFee,
      spreadBps: benchmarkSpreadBps,
      effectiveRate: Number(benchmarkRate.toFixed(5)),
      totalCost: Number(benchmarkTotalCost.toFixed(2)),
      netLandingAmount: Number(benchmarkNetLand.toFixed(2)),
      slaHours: 72,
    },
    monetizationModel: {
      plan: userPlan,
      retainerMonthly: 2000,
      basisPointSplitRate,
      appliedFee: routesWithBadges[0]?.platformProfitSplit || 0,
    },
    expiresInSeconds: 120, // 2-minute quote lock
    routes: routesWithBadges,
  };
};
