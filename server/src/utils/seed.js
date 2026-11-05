import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Supplier } from '../models/Supplier.js';
import { RateFeed } from '../models/RateFeed.js';
import { Transfer } from '../models/Transfer.js';
import { DEFAULT_CORRIDORS, generateRailQuotes } from '../services/fxAggregator.service.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cross_border_fx';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await RateFeed.deleteMany({});
    await Transfer.deleteMany({});

    // 1. Create Default Corporate Treasury User
    const user = await User.create({
      name: 'Elena Rostova',
      email: 'treasury@globaltrade.io',
      password: 'Password123!',
      companyName: 'Apex Industrial Dynamics Ltd.',
      role: 'treasury_manager',
      pricingPlan: 'basis_point_split', // $2,000/mo or basis point profit split
      basisPointSplitRate: 20, // 20% of customer savings
    });

    console.log(`[Seed] Created User: ${user.email} (Password: Password123!)`);

    // 2. Create Global Suppliers
    const suppliers = await Supplier.insertMany([
      {
        userId: user._id,
        supplierName: 'Stuttgart Precision Bearings GmbH',
        contactEmail: 'invoicing@stuttgart-bearings.de',
        country: 'DE',
        settlementCurrency: 'EUR',
        bankName: 'Deutsche Bank AG',
        accountNumberOrIban: 'DE89370400440532013000',
        swiftBicOrRouting: 'DEUTDEDDFXX',
        category: 'Manufacturing',
        preferredRoutingStrategy: 'LOWEST_COST',
      },
      {
        userId: user._id,
        supplierName: 'Bharat Microelectronics Ltd.',
        contactEmail: 'accounts@bharatmicro.in',
        country: 'IN',
        settlementCurrency: 'INR',
        bankName: 'HDFC Bank Ltd.',
        accountNumberOrIban: '50200038192847',
        swiftBicOrRouting: 'HDFCINBBXXX',
        category: 'IT & Software',
        preferredRoutingStrategy: 'FASTEST_DELIVERY',
      },
      {
        userId: user._id,
        supplierName: 'Shenzhen Silicon Components Co.',
        contactEmail: 'export@shenzhensilicon.cn',
        country: 'SG', // Singapore Hub routing
        settlementCurrency: 'SGD',
        bankName: 'DBS Bank Ltd.',
        accountNumberOrIban: '003928172819',
        swiftBicOrRouting: 'DBSSSGSGXXX',
        category: 'Raw Materials',
        preferredRoutingStrategy: 'LOWEST_COST',
      },
      {
        userId: user._id,
        supplierName: 'Manchester Logistics Group Ltd.',
        contactEmail: 'freight@manchesterlogistics.co.uk',
        country: 'GB',
        settlementCurrency: 'GBP',
        bankName: 'Barclays Bank UK',
        accountNumberOrIban: 'GB29BARC20000087654321',
        swiftBicOrRouting: 'BARCGB22XXX',
        category: 'Logistics & Freight',
        preferredRoutingStrategy: 'MAX_RELIABILITY',
      },
      {
        userId: user._id,
        supplierName: 'São Paulo Agro-Commodities SA',
        contactEmail: 'finance@spagrocommodities.com.br',
        country: 'BR',
        settlementCurrency: 'BRL',
        bankName: 'Banco Itaú Unibanco',
        accountNumberOrIban: 'BR3800000000012345678901234',
        swiftBicOrRouting: 'ITAUBRSPXXX',
        category: 'Raw Materials',
        preferredRoutingStrategy: 'LOWEST_COST',
      },
    ]);

    console.log(`[Seed] Seeded ${suppliers.length} international suppliers.`);

    // 3. Seed Corridors & Rails
    for (const [corridor, data] of Object.entries(DEFAULT_CORRIDORS)) {
      const [src, tgt] = corridor.split('-');
      const rails = generateRailQuotes(src, tgt, data.midRate);
      await RateFeed.create({
        corridor,
        sourceCurrency: src,
        targetCurrency: tgt,
        midMarketRate: data.midRate,
        rails,
        lastUpdated: new Date(),
      });
    }
    console.log('[Seed] Corridors & dynamic rails seeded.');

    // 4. Seed Past Historical Transfers & Analytics
    const deSupplier = suppliers[0];
    const inSupplier = suppliers[1];
    const gbSupplier = suppliers[3];

    await Transfer.insertMany([
      {
        userId: user._id,
        supplierId: deSupplier._id,
        referenceNumber: 'TRX-948201-1029',
        invoiceNumber: 'INV-2026-081',
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
          midMarketRate: 0.924,
          effectiveRate: 0.9223,
          spreadBps: 28,
          fixedFee: 3.0,
          percentageFeeAmount: 180.0,
          totalFeeSourceCurrency: 183.0,
          benchmarkBankCost: 3945.0, // Commercial SWIFT bank: $45 wire + 260 bps
          savedAmountSourceCurrency: 3762.0,
          profitSplitTake: 752.4, // 20% of $3,762 savings
        },
        deliveryEstimateHours: 4,
        status: 'SETTLED',
        settledAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        userId: user._id,
        supplierId: inSupplier._id,
        referenceNumber: 'TRX-774012-4412',
        invoiceNumber: 'INV-BLR-4019',
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
          midMarketRate: 86.45,
          effectiveRate: 86.34,
          spreadBps: 45,
          fixedFee: 4.5,
          percentageFeeAmount: 68.0,
          totalFeeSourceCurrency: 72.5,
          benchmarkBankCost: 2255.0,
          savedAmountSourceCurrency: 2182.5,
          profitSplitTake: 436.5,
        },
        deliveryEstimateHours: 1.5,
        status: 'SETTLED',
        settledAt: new Date(Date.now() - 86400000 * 1),
      },
      {
        userId: user._id,
        supplierId: gbSupplier._id,
        referenceNumber: 'TRX-312984-9041',
        invoiceNumber: 'INV-MCR-992',
        sourceCurrency: 'USD',
        sourceAmount: 50000,
        targetCurrency: 'GBP',
        netLandingAmount: 39180.0,
        routingDecision: {
          strategy: 'LOWEST_COST',
          selectedRailId: 'wise',
          selectedRailName: 'Wise Business Engine',
          selectedRailType: 'FINTECH_PARTNER',
        },
        pricingBreakdown: {
          midMarketRate: 0.785,
          effectiveRate: 0.7836,
          spreadBps: 32,
          fixedFee: 2.5,
          percentageFeeAmount: 95.0,
          totalFeeSourceCurrency: 97.5,
          benchmarkBankCost: 1345.0,
          savedAmountSourceCurrency: 1247.5,
          profitSplitTake: 249.5,
        },
        deliveryEstimateHours: 2,
        status: 'IN_CLEARING',
      },
    ]);

    console.log('[Seed] Seeded historical transfer records & savings.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
