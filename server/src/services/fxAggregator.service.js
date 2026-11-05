import { RateFeed } from '../models/RateFeed.js';

// Base mid-market benchmarks
export const DEFAULT_CORRIDORS = {
  'USD-EUR': { midRate: 0.924, baseSwiftFee: 40, baseSwiftSpreadBps: 220 },
  'USD-INR': { midRate: 86.45, baseSwiftFee: 45, baseSwiftSpreadBps: 260 },
  'USD-GBP': { midRate: 0.785, baseSwiftFee: 40, baseSwiftSpreadBps: 210 },
  'GBP-EUR': { midRate: 1.177, baseSwiftFee: 35, baseSwiftSpreadBps: 200 },
  'USD-SGD': { midRate: 1.348, baseSwiftFee: 40, baseSwiftSpreadBps: 230 },
  'EUR-BRL': { midRate: 6.085, baseSwiftFee: 50, baseSwiftSpreadBps: 290 },
  'USD-JPY': { midRate: 153.2, baseSwiftFee: 45, baseSwiftSpreadBps: 240 },
  'USD-MXN': { midRate: 20.15, baseSwiftFee: 40, baseSwiftSpreadBps: 270 },
};

/**
 * Builds real-time rail quote options for a given corridor and mid-market rate.
 */
export const generateRailQuotes = (sourceCurrency, targetCurrency, midRate) => {
  // SWIFT Traditional Rail (Correspondent Banking)
  const swiftSpreadBps = 240; // 2.40% spread
  const swiftRate = midRate * (1 - swiftSpreadBps / 10000);

  // Local Clearing Rails (e.g. SEPA in EUR, ACH/FedNow in USD, Pix in BRL, UPI/NEFT in INR, Faster Payments in GBP)
  const localSpreadBps = 45; // 0.45% spread
  const localRate = midRate * (1 - localSpreadBps / 10000);

  // Fintech Partners (Airwallex, Wise, Nium)
  const wiseSpreadBps = 32;
  const wiseRate = midRate * (1 - wiseSpreadBps / 10000);

  const airwallexSpreadBps = 28;
  const airwallexRate = midRate * (1 - airwallexSpreadBps / 10000);

  const niumSpreadBps = 35;
  const niumRate = midRate * (1 - niumSpreadBps / 10000);

  return [
    {
      railId: 'swift',
      name: 'SWIFT Correspondent Network',
      railType: 'SWIFT',
      exchangeRate: Number(swiftRate.toFixed(5)),
      spreadBps: swiftSpreadBps,
      fixedFee: 45.0, // Fixed bank wire charge
      percentageFee: 0.0015, // 0.15% intermediary lift
      estimatedHours: 48, // 2-3 business days
      reliabilityScore: 99.5,
      supportedCorridors: [`${sourceCurrency}-${targetCurrency}`],
      isActive: true,
    },
    {
      railId: 'local_clearing',
      name: `Local Domestic Rail (${targetCurrency === 'EUR' ? 'SEPA Instant' : targetCurrency === 'INR' ? 'NEFT/IMPS' : targetCurrency === 'GBP' ? 'Faster Payments' : targetCurrency === 'BRL' ? 'Pix' : 'Local Clearing'})`,
      railType: 'LOCAL_RAILS',
      exchangeRate: Number(localRate.toFixed(5)),
      spreadBps: localSpreadBps,
      fixedFee: 4.5,
      percentageFee: 0.0008,
      estimatedHours: 1.5, // 1-2 hours SLA
      reliabilityScore: 99.1,
      supportedCorridors: [`${sourceCurrency}-${targetCurrency}`],
      isActive: true,
    },
    {
      railId: 'airwallex',
      name: 'Airwallex Treasury Rail',
      railType: 'FINTECH_PARTNER',
      exchangeRate: Number(airwallexRate.toFixed(5)),
      spreadBps: airwallexSpreadBps,
      fixedFee: 3.0,
      percentageFee: 0.0012,
      estimatedHours: 4,
      reliabilityScore: 99.4,
      supportedCorridors: [`${sourceCurrency}-${targetCurrency}`],
      isActive: true,
    },
    {
      railId: 'wise',
      name: 'Wise Business Engine',
      railType: 'FINTECH_PARTNER',
      exchangeRate: Number(wiseRate.toFixed(5)),
      spreadBps: wiseSpreadBps,
      fixedFee: 2.5,
      percentageFee: 0.0019,
      estimatedHours: 2,
      reliabilityScore: 99.8,
      supportedCorridors: [`${sourceCurrency}-${targetCurrency}`],
      isActive: true,
    },
    {
      railId: 'nium',
      name: 'Nium Global FX Rail',
      railType: 'FINTECH_PARTNER',
      exchangeRate: Number(niumRate.toFixed(5)),
      spreadBps: niumSpreadBps,
      fixedFee: 3.5,
      percentageFee: 0.0014,
      estimatedHours: 3,
      reliabilityScore: 98.9,
      supportedCorridors: [`${sourceCurrency}-${targetCurrency}`],
      isActive: true,
    },
  ];
};

/**
 * Ensures rate feeds exist or refreshes them with realistic market fluctuations.
 */
export const getOrSeedCorridorRates = async (sourceCurrency, targetCurrency) => {
  const corridorKey = `${sourceCurrency.toUpperCase()}-${targetCurrency.toUpperCase()}`;
  let feed = await RateFeed.findOne({ corridor: corridorKey });

  const benchmark = DEFAULT_CORRIDORS[corridorKey] || {
    midRate: 1.0,
    baseSwiftFee: 40,
    baseSwiftSpreadBps: 250,
  };

  // Add realistic micro-fluctuation (+/- 0.05%)
  const jitter = (Math.random() - 0.5) * 0.001;
  const currentMidRate = Number((benchmark.midRate * (1 + jitter)).toFixed(5));

  const rails = generateRailQuotes(sourceCurrency, targetCurrency, currentMidRate);

  if (!feed) {
    feed = await RateFeed.create({
      corridor: corridorKey,
      sourceCurrency: sourceCurrency.toUpperCase(),
      targetCurrency: targetCurrency.toUpperCase(),
      midMarketRate: currentMidRate,
      rails,
      lastUpdated: new Date(),
    });
  } else {
    feed.midMarketRate = currentMidRate;
    feed.rails = rails;
    feed.lastUpdated = new Date();
    await feed.save();
  }

  return feed;
};
