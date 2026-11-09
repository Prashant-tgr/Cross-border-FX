import { User } from '../models/User.js';
import { Transfer } from '../models/Transfer.js';
import { RateFeed } from '../models/RateFeed.js';
import { AppError } from '../middleware/error.js';
import { generateRailQuotes } from '../services/fxAggregator.service.js';

export const getAdminOverview = async (req, res, next) => {
  try {
    const [users, transfers, corridors] = await Promise.all([
      User.find({}),
      Transfer.find({}),
      RateFeed.find({}),
    ]);

    const totalUsers = users.length;
    const retainerClientsCount = users.filter((u) => u.pricingPlan === 'fixed_retainer').length;
    const bpsClientsCount = users.filter((u) => u.pricingPlan === 'basis_point_split').length;

    let totalVolumeUSD = 0;
    let totalClientSavingsUSD = 0;
    let totalProfitSplitRevenueUSD = 0;

    transfers.forEach((t) => {
      totalVolumeUSD += t.sourceAmount || 0;
      totalClientSavingsUSD += t.pricingBreakdown?.savedAmountSourceCurrency || 0;
      totalProfitSplitRevenueUSD += t.pricingBreakdown?.profitSplitTake || 0;
    });

    // Total platform revenue = monthly retainers ($2,000 * count) + profit split cut
    const retainerRevenueMonthly = retainerClientsCount * 2000;
    const totalPlatformRevenue = Number((retainerRevenueMonthly + totalProfitSplitRevenueUSD).toFixed(2));

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        retainerClientsCount,
        bpsClientsCount,
        totalTransfers: transfers.length,
        totalVolumeUSD: Number(totalVolumeUSD.toFixed(2)),
        totalClientSavingsUSD: Number(totalClientSavingsUSD.toFixed(2)),
        totalPlatformRevenueUSD: totalPlatformRevenue,
        monthlyRetainerRunRate: retainerRevenueMonthly,
        totalProfitSplitEarned: Number(totalProfitSplitRevenueUSD.toFixed(2)),
        activeCorridorsCount: corridors.length,
        systemHealth: {
          status: 'OPERATIONAL',
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          memoryRssMb: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, pricingPlan, basisPointSplitRate, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (role !== undefined) user.role = role;
    if (pricingPlan !== undefined) user.pricingPlan = pricingPlan;
    if (basisPointSplitRate !== undefined) user.basisPointSplitRate = Number(basisPointSplitRate);
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    await user.save();

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCorridorsAdmin = async (req, res, next) => {
  try {
    const corridors = await RateFeed.find({}).sort({ corridor: 1 });
    res.status(200).json({
      status: 'success',
      results: corridors.length,
      data: corridors,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRailConfig = async (req, res, next) => {
  try {
    const { corridor, railId, spreadBps, fixedFee, percentageFee, estimatedHours, isActive } = req.body;

    const feed = await RateFeed.findOne({ corridor });
    if (!feed) {
      return next(new AppError(`Corridor ${corridor} not found`, 404));
    }

    const railIndex = feed.rails.findIndex((r) => r.railId === railId);
    if (railIndex === -1) {
      return next(new AppError(`Rail ${railId} not found in corridor ${corridor}`, 404));
    }

    if (spreadBps !== undefined) {
      feed.rails[railIndex].spreadBps = Number(spreadBps);
      // Recalculate exchange rate based on new spread
      feed.rails[railIndex].exchangeRate = Number((feed.midMarketRate * (1 - Number(spreadBps) / 10000)).toFixed(5));
    }
    if (fixedFee !== undefined) feed.rails[railIndex].fixedFee = Number(fixedFee);
    if (percentageFee !== undefined) feed.rails[railIndex].percentageFee = Number(percentageFee);
    if (estimatedHours !== undefined) feed.rails[railIndex].estimatedHours = Number(estimatedHours);
    if (isActive !== undefined) feed.rails[railIndex].isActive = Boolean(isActive);

    feed.lastUpdated = new Date();
    await feed.save();

    res.status(200).json({
      status: 'success',
      data: feed,
    });
  } catch (error) {
    next(error);
  }
};

export const createCorridorAdmin = async (req, res, next) => {
  try {
    const { sourceCurrency, targetCurrency, midMarketRate } = req.body;
    const corridorKey = `${sourceCurrency.toUpperCase()}-${targetCurrency.toUpperCase()}`;

    let existing = await RateFeed.findOne({ corridor: corridorKey });
    if (existing) {
      return next(new AppError(`Corridor ${corridorKey} already exists`, 400));
    }

    const rails = generateRailQuotes(sourceCurrency, targetCurrency, Number(midMarketRate));

    const newFeed = await RateFeed.create({
      corridor: corridorKey,
      sourceCurrency: sourceCurrency.toUpperCase(),
      targetCurrency: targetCurrency.toUpperCase(),
      midMarketRate: Number(midMarketRate),
      rails,
      lastUpdated: new Date(),
    });

    res.status(201).json({
      status: 'success',
      data: newFeed,
    });
  } catch (error) {
    next(error);
  }
};
